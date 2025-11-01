import admin from "firebase-admin";
import crypto from "crypto";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signature = req.headers["x-nowpayments-sig"];
  const secretKey = process.env.NOWPAYMENTS_API_KEY;
  const rawBody = JSON.stringify(req.body);

  const expectedSig = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
  if (expectedSig !== signature) {
    console.error("⚠️ Invalid NOWPayments signature!");
    return res.status(400).json({ error: "Invalid signature" });
  }

  const { payment_status, order_description } = req.body;

  if (payment_status === "finished") {
    const [_, buyerEmail, referralCode] = order_description.split("|");
    console.log(`✅ Payment confirmed for ${buyerEmail} (ref: ${referralCode})`);

    try {
      // 🔹 Update buyer status
      const buyerRef = db.collection("users").doc(buyerEmail);
      await buyerRef.update({ status: "Activated" });

      if (referralCode) {
        // 🔹 Find referrer by referral code
        const refSnap = await db
          .collection("users")
          .where("referralCode", "==", referralCode)
          .limit(1)
          .get();

        if (!refSnap.empty) {
          const refDoc = refSnap.docs[0];
          const referrerEmail = refDoc.id;
          const referrerData = refDoc.data();

          // ✅ Add referral record
          await db.collection("referrals").doc(referrerEmail).collection("records").add({
            referred: buyerEmail,
            bonusEarned: 150,
            status: "Paid",
            timestamp: admin.firestore.Timestamp.now(),
          });

          // ✅ Update referrer stats
          await refDoc.ref.update({
            usdt: (referrerData.usdt || 0) + 150,
            referralCount: (referrerData.referralCount || 0) + 1,
          });

          // ✅ Mark buyer’s referrer
          await buyerRef.update({ referredBy: referrerEmail });
        }
      }

      console.log("🎉 Buyer + referrer successfully updated!");
    } catch (err) {
      console.error("🔥 Webhook error:", err);
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  }

  return res.status(200).send("OK");
}
