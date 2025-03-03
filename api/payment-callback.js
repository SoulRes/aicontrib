import sendConfirmationEmail from './sendConfirmationEmail'; // Import email function
import db from './firebase'; // Import Firebase Firestore configuration

// Callback function to handle payment status updates from BTCPay (IPN Callback)
export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Destructure data from the callback (IPN) request
  const { id, status, orderId } = req.body;

  console.log('🔍 IPN Callback received:', { id, status, orderId });

  try {
    if (status === 'complete') {
      console.log('✅ Payment confirmed:', orderId);

      // ✅ Retrieve order details from Firestore
      const orderDoc = await db.collection('orders').doc(orderId).get();
      
      if (!orderDoc.exists) {
        console.error(`❌ Order not found for orderId: ${orderId}`);
        return res.status(404).json({ error: 'Order not found' });
      }

      const orderDetails = orderDoc.data();
      const { email, price, currency, userId } = orderDetails;
      console.log("📌 Order details:", orderDetails);

      // ✅ Send payment confirmation email to the user
      await sendConfirmationEmail(
        email,
        'Payment Confirmation',
        `
          <p>Thank you for your payment of ${price} ${currency}!</p>
          <p>Your order ID is: ${orderId}</p>
        `
      );
      console.log('📧 Confirmation email sent to:', email);

      // ✅ Activate the user's account
      await db.collection('users').doc(userId).update({ status: 'Activated' });
      console.log('🔓 User account activated:', userId);

      // ✅ Handle Referral Bonus (if applicable)
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const referrerCode = userData.referredBy;

        if (referrerCode) {
          console.log("🔍 Checking referral for code:", referrerCode);

          // ✅ Find the referrer in Firestore
          const referrerSnapshot = await db.collection("users")
            .where("referralCode", "==", referrerCode)
            .limit(1)
            .get();

          if (!referrerSnapshot.empty) {
            const referrerDoc = referrerSnapshot.docs[0];
            const referrerId = referrerDoc.id;
            console.log("✅ Referrer found:", referrerId);

            // ✅ Update referrer's balance & referral count
            await db.collection("users").doc(referrerId).update({
              usdt: admin.firestore.FieldValue.increment(150), // Bonus for referral
              referralCount: admin.firestore.FieldValue.increment(1)
            });

            // ✅ Update referral record
            await db.collection("users").doc(referrerId).collection("referrals").doc(userId).update({
              status: "Paid",
              bonusEarned: 150
            });

            console.log("💰 Referral updated for referrer:", referrerId);
          } else {
            console.log("⚠️ No referrer found for code:", referrerCode);
          }
        }
      }

    } else if (status === 'failed') {
      console.log('❌ Payment failed:', orderId);

      // ✅ Mark order as failed in Firestore
      await db.collection('orders').doc(orderId).update({ status: 'failed' });
    }

    // ✅ Send response to BTCPay to confirm receipt of IPN
    res.status(200).json({ message: 'IPN received' });

  } catch (error) {
    console.error('🚨 Error handling IPN callback:', error);
    res.status(500).json({ error: 'Failed to process IPN' });
  }
};
