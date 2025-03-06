import { doc, collection, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// ✅ Load Referral Dashboard
export async function loadReferralDashboard(userEmail, db) {
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

        // ✅ Listen for changes in user data
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

            referralTable.innerHTML = ""; // Clear table before adding new data

            if (snapshot.empty) {
                console.warn("⚠️ No referrals found for user:", userEmail);
                referralTable.innerHTML = `<tr><td colspan='4'>No referrals yet</td></tr>`;
                return;
            }

            snapshot.forEach(async (referralDoc) => {
                console.log("🔍 Referral Doc:", referralDoc.data());

                const referralData = referralDoc.data();
                const referralUser = referralDoc.id;
                const infoRef = doc(db, "users", userEmail.toLowerCase(), "referrals", referralUser, "info");
                const infoSnap = await getDoc(infoRef);

                if (!infoSnap.exists()) {
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

// ✅ Fetch Referral Details from API
export async function fetchReferralDetails(userEmail) {
    if (!userEmail) {
        console.warn("⚠️ No user email provided for referral fetch.");
        return;
    }

    try {
        console.log("🔍 Fetching referral details for:", userEmail);

        const authToken = await firebase.auth().currentUser.getIdToken();
        const response = await fetch(`/api/user-referral?email=${encodeURIComponent(userEmail)}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        const data = await response.json();
        console.log("✅ API Response:", data);

        if (data.error) {
            throw new Error(`❌ API error: ${JSON.stringify(data)}`);
        }

        // ✅ Update Referral Code on Dashboard
        document.getElementById("user-referral-code").textContent = data.referralCode || "N/A";

    } catch (error) {
        console.error("🚨 Error fetching user referral code:", error);
    }
}

// ✅ Copy Referral Code
export function copyReferralCode() {
    const referralCodeElement = document.getElementById("user-referral-code");
    if (!referralCodeElement) {
        console.error("❌ Referral code element not found!");
        return;
    }

    const referralCode = referralCodeElement.textContent;
    if (referralCode !== "N/A") {
        navigator.clipboard.writeText(referralCode)
            .then(() => alert("✅ Referral code copied!"))
            .catch(err => console.error("❌ Copy failed:", err));
    } else {
        alert("⚠️ No referral code available to copy.");
    }
}

