app.post('/api/store-referral', async (req, res) => {
    const { referralCode, userId } = req.body;

    try {
        // ✅ Find the referrer using the referral code
        const referrerSnapshot = await db.collection('users')
            .where('referralCode', '==', referralCode)
            .limit(1)
            .get();

        if (referrerSnapshot.empty) {
            return res.status(404).json({ error: "Referrer not found" });
        }

        const referrerDoc = referrerSnapshot.docs[0];
        const referrerId = referrerDoc.id;

        // ✅ Store referral info in referred user's document
        await db.collection('users').doc(userId).update({
            referredBy: referralCode,
        });

        // ✅ Add referred user under the referrer's referrals
        await db.collection('users').doc(referrerId).collection('referrals').doc(userId).set({
            email: userId, // Assuming userId is email
            status: 'Pending',
            bonusEarned: 0,
            dateJoined: new Date().toISOString().split('T')[0], // Store only YYYY-MM-DD
        });

        return res.json({ success: true, message: 'Referral code stored successfully' });
    } catch (error) {
        console.error('🚨 Error storing referral:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

