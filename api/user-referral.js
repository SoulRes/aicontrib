import express from "express";
import admin from "firebase-admin";

const app = express();

// ✅ Ensure Firebase is initialized only once
if (!admin.apps.length) {
    console.log("🔥 Initializing Firebase...");
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS)),
    });
} else {
    console.log("✅ Firebase already initialized.");
}

const db = admin.firestore();

// ✅ API to Fetch User Referral Code
app.get("/api/user-referral", async (req, res) => {
    try {
        const userId = req.query.userId;  // Ensure correct query parameter
        console.log("📌 Received Request with userId:", userId);

        if (!userId) {
            console.warn("❌ Missing userId parameter.");
            return res.status(400).json({ error: "Missing userId parameter" });
        }

        // ✅ Normalize user ID to lowercase (if using email as Firestore ID)
        const userDoc = await db.collection("users").doc(userId.toLowerCase()).get();
        
        if (!userDoc.exists) {
            console.warn("❌ User not found in Firestore:", userId);
            return res.status(404).json({ error: `User with ID '${userId}' not found in Firestore` });
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
