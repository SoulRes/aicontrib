import express from "express";
import admin from "firebase-admin";

const app = express();
const db = admin.firestore();

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
