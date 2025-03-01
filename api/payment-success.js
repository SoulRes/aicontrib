app.post("/api/payment-success", async (req, res) => {
    const { userId, amountPaid } = req.body;
    const referralBonus = 150; // Fixed bonus per referral

    try {
        // ✅ Get the user who made the payment
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.data();
        const referrerCode = userData.referredBy; // Get referral code used
        if (!referrerCode) {
            return res.json({ message: "No referral linked to this purchase" });
        }

        // ✅ Find the referrer by referralCode
        const referrerSnapshot = await db.collection("users")
            .where("referralCode", "==", referrerCode)
            .limit(1)
            .get();

        if (referrerSnapshot.empty) {
            return res.status(404).json({ error: "Referrer not found" });
        }

        const referrerDoc = referrerSnapshot.docs[0];
        const referrerId = referrerDoc.id;

        // ✅ Update referrer's balance and referral count
        await db.collection("users").doc(referrerId).update({
            usdt: admin.firestore.FieldValue.increment(referralBonus),
            referralCount: admin.firestore.FieldValue.increment(1)
        });

        // ✅ Update referral subcollection with "Paid" status
        await db.collection("users").doc(referrerId).collection("referrals").doc(userId).update({
            status: "Paid",
            bonusEarned: referralBonus
        });

        // ✅ Store the payment in the user's purchases subcollection
        await db.collection("users").doc(userId).collection("purchases").add({
            amount: amountPaid,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.json({ success: true, message: "Payment recorded, referrer updated" });
    } catch (error) {
        console.error("🚨 Error handling payment:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

