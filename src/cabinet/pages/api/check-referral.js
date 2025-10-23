import admin from "firebase-admin";

// ✅ Initialize Firebase Admin (prevent re-initialization in dev)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();

// ✅ Check if referral code exists & prevent self-referral
app.post("/api/check-referral", async (req, res) => {
    const { referralCode, buyerEmail } = req.body;

    if (!referralCode) {
        return res.status(400).json({ valid: false, message: "Referral code is required" });
    }

    try {
        const usersRef = db.collection("users");
        const snapshot = await usersRef
            .where("referralCode", "==", referralCode)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ valid: false, message: "Referral code not found" });
        }

        const referrerDoc = snapshot.docs[0];
        const referrerData = referrerDoc.data();

        // 🚫 Prevent self-referral
        if (referrerData.email === buyerEmail) {
            console.log("🚫 Self-referral attempt detected:", buyerEmail);
            return res.status(400).json({ valid: false, message: "You cannot use your own referral code" });
        }

        console.log("✅ Valid referral code:", referralCode, "from:", referrerData.email);
        return res.json({ valid: true, referrerEmail: referrerData.email });

    } catch (err) {
        console.error("🔥 Error checking referral:", err);
        return res.status(500).json({ valid: false, message: "Server error" });
    }
});
