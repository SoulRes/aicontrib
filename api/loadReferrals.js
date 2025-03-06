import { initializeApp } from "firebase/app";
import { getFirestore, doc, collection, getDoc, onSnapshot } from "firebase/firestore";

// ✅ Replace with your Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyDj2fDwpstFATN1GqzKdEvNqSe3u8EnNNM",
    authDomain: "aicontribution.firebaseapp.com",
    databaseURL: "https://aicontribution-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "aicontribution",
    storageBucket: "aicontribution.appspot.com",
    messagingSenderId: "847220817804",
    appId: "1:847220817804:web:85e0307421f1ad87e4e0a9",
    measurementId: "G-X9ZVDJLF8W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Function to load the referral dashboard
 * @param {string} userEmail - The email of the user
 */
async function loadReferralDashboard(userEmail) {
    if (!userEmail) {
        console.warn("⚠️ No email provided. Skipping dashboard update.");
        return;
    }

    try {
        console.log("📡 Initializing referral dashboard for:", userEmail);

        const userRef = doc(db, "users", userEmail.toLowerCase());
        const referralsRef = collection(userRef, "referrals");

        // ✅ Get required UI elements
        const referralTable = document.querySelector("#referral-table tbody");
        const totalBonusElement = document.getElementById("total-referral-bonus");
        const referralCodeElement = document.getElementById("user-referral-code");

        if (!referralTable || !totalBonusElement || !referralCodeElement) {
            console.error("❌ Referral dashboard elements not found. Skipping UI updates.");
            return;
        }

        // ✅ Listen for changes in user data (e.g., referral code, total bonus)
        onSnapshot(userRef, (docSnap) => {
            if (!docSnap.exists()) {
                console.warn(`⚠️ No Firestore document found for user: ${userEmail}`);
                return;
            }

            const userData = docSnap.data();
            console.log("✅ User Data Loaded:", userData);

            // 🔄 Update UI
            referralCodeElement.textContent = userData.referralCode || "N/A";
            totalBonusElement.textContent = `${userData.usdt || 0} USDT`;
        });

        // ✅ Listen for real-time referral updates
        onSnapshot(referralsRef, (snapshot) => {
            console.log(`📌 Received ${snapshot.size} referral entries`);

            referralTable.innerHTML = ""; // ✅ Clear table before adding new data

            if (snapshot.empty) {
                console.warn("⚠️ No referrals found for user:", userEmail);
                referralTable.innerHTML = `<tr><td colspan='4'>No referrals yet</td></tr>`;
                return;
            }

            snapshot.forEach(async (referralDoc) => {
                const referralData = referralDoc.data();
                const referralUser = referralDoc.id; // Referral user's ID
                const infoRef = doc(db, "users", userEmail.toLowerCase(), "referrals", referralUser, "info");
                const infoSnap = await getDoc(infoRef);

                let referralInfo = {};
                if (infoSnap.exists()) {
                    referralInfo = infoSnap.data();
                    console.log("🔹 Referral Info Loaded:", referralInfo);
                } else {
                    console.warn(`⚠️ No 'info' found for referral: ${referralUser}`);
                }

                const formattedDate = referralData.dateJoined ? new Date(referralData.dateJoined).toLocaleDateString() : "N/A";
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${referralData.email || "N/A"}</td>
                    <td>${referralData.status || "Pending"}</td>
                    <td>${formattedDate}</td>
                    <td>${referralData.bonusEarned || 0} USDT</td>
                `;
                referralTable.appendChild(row);
            });
        }, (error) => {
            console.error("🚨 Error fetching referrals:", error);
        });

    } catch (error) {
        console.error("🚨 Error loading referral dashboard:", error);
    }
}

// Example Usage
const userEmail = "cvhbj@sharklasers.com"; // Replace with actual user email
loadReferralDashboard(userEmail);

