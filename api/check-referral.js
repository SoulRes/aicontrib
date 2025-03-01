import admin from "firebase-admin";

// Initialize Firebase Admin (Ensure it's not reinitialized multiple times)
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
}

const db = admin.firestore();

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { referralCode } = req.body;
    console.log("🔍 Checking referral code:", referralCode);

    if (!referralCode) {
        return res.status(400).json({ error: "Referral code is required" });
    }

    console.time("Referral Code Check");
    try {
        const querySnapshot = await db.collection("users")
            .where("referralCode", "==", referralCode)
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
}
