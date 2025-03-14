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
        // 🔹 Check if request is from BTCPay webhook
        const isBTCPayWebhook = req.headers["btcpay-sig"];
        
        if (isBTCPayWebhook) {
            console.log("📡 Received BTCPay Webhook");
            const signature = req.headers["btcpay-sig"];
            const payload = JSON.stringify(req.body, null, 0); // Ensure consistent formatting
            console.log("🔄 Raw Payload:", payload);
            const secret = process.env.BTCPAY_WEBHOOK_SECRET;
            if (!secret) {
                console.error("🚨 Missing BTCPAY_WEBHOOK_SECRET");
                return res.status(500).json({ error: "Webhook secret not set" });
            }

            const receivedSignature = req.headers["btcpay-sig"];
            const computedSignature = crypto.createHmac("sha256", secret).update(Buffer.from(payload)).digest("hex");

            console.log("🔐 Validating signature: Received:", receivedSignature, "Computed:", computedSignature);

            if (receivedSignature !== computedSignature) {
                console.error("❌ Unauthorized: Invalid Signature");
                return res.status(401).json({ error: "Unauthorized: Invalid Signature" });
            }

            // ✅ Extract payment details
            const { invoiceId, status, userId } = req.body;
            console.log("💰 Payment Data:", { invoiceId, status, userId });

            if (status !== "complete") {
                console.warn("⚠️ Payment not completed, ignoring.");
                return res.status(400).json({ error: "Payment not completed" });
            }

            if (!userId) {
                console.error("🚨 Missing userId in webhook data");
                return res.status(400).json({ error: "Invalid userId" });
            }

            // ✅ Find user by userId
            const userDocRef = db.collection("users").doc(userId);
            const userDoc = await userDocRef.get();

            if (!userDoc.exists) {
                console.error("❌ User not found for userId:", userId);
                return res.status(404).json({ error: "User not found" });
            }

            // ✅ Activate User
            await userDocRef.update({ status: "Activated", activationDate: admin.firestore.FieldValue.serverTimestamp() });
            console.log("✅ User Activated:", userId);
            return res.json({ success: true, message: "Payment processed successfully" });
        }

        // 🔹 Manual Payment Confirmation (Frontend Call)
        const { userId, amountPaid, referralCode } = req.body;
        console.log("🛠 Processing manual payment for:", userId, "Amount:", amountPaid, "Referral Code:", referralCode);

        if (!userId) {
            console.error("🚨 Missing userId in manual payment request");
            return res.status(400).json({ error: "Invalid userId" });
        }

        const userDocRef = db.collection("users").doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            console.error("❌ User not found for userId:", userId);
            return res.status(404).json({ error: "User not found" });
        }

        if (referralCode) {
            // ✅ Find Referrer
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

        // ✅ Activate User
        await userDocRef.update({ status: "Activated", activationDate: admin.firestore.FieldValue.serverTimestamp() });
        console.log("✅ Payment Success: User Activated!");
        return res.json({ success: true, message: "Payment recorded, referrer updated, and account activated" });
    } catch (error) {
        console.error("🚨 Error processing payment:", error);
        return res.status(500).json({ error: "Server error" });
    }
}
