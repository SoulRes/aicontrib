import express from "express";
import admin from "firebase-admin";
import { db } from "../server.js";

const router = express.Router();

// ✅ API: Check Referral Code Validity
router.post("/api/check-referral", async (req, res) => {
    try {
        const { referralCode } = req.body;

        if (!referralCode) {
            return res.status(400).json({ error: "Referral code is required." });
        }

        console.log("Checking referral code:", referralCode);

        // 🔎 Query Firestore for referral code
        const referralSnapshot = await db
            .collection("users")
            .where("referralCode", "==", referralCode)
            .get();

        if (referralSnapshot.empty) {
            console.log("❌ Invalid referral code:", referralCode);
            return res.status(404).json({ valid: false, message: "Invalid referral code." });
        }

        console.log("✅ Valid referral code:", referralCode);
        return res.status(200).json({ valid: true, message: "Referral code is valid!" });

    } catch (error) {
        console.error("🔥 Error checking referral code:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

export default router;
