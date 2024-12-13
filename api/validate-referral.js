import admin from 'firebase-admin';

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('backend/key.json')),
    databaseURL: "https://aicontribution-default-rtdb.europe-west1.firebasedatabase.app", // Replace with your Firebase project URL
  });
}

const db = admin.firestore();

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { referralCode } = req.body;

  if (!referralCode) {
    return res.status(400).json({ error: 'Referral code is required.' });
  }

  try {
    // Query Firestore for the referral code
    const referralSnapshot = await db
      .collection('users')
      .where('referralCode', '==', referralCode)
      .limit(1)
      .get();

    if (referralSnapshot.empty) {
      return res.status(404).json({ valid: false, error: 'Referral code not found.' });
    }

    // Get the first matching document
    const referrerDoc = referralSnapshot.docs[0];
    const referrerData = referrerDoc.data();

    return res.status(200).json({
      valid: true,
      referrerId: referrerDoc.id, // The document ID of the referrer
      referrerEmail: referrerData.email || null, // Optional, for logging
    });
  } catch (error) {
    console.error('Error validating referral code:', error.message, error.stack);
    return res.status(500).json({ error: 'Internal Server Error' + error.message });
  }
};

