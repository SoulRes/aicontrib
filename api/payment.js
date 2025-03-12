import admin from "firebase-admin";

// ✅ Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS || "{}")),
    });
}

const db = admin.firestore();

// ✅ Serverless Function for Payment Processing
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { userId, amountPaid, referralCode, orderId, currency } = req.body;

    // ✅ Validate `userId` before proceeding
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
        console.error("🚨 Error: Invalid or missing userId");
        return res.status(400).json({ error: "Invalid userId" });
    }

    console.log("🛠 Processing payment for:", userId, "Amount:", amountPaid, "Referral Code:", referralCode);

    try {
        const userDocRef = db.collection("users").doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            console.log("❌ User not found in Firestore");
            return res.status(404).json({ error: "User not found" });
        }

        // ✅ Process referral bonus if applicable
        if (referralCode) {
            const referrerSnapshot = await db.collection("users")
                .where("referralCode", "==", referralCode)
                .limit(1)
                .get();

            if (!referrerSnapshot.empty) {
                const referrerDoc = referrerSnapshot.docs[0];
                const referrerId = referrerDoc.id;

                console.log("✅ Referrer found:", referrerId);

                // ✅ Update referrer's balance and referral count
                await db.collection("users").doc(referrerId).update({
                    usdt: admin.firestore.FieldValue.increment(150),
                    referralCount: admin.firestore.FieldValue.increment(1),
                });

                // ✅ Update referral status in Firestore
                await db.collection("users").doc(referrerId).collection("referrals").doc(userId).set({
                    status: "Paid",
                    bonusEarned: 150,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }
        }

        // ✅ Log purchase for the user
        await db.collection("users").doc(userId).collection("purchases").add({
            amount: amountPaid,
            orderId,
            currency,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // ✅ Activate user after payment
        await userDocRef.update({
            status: "Activated",
            activationDate: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log("✅ Payment processed successfully!");
        return res.json({ success: true, message: "Payment recorded, referrer updated, and account activated" });
    } catch (error) {
        console.error("🚨 Error processing payment:", error);
        return res.status(500).json({ error: "Server error" });
    }
}

