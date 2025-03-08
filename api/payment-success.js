import admin from "firebase-admin";

const firebaseConfig = JSON.parse(process.env.FIREBASE_CREDENTIALS || "{}");

// ✅ Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
    });
}

const db = admin.firestore();

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { invoiceId, buyerEmail, amount, status } = req.body;

    console.log("🛠 BTCPay Payment Processing:", { invoiceId, buyerEmail, amount, status });

    try {
        // ✅ Ensure payment is confirmed
        if (status !== "settled") {
            console.warn("⚠️ Payment not settled yet:", status);
            return res.status(400).json({ error: "Payment not completed" });
        }

        const userDocRef = db.collection("users").doc(buyerEmail);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            console.log("❌ User not found in Firestore");
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.data();
        console.log("📌 User Data:", userData);

        // ✅ Check if the user was referred
        if (!userData.referredBy) {
            console.log("⚠️ No referral code linked.");
            return res.json({ message: "No referral linked to this purchase" });
        }

        const referrerSnapshot = await db.collection("users")
            .where("referralCode", "==", userData.referredBy)
            .limit(1)
            .get();

        if (referrerSnapshot.empty) {
            console.log("❌ No referrer found for code:", userData.referredBy);
            return res.status(404).json({ error: "Invalid referral code" });
        }

        const referrerDoc = referrerSnapshot.docs[0];
        const referrerId = referrerDoc.id;
        console.log("✅ Referrer Found:", referrerId);

        // ✅ Update referrer's earnings
        await db.collection("users").doc(referrerId).update({
            usdt: admin.firestore.FieldValue.increment(150),
            referralCount: admin.firestore.FieldValue.increment(1)
        });

        // ✅ Update referral status
        const referralRef = db.collection("users").doc(referrerId).collection("referrals").doc(buyerEmail);
        await referralRef.update({
            status: "Paid",
            bonusEarned: 150
        });

        // ✅ Activate the user's account after payment
        await userDocRef.update({
            status: "Activated",
            activationDate: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ Payment successful, referral updated, account activated!");
        return res.json({ success: true, message: "Payment processed and account activated" });

    } catch (error) {
        console.error("🚨 Error handling payment:", error);
        return res.status(500).json({ error: "Server error" });
    }
}
