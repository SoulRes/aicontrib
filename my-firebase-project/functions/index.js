const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.validateReferralCode = functions.https.onCall(async (data, context) => {
    const { referralCode } = data;

    if (!referralCode) {
        throw new functions.https.HttpsError("invalid-argument", "Referral code is required.");
    }

    try {
        const userQuery = await db.collection("users")
            .where("referralCode", "==", referralCode)
            .limit(1)
            .get();

        if (userQuery.empty) {
            return { valid: false, message: "Invalid referral code." };
        }

        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();

        if (userData.status !== "Activated") {
            return { valid: false, message: "Referral code is not active." };
        }

        return { valid: true, message: "Referral code is valid.", referredBy: userData.email };
    } catch (error) {
        console.error("Error validating referral code:", error);
        throw new functions.https.HttpsError("internal", "Error validating referral code.");
    }
});
