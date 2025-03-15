import admin from "firebase-admin";
import crypto from "crypto";

// ✅ Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || "{}")),
    });
}

const db = admin.firestore();

export default async function handler(req, res) {
    console.log("🔄 Incoming request:", req.method, req.headers);

    if (req.method !== "POST") {
        console.warn("🚫 Method not allowed:", req.method);
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const isBTCPayWebhook = req.headers["btcpay-sig"];
        
        if (isBTCPayWebhook) {
            console.log("📡 Received BTCPay Webhook");
            
            const secret = process.env.BTCPAY_WEBHOOK_SECRET;
            if (!secret) {
                console.error("🚨 Missing BTCPAY_WEBHOOK_SECRET");
                return res.status(500).json({ error: "Webhook secret not set" });
            }
            
            const receivedSignature = req.headers["btcpay-sig"];
            const payload = JSON.stringify(req.body);
            console.log("🔄 Raw Payload:", payload);
            
            const computedSignature = `sha256=${crypto.createHmac("sha256", secret).update(payload).digest("hex")}`;
            console.log("🔐 Validating signature: Received:", receivedSignature, "Computed:", computedSignature);
            
            if (receivedSignature !== computedSignature) {
                console.error("❌ Unauthorized: Invalid Signature");
                return res.status(401).json({ error: "Unauthorized: Invalid Signature" });
            }
            
            // ✅ Extract payment details (debugging full payload structure)
            console.log("📡 Full Webhook Payload:", JSON.stringify(req.body, null, 2));

            const invoiceId = req.body.invoiceId || req.body.data?.invoiceId;
            const status = req.body.status || req.body.data?.status || req.body.type;
            const metadata = req.body.metadata || req.body.data?.metadata || {}; // Extract metadata if available
            const userId = metadata.userId || null;  // Get userId from metadata
            const referralCode = metadata.referralCode || null;  // Get referralCode from metadata

            console.log("💰 Payment Data:", { invoiceId, status, userId, referralCode });

            if (!userId) {
                console.error("🚨 Missing userId in webhook metadata");
                return res.status(400).json({ error: "Invalid userId" });
            }

            if (status !== "complete" && status !== "InvoicePaymentSettled") {
                console.warn("⚠️ Payment not completed, ignoring.");
                return res.status(400).json({ error: "Payment not completed" });
            }
            
            const userDocRef = db.collection("users").doc(userId);
            const userDoc = await userDocRef.get();

            if (!userDoc.exists) {
                console.error("❌ User not found for userId:", userId);
                return res.status(404).json({ error: "User not found" });
            }

            // ✅ Activate User
            await userDocRef.update({ status: "Activated", activationDate: admin.firestore.FieldValue.serverTimestamp() });
            console.log("✅ User Activated:", userId);

            // ✅ Process Referral Bonus if referralCode exists
            if (referralCode) {
                const referrerSnapshot = await db.collection("users")
                    .where("referralCode", "==", referralCode)
                    .limit(1)
                    .get();

                if (!referrerSnapshot.empty) {
                    const referrerId = referrerSnapshot.docs[0].id;
                    console.log("🏆 Referral bonus applied for:", referrerId);

                    await db.collection("users").doc(referrerId).update({
                        usdt: admin.firestore.FieldValue.increment(150),
                        referralCount: admin.firestore.FieldValue.increment(1)
                    });

                    await db.collection("users").doc(referrerId).collection("referrals").doc(userId).set({
                        status: "Paid",
                        bonusEarned: 150,
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    console.warn("⚠️ Invalid referral code:", referralCode);
                }
            }

            return res.json({ success: true, message: "Payment processed successfully" });
        }

        return res.status(400).json({ error: "Invalid request" });

    } catch (error) {
        console.error("🚨 Error processing payment:", error);
        return res.status(500).json({ error: "Server error" });
    }
}
