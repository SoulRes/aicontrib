import admin from "firebase-admin";
import crypto from "crypto";
import { buffer } from "micro"; // Needed to handle raw body

// ✅ Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || "{}")),
    });
}

const db = admin.firestore();

export const config = { api: { bodyParser: false } }; // 🚨 Disable automatic body parsing

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

            // ✅ Read raw request body (VERY IMPORTANT)
            const rawBody = await buffer(req); // Get raw body
            const receivedSignature = req.headers["btcpay-sig"];
            const computedSignature = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

            console.log("🔄 Raw Payload:", rawBody.toString());
            console.log("🔐 Validating signature: Received:", receivedSignature, "Computed:", computedSignature);

            if (receivedSignature !== computedSignature) {
                console.error("❌ Unauthorized: Invalid Signature");
                return res.status(401).json({ error: "Unauthorized: Invalid Signature" });
            }

            // ✅ Extract payment details
            const bodyJson = JSON.parse(rawBody.toString());
            console.log("📡 Full Webhook Payload:", JSON.stringify(bodyJson, null, 2));

            const invoiceId = bodyJson.invoiceId || bodyJson.data?.invoiceId;
            const status = bodyJson.status || bodyJson.data?.status;
            const userId = bodyJson.userId || bodyJson.data?.userId;

            console.log("💰 Payment Data:", { invoiceId, status, userId });

            if (status !== "complete") {
                console.warn("⚠️ Payment not completed, ignoring.");
                return res.status(400).json({ error: "Payment not completed" });
            }

            if (!userId) {
                console.error("🚨 Missing userId in webhook data");
                return res.status(400).json({ error: "Invalid userId" });
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
            return res.json({ success: true, message: "Payment processed successfully" });
        }

        return res.status(400).json({ error: "Not a BTCPay Webhook" });
    } catch (error) {
        console.error("🚨 Error processing payment:", error);
        return res.status(500).json({ error: "Server error" });
    }
}
