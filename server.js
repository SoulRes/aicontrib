import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";

// ✅ Load environment variables
dotenv.config();

// ✅ Get current directory (__dirname workaround for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Initialize Firebase (Move the Import Below This)
try {
    if (!admin.apps.length) {
        console.log("🔥 Initializing Firebase...");

        let serviceAccount;

        if (process.env.FIREBASE_CREDENTIALS) {
            console.log("✅ Using Firebase credentials from ENV");
            serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
        } else {
            console.log("✅ Using local serviceAccountKey.json");
            serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, "config", "serviceAccountKey.json"), "utf-8"));
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
        });

        console.log("✅ Firebase initialized successfully!");
    } else {
        console.log("✅ Firebase is already initialized.");
    }
} catch (error) {
    console.error("🚨 Firebase initialization failed:", error);
    process.exit(1);
}

const db = admin.firestore();
const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors({
    origin: "*",  
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
}));

// ✅ Fix: Import check-referral AFTER Firebase Initialization
import checkReferralRoute from "./api/check-referral.js";

// ✅ Use the referral validation API properly
app.use("/api/check-referral", checkReferralRoute);

// ✅ Log API Keys & Credentials
console.log("🛠️ BTCPay API Key:", process.env.BTCPAY_API_KEY || "Not Found");
console.log("🛠️ BTCPay Store ID:", process.env.BTCPAY_STORE_ID || "Not Found");
console.log("🛠️ BTCPay URL:", process.env.BTCPAY_URL || "Not Found");

/**
 * ✅ API: Check Referral Code Validity
 */
app.post("/api/check-referral", async (req, res) => {
    const { referralCode } = req.body;

    console.log("🔍 Checking referral code:", referralCode);

    if (!referralCode) {
        return res.status(400).json({ error: "Referral code is required" });
    }

    try {
        const querySnapshot = await db
            .collection("users")
            .where("referralCode", "==", referralCode)
            .get();

        if (querySnapshot.empty) {
            console.log("❌ Invalid referral code:", referralCode);
            return res.status(404).json({ valid: false, message: "Invalid referral code" });
        }

        console.log("✅ Valid referral code:", referralCode);
        res.json({ valid: true, message: "Referral code is valid" });
    } catch (error) {
        console.error("🔥 Error checking referral code:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * ✅ API: Create Payment using BTCPay
 */
app.post("/api/create-payment", async (req, res) => {
    const { price, currency, orderId } = req.body;

    console.log("💰 Creating payment:", { price, currency, orderId });

    try {
        const btcpayUrl = `${process.env.BTCPAY_URL}/stores/${process.env.BTCPAY_STORE_ID}/invoices`;

        const response = await fetch(btcpayUrl, {
            method: "POST",
            headers: {
                Authorization: `token ${process.env.BTCPAY_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                metadata: { orderId, itemDesc: "My Product", posData: {} },
                checkout: {
                    speedPolicy: "HighSpeed",
                    redirectURL: process.env.SUCCESS_URL,
                    redirectAutomatically: true,
                    requiresRefundEmail: false,
                },
                amount: price,
                currency: currency,
            }),
        });

        const data = await response.json();

        if (response.ok && data.id) {
            const checkoutUrl = `${process.env.BTCPAY_URL}/i/${data.id}`;
            console.log("✅ Payment successful! Redirecting to:", checkoutUrl);
            return res.status(200).json({ paymentUrl: checkoutUrl });
        } else {
            console.error("❌ Payment error:", data);
            return res.status(500).json({ error: data.error || "Error creating payment" });
        }
    } catch (error) {
        console.error("🔥 Payment request error:", error);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * ✅ API: Handle BTCPay IPN Callback
 */
app.post("/api/payment-callback", (req, res) => {
    const paymentData = req.body;

    console.log("🔄 IPN Callback received:", paymentData);

    if (paymentData.status === "complete") {
        console.log("✅ Payment confirmed:", paymentData);
    } else if (paymentData.status === "failed") {
        console.log("❌ Payment failed:", paymentData);
    }

    res.status(200).send("IPN callback received");
});

// ✅ Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// ✅ Serve index.html for root route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export { db };  // ✅ Make Firestore DB accessible in other files
