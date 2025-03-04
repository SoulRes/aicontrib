import admin from "firebase-admin";

// ✅ Parse Firebase credentials from ENV
const firebaseConfig = JSON.parse(process.env.FIREBASE_CREDENTIALS || "{}");

// ✅ Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
    });
}

const db = admin.firestore();

// ✅ Serverless Function for Payment Success
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { userId, amountPaid, referralCode } = req.body;
    const referralBonus = 150;

    console.log("🛠 Processing payment for:", userId, "Amount:", amountPaid, "Referral Code:", referralCode);

    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            console.log("❌ User not found in Firestore");
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.data();
        console.log("📌 User Data:", userData);

        // ✅ Ensure referralCode exists in request
        if (!referralCode) {
            console.log("⚠️ No referral code provided.");
            return res.json({ message: "No referral linked to this purchase" });
        }

        // ✅ Check if referralCode exists in Firestore
        const referrerSnapshot = await db.collection("users")
            .where("referralCode", "==", referralCode)
            .limit(1)
            .get();

        if (referrerSnapshot.empty) {
            console.log("❌ No user found with this referral code:", referralCode);
            return res.status(404).json({ error: "Invalid referral code" });
        }

        const referrerDoc = referrerSnapshot.docs[0];
        const referrerId = referrerDoc.id;
        console.log("✅ Referrer found:", referrerId);

        // ✅ Update referrer's USDT balance and referral count
        await db.collection("users").doc(referrerId).update({
            usdt: admin.firestore.FieldValue.increment(referralBonus),
            referralCount: admin.firestore.FieldValue.increment(1)
        });

        // ✅ Update referral status for the referred user
        const referralRef = db.collection("users").doc(referrerId).collection("referrals").doc(userId);
        const referralDoc = await referralRef.get();

        if (referralDoc.exists) {
            await referralRef.update({
                status: "Paid",
                bonusEarned: referralBonus
            });
        } else {
            await referralRef.set({
                status: "Paid",
                bonusEarned: referralBonus,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        // ✅ Log purchase for the user
        await db.collection("users").doc(userId).collection("purchases").add({
            amount: amountPaid,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ Payment success, referrer updated!");
        return res.json({ success: true, message: "Payment recorded, referrer updated" });
    } catch (error) {
        console.error("🚨 Error handling payment:", error);
        return res.status(500).json({ error: "Server error" });
    }
}
