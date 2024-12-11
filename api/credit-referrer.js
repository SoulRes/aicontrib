import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (ensure you've set up admin credentials)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://aicontribution-default-rtdb.europe-west1.firebasedatabase.app"
  });
}

const db = admin.firestore();

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { referralCode, paymentAmount } = req.body;

  if (!referralCode || !paymentAmount) {
    return res.status(400).json({ error: 'Invalid request. Missing referralCode or paymentAmount.' });
  }

  try {
    // Find referrer by referral code
    const referrerQuery = await db
      .collection('users')
      .where('referralCode', '==', referralCode)
      .limit(1)
      .get();

    if (referrerQuery.empty) {
      return res.status(404).json({ error: 'Invalid referral code.' });
    }

    const referrerDoc = referrerQuery.docs[0];
    const referrerId = referrerDoc.id;
    const referrerData = referrerDoc.data();

    // Calculate the credit (50% of paymentAmount)
    const creditAmount = paymentAmount * 0.5;

    // Update the referrer's account
    await db.collection('users').doc(referrerId).update({
      referralCredits: admin.firestore.FieldValue.increment(creditAmount),
      usdt: admin.firestore.FieldValue.increment(creditAmount)
    });

    console.log(`Credited ${creditAmount} USD to referrer: ${referrerId}`);
    return res.status(200).json({ success: true, creditedAmount: creditAmount });
  } catch (error) {
    console.error('Error crediting referrer:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

