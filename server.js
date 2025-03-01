import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Initialize Firebase
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
    }
} catch (error) {
    console.error("🚨 Firebase initialization failed:", error);
    process.exit(1);
}

const db = admin.firestore();
const app = express();

app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
}));

console.log("🛠️ BTCPay API Key:", process.env.BTCPAY_API_KEY || "Not Found");
console.log("🛠️ BTCPay Store ID:", process.env.BTCPAY_STORE_ID || "Not Found");
console.log("🛠️ BTCPay URL:", process.env.BTCPAY_URL || "Not Found");

// ✅ Lazy Load Routes AFTER Firebase is initialized
(async () => {
    const { default: checkReferralRoute } = await import("./api/check-referral.js");

    // ✅ Ensure checkReferralRoute is properly initialized
    if (!checkReferralRoute || typeof checkReferralRoute !== "function") {
        console.error("🚨 checkReferralRoute is not a valid function!");
        process.exit(1);
    }

    app.use("/api/check-referral", checkReferralRoute(db));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})();

