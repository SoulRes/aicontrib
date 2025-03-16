import admin from "firebase-admin";
import crypto from "crypto";

// ✅ Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || "{}")),
    });
}

const db = admin.firestore();

export const config = { api: { bodyParser: false } }; // 🚨 Disable JSON parsing for raw body handling

export default async function handler(req, res) {
    console.log("🔄 Incoming request:", req.method, req.headers);

    if (req.method !== "POST") {
        console.warn("🚫 Method not allowed:", req.method);
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        let rawBody = "";
        await new Promise((resolve, reject) => {
            req.on("data", chunk => (rawBody += chunk));
            req.on("end", resolve);
            req.on("error", reject);
        });

        const isBTCPayWebhook = req.headers["btcpay-sig"];
        
        if (isBTCPayWebhook) {
            console.log("📡 Received BTCPay Webhook");

            const secret = process.env.BTCPAY_WEBHOOK_SECRET;
            if (!secret) {
                console.error("🚨 Missing BTCPAY_WEBHOOK_SECRET");
                return res.status(500).json({ error: "Webhook secret not set" });
            }

            const receivedSignature = req.headers["btcpay-sig"];
            const computedSignature = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

            console.log("🔄 Raw Payload:", rawBody);
            console.log("🔐 Validating signature: Received:", receivedSignature, "Computed:", computedSignature);

            if (receivedSignature !== computedSignature) {
                console.error("❌ Unauthorized: Invalid Signature");
                return res.status(401).json({ error: "Unauthorized: Invalid Signature" });
            }

            // ✅ Extract Webhook Data
            const bodyJson = JSON.parse(rawBody);
            console.log("📡 Full Webhook Payload:", JSON.stringify(bodyJson, null, 2));

            const invoiceId = bodyJson.invoiceId || bodyJson.data?.invoiceId;
            const status = bodyJson.status || bodyJson.data?.status;
            const userEmail = bodyJson.userEmail || bodyJson.metadata?.userEmail; // 🔹 Ensure userEmail is extracted
            const eventType = bodyJson.type; // 🔹 Identify event type

            console.log("💰 Payment Data:", { invoiceId, status, userEmail, eventType });

            // ✅ Ensure it's an Invoice Settled event
            if (!["InvoiceSettled", "InvoiceProcessing", "complete"].includes(eventType) && status !== "complete") {
                console.warn(`⚠️ Ignoring webhook event: ${eventType}`);
                return res.status(400).json({ error: "Ignoring non-payment event" });
            }

            if (!userEmail) {
                console.error("🚨 Missing userEmail in webhook data");
                return res.status(400).json({ error: "Invalid userEmail" });
            }

            const userDocRef = db.collection("users").doc(userEmail);
            const userDoc = await userDocRef.get();

            if (!userDoc.exists) {
                console.error("❌ User not found for userEmail:", userEmail);
                return res.status(404).json({ error: "User not found" });
            }

            // ✅ Activate User
            await userDocRef.update({ status: "Activated", activationDate: admin.firestore.FieldValue.serverTimestamp() });
            console.log("✅ User Activated:", userEmail);
            return res.json({ success: true, message: "Payment processed successfully" });
        }

        return res.status(400).json({ error: "Not a BTCPay Webhook" });
    } catch (error) {
        console.error("🚨 Error processing payment:", error);
        return res.status(500).json({ error: "Server error" });
    }
}
