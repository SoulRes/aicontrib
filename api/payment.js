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
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    // 🔹 Check if request is from BTCPay webhook
    const isBTCPayWebhook = req.headers["btcpay-sig"];
    
    if (isBTCPayWebhook) {
        console.log("📡 Received BTCPay Webhook");

        try {
            const signature = req.headers["btcpay-sig"];
            const payload = JSON.stringify(req.body);
            const secret = process.env.BTCPAY_WEBHOOK_SECRET;

            // ✅ Validate Webhook Signature
            const hash = crypto.createHmac("sha256", secret).update(payload).digest("hex");
            if (signature !== hash) {
                return res.status(401).json({ error: "Unauthorized: Invalid Signature" });
            }

            // ✅ Extract payment details
            const { invoiceId, status, buyerEmail } = req.body;
            console.log("💰 Payment Received:", { invoiceId, status, buyerEmail });

            if (status !== "complete") {
                return res.status(400).json({ error: "Payment not completed" });
            }

            // ✅ Update Firestore (Activate user)
            const userRef = db.collection("users").doc(buyerEmail);
            await userRef.update({ status: "Activated", activationDate: admin.firestore.FieldValue.serverTimestamp() });

            console.log("✅ User Activated:", buyerEmail);
            return res.json({ success: true, message: "Payment processed successfully" });
        } catch (error) {
            console.error("🚨 Error processing BTCPay webhook:", error);
            return res.status(500).json({ error: "Server error" });
        }
    }

    // 🔹 Manual Payment Confirmation (Frontend Call)
    const { userId, amountPaid, referralCode } = req.body;
    console.log("🛠 Processing payment for:", userId, "Amount:", amountPaid, "Referral Code:", referralCode);

    try {
        const userDocRef = db.collection("users").doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!referralCode) {
            return res.json({ message: "No referral linked to this purchase" });
        }

        // ✅ Find Referrer
        const referrerSnapshot = await db.collection("users")
            .where("referralCode", "==", referralCode)
            .limit(1)
            .get();

        if (referrerSnapshot.empty) {
            return res.status(404).json({ error: "Invalid referral code" });
        }

        const referrerId = referrerSnapshot.docs[0].id;

        // ✅ Update Referrer Balance & Referral Count
        await db.collection("users").doc(referrerId).update({
            usdt: admin.firestore.FieldValue.increment(150),
            referralCount: admin.firestore.FieldValue.increment(1)
        });

        // ✅ Update Referral Status
        await db.collection("users").doc(referrerId).collection("referrals").doc(userId).set({
            status: "Paid",
            bonusEarned: 150,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        // ✅ Activate User
        await userDocRef.update({ status: "Activated", activationDate: admin.firestore.FieldValue.serverTimestamp() });

        console.log("✅ Payment Success: User Activated!");
        return res.json({ success: true, message: "Payment recorded, referrer updated, and account activated" });
    } catch (error) {
        console.error("🚨 Error processing payment:", error);
        return res.status(500).json({ error: "Server error" });
    }
}

