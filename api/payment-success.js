import admin from "firebase-admin";

// ✅ Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// ✅ Serverless Function for Payment Success
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { userId, amountPaid } = req.body;
    const referralBonus = 150; // Bonus per referral

    console.log("🛠 Processing payment for:", userId, "Amount:", amountPaid);

    try {
        // ✅ Get the user who made the payment
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            console.log("❌ User not found in Firestore");
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.data();
        console.log("📌 User Data:", userData);

        const referrerCode = userData.referredBy; // Get referral code used
        if (!referrerCode) {
            console.log("⚠️ No referral code used.");
            return res.json({ message: "No referral linked to this purchase" });
        }

        // ✅ Find the referrer by referralCode
        const referrerSnapshot = await db.collection("users")
            .where("referralCode", "==", referrerCode)
            .limit(1)
            .get();

        if (referrerSnapshot.empty) {
            console.log("❌ Referrer not found for code:", referrerCode);
            return res.status(404).json({ error: "Referrer not found" });
        }

        const referrerDoc = referrerSnapshot.docs[0];
        const referrerId = referrerDoc.id;
        console.log("✅ Referrer found:", referrerId);

        // ✅ Update referrer’s balance & referral count
        await db.collection("users").doc(referrerId).update({
            usdt: admin.firestore.FieldValue.increment(referralBonus),
            referralCount: admin.firestore.FieldValue.increment(1)
        });
        console.log("💰 Referrer bonus updated!");

        // ✅ Update referral subcollection with "Paid" status
        await db.collection("users").doc(referrerId).collection("referrals").doc(userId).update({
            status: "Paid",
            bonusEarned: referralBonus
        });
        console.log("📌 Referral status updated to Paid!");

        // ✅ Store the payment in the user's purchases subcollection
        await db.collection("users").doc(userId).collection("purchases").add({
            amount: amountPaid,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log("🛍 Payment recorded in purchases!");

        return res.json({ success: true, message: "Payment recorded, referrer updated" });
    } catch (error) {
        console.error("🚨 Error handling payment:", error);
        return res.status(500).json({ error: "Server error" });
    }
}
