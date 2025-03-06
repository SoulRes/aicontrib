// ✅ Function to load the referral dashboard
async function loadReferralDashboard(userEmail) {
    if (!userEmail) {
        console.warn("⚠️ No email provided. Skipping dashboard update.");
        return;
    }

    try {
        console.log("📡 Initializing referral dashboard for:", userEmail);

        const userRef = doc(db, "users", userEmail.toLowerCase());
        const referralsRef = collection(userRef, "referrals");

        // ✅ Ensure elements exist
        const referralTable = document.querySelector("#referral-table tbody");
        const totalBonusElement = document.getElementById("total-referral-bonus");
        const referralCodeElement = document.getElementById("user-referral-code");

        if (!referralTable || !totalBonusElement || !referralCodeElement) {
            console.error("❌ Referral dashboard elements not found.");
            return;
        }

        // ✅ Listen for user data changes
        onSnapshot(userRef, (docSnap) => {
            if (!docSnap.exists()) {
                console.warn(`⚠️ No Firestore document found for user: ${userEmail}`);
                return;
            }

            const userData = docSnap.data();
            console.log("✅ User Data Loaded:", userData);

            referralCodeElement.textContent = userData.referralCode || "N/A";
            totalBonusElement.textContent = `${userData.usdt || 0} USDT`;
        });

        // ✅ Listen for real-time referral updates
        onSnapshot(referralsRef, (snapshot) => {
            console.log(`📌 Received ${snapshot.size} referral entries`);

            referralTable.innerHTML = "";

            if (snapshot.empty) {
                referralTable.innerHTML = `<tr><td colspan='4'>No referrals yet</td></tr>`;
                return;
            }

            snapshot.forEach((referralDoc) => {
                const referralData = referralDoc.data();
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
        });

    } catch (error) {
        console.error("🚨 Error loading referral dashboard:", error);
    }
}

// ✅ Function to fetch referral details
async function fetchReferralDetails(userEmail) {
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

        document.getElementById("user-referral-code").textContent = data.referralCode || "N/A";

    } catch (error) {
        console.error("🚨 Error fetching user referral code:", error);
    }
}

// ✅ Expose functions globally
window.loadReferralDashboard = loadReferralDashboard;
window.fetchReferralDetails = fetchReferralDetails;
