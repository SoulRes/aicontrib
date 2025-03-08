// Firebase Configuration (Make sure Firebase SDK is included in your project)
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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Function to fetch and display referrals
function loadReferralData() {
    auth.onAuthStateChanged(user => {
        if (user) {
            const userEmail = user.email.replace(/\./g, ','); // Firestore does not support '.' in keys
            const referralTableBody = document.querySelector('#referral-table tbody');
            referralTableBody.innerHTML = ''; // Clear existing table data
            
            db.collection('users').doc(userEmail).collection('referrals')
                .get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        referralTableBody.innerHTML = '<tr><td colspan="4">No referrals yet.</td></tr>';
                        return;
                    }
                    
                    snapshot.forEach(doc => {
                        const referral = doc.data();
                        const row = `<tr>
                            <td>${doc.id}</td>
                            <td>${referral.status || 'Pending'}</td>
                            <td>${referral.timestamp || 'N/A'}</td>
                            <td>${referral.bonusEarned || '0'} USDT</td>
                        </tr>`;
                        referralTableBody.innerHTML += row;
                    });
                })
                .catch(error => {
                    console.error('Failed to fetch referrals:', error);
                    referralTableBody.innerHTML = '<tr><td colspan="4">Error loading referrals.</td></tr>';
                });
        }
    });
}

// Call function on page load
window.onload = loadReferralData;
