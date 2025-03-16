import admin from "firebase-admin";

// ✅ Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || "{}")),
    });
}

const db = admin.firestore();

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { referralCode, userEmail } = req.body;

    try {
        console.log("🔄 Storing referral:", { referralCode, userEmail });

        // ✅ Ensure referralCode and userEmail exist
        if (!referralCode || !userEmail) {
            return res.status(400).json({ error: "Missing referralCode or userEmail" });
        }

        // ✅ Find the referrer using the referral code
        const referrerSnapshot = await db.collection("users")
            .where("referralCode", "==", referralCode)
            .limit(1)
            .get();

        if (referrerSnapshot.empty) {
            console.warn("⚠️ Referrer not found for code:", referralCode);
            return res.status(404).json({ error: "Referrer not found" });
        }

        const referrerDoc = referrerSnapshot.docs[0];
        const referrerId = referrerDoc.id;

        console.log("✅ Referrer found:", referrerId);

        // ✅ Store referral info in referred user's document
        await db.collection("users").doc(userEmail).update({
            referredBy: referralCode,
        });

        // ✅ Add referred user under the referrer's referrals
        await db.collection("users").doc(referrerId).collection("referrals").doc(userEmail).set({
            email: userEmail, 
            status: "Pending",
            bonusEarned: 0,
            dateJoined: new Date().toISOString().split("T")[0], // Store only YYYY-MM-DD
        });

        console.log("✅ Referral stored successfully for:", userEmail);
        return res.json({ success: true, message: "Referral code stored successfully" });

    } catch (error) {
        console.error("🚨 Error storing referral:", error);
        return res.status(500).json({ error: "Server error" });
    }
}
