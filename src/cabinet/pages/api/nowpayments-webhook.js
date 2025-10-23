import admin from "firebase-admin";
import express from "express";

const router = express.Router();
const db = admin.firestore();

router.post("/", async (req, res) => {
  const paymentData = req.body;
  console.log("🔄 NOWPayments webhook received:", paymentData);

  if (paymentData.payment_status === "finished") {
    try {
      // Expecting order_description like: "AIcontrib License|buyerEmail|referralCode"
      const [_, buyerEmail, referralCode] = paymentData.order_description.split("|");

      // 🔹 Update buyer
      const buyerRef = db.collection("users").doc(buyerEmail);
      await buyerRef.update({
        status: "Activated",
        referredBy: referralCode || null,
      });

      // 🔹 Update referrer if referralCode exists
      if (referralCode) {
        const referrerSnap = await db
          .collection("users")
          .where("referralCode", "==", referralCode)
          .get();

        if (!referrerSnap.empty) {
          referrerSnap.forEach(async (doc) => {
            const referrerRef = db.collection("users").doc(doc.id);
            const refData = doc.data();

            await referrerRef.update({
              usdt: (refData.usdt || 0) + 150,
              referralCount: (refData.referralCount || 0) + 1,
              referrals: admin.firestore.FieldValue.arrayUnion(buyerEmail),
            });
          });
        }
      }

      console.log("✅ Referral + buyer updated successfully.");
    } catch (err) {
      console.error("🔥 Error updating referral flow:", err);
    }
  }

  res.status(200).send("Webhook received");
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawBody = JSON.stringify(req.body);
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const receivedSignature = req.headers["x-nowpayments-sig"] || "";

  // Verify webhook signature
  const crypto = require("crypto");
  const calculatedSignature = crypto
    .createHmac("sha512", apiKey)
    .update(rawBody)
    .digest("hex");

  if (receivedSignature !== calculatedSignature) {
    console.log("Invalid webhook signature!");
    return res.status(400).send("Invalid signature");
  }

  const { payment_status, order_id, amount, pay_currency } = req.body;

  if (payment_status === "finished") {
    console.log(`Payment finished for order ${order_id}: ${amount} ${pay_currency}`);
    // TODO: Update your database or unlock the license for the user
  }

  res.status(200).send("OK");
}