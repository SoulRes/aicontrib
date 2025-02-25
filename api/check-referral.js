import express from "express";
import admin from "firebase-admin";

const router = express.Router();
const db = admin.firestore();

// API to check referral code validity
router.post("/check-referral", async (req, res) => {
    try {
        const { referralCode } = req.body;

        if (!referralCode) {
            return res.status(400).json({ error: "Referral code is required." });
        }

        // Check Firestore for a valid referral code
        const referralSnapshot = await db.collection("users")
            .where("referralCode", "==", referralCode)
            .get();

        if (referralSnapshot.empty) {
            return res.status(404).json({ valid: false, message: "Invalid referral code." });
        }

        res.status(200).json({ valid: true, message: "Referral code is valid!" });

    } catch (error) {
        console.error("Error checking referral code:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;

