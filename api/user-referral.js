import admin from 'firebase-admin';

// Ensure Firebase Admin is initialized only once (prevents duplicate initialization issues)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
        }),
    });
}

const db = admin.firestore();

export default async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        // ✅ Step 1: Validate Authorization Header
        if (!req.headers.authorization) {
            return res.status(403).json({ error: "Unauthorized: No token provided" });
        }

        const token = req.headers.authorization.split("Bearer ")[1];
        if (!token) {
            return res.status(403).json({ error: "Unauthorized: Token is missing" });
        }

        // ✅ Step 2: Verify Firebase Auth Token
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (!decodedToken.email) {
            return res.status(400).json({ error: "Invalid token: No email found" });
        }

        console.log("✅ Authenticated User:", decodedToken.email);

        // ✅ Step 3: Fetch User Referral Data from Firestore
        const userRef = db.collection("users").doc(decodedToken.email);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User referral not found" });
        }

        const userData = userDoc.data();
        console.log("📌 User Data:", userData);

        return res.status(200).json({
            email: decodedToken.email,
            referralCode: userData.referralCode || null,
            referredBy: userData.referredBy || null,
            referralCount: userData.referralCount || 0,
        });

    } catch (error) {
        console.error("❌ Error in user-referral API:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

