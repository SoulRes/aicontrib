import express from "express";
import admin from "firebase-admin";

const app = express();

if (!admin.apps.length) {
    try {
        console.log("🔥 Initializing Firebase...");
        const credentials = process.env.FIREBASE_CREDENTIALS;

        if (!credentials) {
            console.error("❌ FIREBASE_CREDENTIALS is missing!");
            process.exit(1);
        }

        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(credentials)),
        });

        console.log("✅ Firebase Initialized Successfully.");
    } catch (error) {
        console.error("❌ Error initializing Firebase:", error);
        process.exit(1);
    }
}

const db = admin.firestore();

export default async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        // ✅ Check if Authorization Header Exists
        if (!req.headers.authorization) {
            return res.status(403).json({ error: "Unauthorized: No token provided" });
        }

        const token = req.headers.authorization.split("Bearer ")[1];
        if (!token) {
            return res.status(403).json({ error: "Unauthorized: Token is missing" });
        }

        try {
            // ✅ Verify Firebase Token
            const decodedToken = await admin.auth().verifyIdToken(token);
            if (!decodedToken.email) {
                return res.status(400).json({ error: "Invalid token: No email found" });
            }

            console.log("✅ Authenticated User:", decodedToken.email);

            // ✅ Fetch Referral Data from Firestore
            const userRef = db.collection("users").doc(decodedToken.email);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                return res.status(404).json({ error: "User referral not found" });
            }

            const userData = userDoc.data();
            console.log("📌 User Data:", userData);

            return res.status(200).json({
                email: decodedToken.email,
                referralCode: userData.referralCode || null,
                referredBy: userData.referredBy || null,
                referralCount: userData.referralCount || 0,
            });

        } catch (authError) {
            console.error("❌ Firebase Auth Error:", authError);
            return res.status(403).json({ error: "Unauthorized: Invalid or expired token" });
        }

    } catch (error) {
        console.error("❌ API Error:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

export default app;
