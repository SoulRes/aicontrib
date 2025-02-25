import { Router } from "express";
import { db } from "../server.js";

const router = Router();

router.post("/api/check-referral", async (req, res) => {
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

export default router;

