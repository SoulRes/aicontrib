import { Router } from "express";

export default function checkReferralRoute(db) {
    const router = Router();

    router.post("/", async (req, res) => {
        const { referralCode } = req.body;
        console.log("🔍 Checking referral code:", referralCode);

        if (!referralCode) {
            return res.status(400).json({ error: "Referral code is required" });
        }

        console.time("Referral Code Check");
        try {
            // 🔥 DO NOT change case - Firestore is case-sensitive
            const querySnapshot = await db.collection("users")
                .where("referralCode", "==", referralCode) // Case-sensitive match
                .limit(1)
                .get();

            console.timeEnd("Referral Code Check");

            if (querySnapshot.empty) {
                console.log("❌ Invalid referral code:", referralCode);
                return res.status(404).json({ valid: false, message: "Invalid referral code" });
            }

            console.log("✅ Valid referral code:", referralCode);
            return res.json({ valid: true, message: "Referral code is valid" });

        } catch (error) {
            console.timeEnd("Referral Code Check");
            console.error("🔥 Error checking referral code:", error);
            return res.status(500).json({ error: error.message });
        }
    });

    return router;
}
