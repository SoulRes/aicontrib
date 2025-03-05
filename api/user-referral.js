import express from "express";
import admin from "firebase-admin";

const app = express();
const db = admin.firestore();

// ✅ API to Fetch User Referral Code
app.get("/api/user-referral", async (req, res) => {
    try {
        // ✅ Extract userId from Query Parameters (NOT headers)
        const userId = req.query.userId;  
        if (!userId) {
            return res.status(400).json({ error: "Missing userId parameter" });
        }

        console.log("🔍 Fetching referral code for:", userId);

        // ✅ Get user document from Firestore (Assuming Firestore uses email as document ID)
        const userDoc = await db.collection("users").doc(userId.toLowerCase()).get();
        
        if (!userDoc.exists) {
            console.warn("❌ User not found in Firestore:", userId);
            return res.status(404).json({ error: "User not found in Firestore" });
        }

        const userData = userDoc.data();
        console.log("✅ Referral Code Found:", userData.referralCode);

        return res.json({ referralCode: userData.referralCode });

    } catch (error) {
        console.error("🚨 Error fetching user referral code:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
