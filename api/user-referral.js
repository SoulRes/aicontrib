import express from "express";
import admin from "firebase-admin";

const app = express();

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

export default async function handler(req, res) {
    try {
        if (!req.headers.authorization) {
            return res.status(403).json({ error: "Unauthorized: No token provided" });
        }

        const token = req.headers.authorization.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        if (!decodedToken.email) {
            return res.status(400).json({ error: "Invalid token: No email found" });
        }

        console.log("✅ Authenticated User:", decodedToken.email);

        // Fetch user referral info from Firestore
        const db = admin.firestore();
        const userRef = db.collection("users").doc(decodedToken.email);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User referral not found" });
        }

        res.status(200).json({ referral: userDoc.data().referralCode });
    } catch (error) {
        console.error("❌ Token verification failed:", error);
        res.status(403).json({ error: "Unauthorized: Invalid token" });
    }
}

app.get("/api/user-referral", async (req, res) => {
    try {
        const userEmail = req.query.email;
        console.log("📌 Received Request with email:", userEmail);

        if (!userEmail) {
            return res.status(400).json({ error: "Missing email parameter" });
        }

        // ✅ Normalize email to lowercase
        const normalizedEmail = userEmail.toLowerCase();

        // ✅ Check Firebase Auth
        const authToken = req.headers.authorization?.split("Bearer ")[1];
        if (!authToken) {
            return res.status(403).json({ error: "Unauthorized: No token provided" });
        }

        const decodedToken = await admin.auth().verifyIdToken(authToken);
        if (!decodedToken.email || decodedToken.email !== normalizedEmail) {
            return res.status(403).json({ error: "Unauthorized: Invalid token" });
        }

        // ✅ Fetch User Data
        const userDoc = await db.collection("users").doc(normalizedEmail).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: `User with email '${normalizedEmail}' not found in Firestore` });
        }

        const userData = userDoc.data();
        return res.json({ referralCode: userData.referralCode });

    } catch (error) {
        console.error("🚨 Error fetching user referral code:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

export default app;
