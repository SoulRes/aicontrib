app.get("/api/user-referral", async (req, res) => {
    try {
        const userId = req.headers["x-user-id"]; // Assume user ID is sent in request headers
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.data();
        return res.json({ referralCode: userData.referralCode });
    } catch (error) {
        console.error("🚨 Error fetching user referral code:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

