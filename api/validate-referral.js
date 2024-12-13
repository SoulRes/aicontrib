import admin from 'firebase-admin';

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://aicontribution-default-rtdb.europe-west1.firebasedatabase.app",
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
    console.log('Referral code received:', referralCode);

    // Adjust query based on Firestore structure
    const referralSnapshot = await db
      .collection('users') // Use collectionGroup if needed
      .where('referralCode', '==', referralCode)
      .limit(1)
      .get();

    console.log('Referral snapshot size:', referralSnapshot.size);

    if (referralSnapshot.empty) {
      console.log('No matching referral code found.');
      return res.status(404).json({ valid: false, error: 'Referral code not found.' });
    }

    // Get the first matching document
    const referrerDoc = referralSnapshot.docs[0];
    const referrerData = referrerDoc.data();

    console.log('Referral code found:', referrerData);

    return res.status(200).json({
      valid: true,
      referrerId: referrerDoc.id,
      referrerEmail: referrerData.email || null,
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

