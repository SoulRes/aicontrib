import express from "express";
import admin from "firebase-admin";

const app = express();

// ✅ Ensure Firebase is initialized
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

// ✅ API to Fetch User Referral Code using Email
app.get("/api/user-referral", async (req, res) => {
    try {
        const userEmail = req.query.email;  // Expecting email instead of userId
        console.log("📌 Received Request with email:", userEmail);

        if (!userEmail) {
            console.warn("❌ Missing email parameter.");
            return res.status(400).json({ error: "Missing email parameter" });
        }

        // ✅ Normalize email to lowercase
        const userDoc = await db.collection("users").doc(userEmail.toLowerCase()).get();
        
        if (!userDoc.exists) {
            console.warn("❌ User not found in Firestore:", userEmail);
            return res.status(404).json({ error: `User with email '${userEmail}' not found in Firestore` });
        }

        const userData = userDoc.data();
        console.log("✅ Referral Code Found:", userData.referralCode);

        return res.json({ referralCode: userData.referralCode });

    } catch (error) {
        console.error("🚨 Error fetching user referral code:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

export default app;
