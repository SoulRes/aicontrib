// Function to switch between sections (make it globally available)
function switchSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    const selectedSection = document.getElementById(sectionId);

    // Check if the element with the ID exists
    if (selectedSection) {
        // Hide all sections
        sections.forEach(section => {
            if (section) section.style.display = 'none';
        });

        // Show the selected section
        selectedSection.style.display = 'block';
    } else {
        console.error(`Section with id '${sectionId}' not found`);
    }

    // Update menu active state
    const activeButton = document.querySelector(`button[onclick="switchSection('${sectionId}')"]`);
    if (activeButton) {
        document.querySelectorAll('.menu-item').forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
}

// JavaScript to switch between login and signup forms
function openForm(formType) {
    // Hide all forms
    document.querySelectorAll('.form-content').forEach(form => {
        if (form) {
            form.style.display = 'none';
        }
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        if (tab) {
            tab.classList.remove('active');
        }
    });

    // Show the selected form and activate the corresponding tab
    const selectedForm = document.getElementById(formType);
    const activeTab = document.querySelector(`[onclick="openForm('${formType}')"]`);

    if (selectedForm) {
        selectedForm.style.display = 'block';
    } else {
        console.error(`Form with id '${formType}' not found.`);
    }

    if (activeTab) {
        activeTab.classList.add('active');
    } else {
        console.error(`Tab with action 'openForm(${formType})' not found.`);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Firebase Configuration
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

    // Initialize Firebase only once
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const db = firebase.firestore(); // Firestore for storing messages
    
    // Ensure the login form is shown by default when the page loads
    const loginFormElement = document.getElementById('login'); // Check if the login form exists
    if (loginFormElement) {
        openForm('login'); // Open the login form by default if it exists
    } else {
        console.log("Login form not found on this page."); // Log this to avoid throwing errors
    }
    
    const buyButton = document.getElementById('buy-btn');
    if (!buyButton) {
        console.error('Buy button (buy-btn) not found in the DOM.');
    }

    switchSection('account');
    
    const rateInput = document.getElementById('rate-amount');

    // Contact Support - Store message in Firebase
    const sendMessageBtn = document.getElementById('send-message-btn');
    if (sendMessageBtn) {
        console.log("Button found. Adding event listener."); // Confirm button exists

        sendMessageBtn.addEventListener('click', function () {
            console.log("Button clicked"); // Debug log for button click

            // Get values from input fields
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;

            // Validate input
            if (name && email && message) {
                console.log("All fields are filled. Proceeding to send to Firestore."); // Debug log

                db.collection("supportMessages").add({
                    name: name,                // Capture user's name
                    email: email,              // Capture user's email
                    message: message,          // Capture the message content
                    timestamp: firebase.firestore.FieldValue.serverTimestamp() // Timestamp
                })
                .then(() => {
                    console.log("Message sent successfully!");
                    document.getElementById('message-status').textContent = "Message sent successfully!";
                    
                    // Clear the input fields
                    document.getElementById('contact-name').value = '';
                    document.getElementById('contact-email').value = '';
                    document.getElementById('contact-message').value = '';
                })
                .catch((error) => {
                    console.error("Error sending message:", error);
                    document.getElementById('message-status').textContent = "Failed to send message.";
                });
            } else {
                console.warn("Please fill in all fields."); // Debug warning
                document.getElementById('message-status').textContent = "Please fill in all fields.";
            }
        });
    }
    
    function fetchRate() {
        const rateDocRef = db.collection("exchangeRates").doc("currentRate");

        rateDocRef.get().then((doc) => {
            if (doc.exists) {
                const rate = doc.data().rate || "-"; // Get the rate from the document
                rateInput.value = rate.toFixed(2); // Set the rate in the input box
            } else {
                console.error("No such document! Ensure the rate exists.");
            }
        }).catch((error) => {
            console.error("Error fetching rate:", error);
        });
    }

    // Call the function to fetch the rate on page load
    fetchRate(); 

    // Firebase Authentication - Signup
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent form submission

            const email = document.getElementById('signup-email').value.toLowerCase().trim(); // Normalize email
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-password-confirm').value;
            const passwordError = document.getElementById('password-error');

            // Check if passwords match
            if (password !== confirmPassword) {
                if (passwordError) {
                    passwordError.style.display = 'block';
                    passwordError.textContent = "Passwords do not match.";
                }
                return;
            }

            // Ensure password is at least 6 characters long
            if (password.length < 6) {
                if (passwordError) {
                    passwordError.style.display = 'block';
                    passwordError.textContent = "Password must be at least 6 characters.";
                }
                return;
            }

            if (passwordError) passwordError.style.display = 'none'; // Hide the error message

            // Sign up the user
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    user.sendEmailVerification()
                        .then(() => {
                            alert("Signup successful! Please check your email to verify your account.");

                            // Create user in Firestore with tmc and totalTMC after signup
                            createUserInFirestore(user.email);
                        })
                        .catch((error) => {
                            console.error("Error sending verification email:", error);
                            alert("Error sending verification email: " + error.message);
                        });
                })
                .catch((error) => {
                    console.error("Error during signup:", error);
                    alert("Signup failed: " + error.message);
                });
        });
    }

    // ✅ Function to create or update a user document in Firestore with initial values
    function createUserInFirestore(userEmail, referralCodeUsed = null) {
        const userDocRef = db.collection("users").doc(userEmail);

        userDocRef.get()
            .then((doc) => {
                if (doc.exists) {
                    console.log("✅ User document already exists. Skipping creation.");
                } else {
                    // ✅ Generate a unique referral code
                    const newReferralCode = generateReferralCode(userEmail);

                    let referrerId = null; // To store the referrer's email

                    // ✅ If a referral code was used, find the referrer
                    if (referralCodeUsed) {
                        db.collection("users")
                            .where("referralCode", "==", referralCodeUsed)
                            .limit(1)
                            .get()
                            .then((snapshot) => {
                                if (!snapshot.empty) {
                                    const referrer = snapshot.docs[0];
                                    referrerId = referrer.id; // Store referrer's user ID
                                }
                            })
                            .catch((error) => {
                                console.error("🚨 Error checking referrer:", error);
                            });
                    }

                    // ✅ Set the user's initial values
                    userDocRef.set({
                        tmc: 0,           // Initial TMC balance
                        totalTMC: 0,      // Total earned TMC
                        usdt: 0,          // USDT balance
                        status: "Not Activated", // Default status
                        email: userEmail, // Save the user's email for reference
                        referralCode: newReferralCode, // Generate a unique referral code
                        referredBy: referralCodeUsed || null, // Store referral code if used
                        referralCount: 0, // Track number of successful referrals
                        createdAt: firebase.firestore.FieldValue.serverTimestamp() // Creation timestamp
                    })
                    .then(() => {
                        console.log("✅ User document created with initial values!");

                        // ✅ If the user was referred, update the referrer's referrals subcollection
                        if (referrerId) {
                            db.collection("users").doc(referrerId)
                                .collection("referrals")
                                .doc(userEmail)
                                .set({
                                    email: userEmail,
                                    status: "Pending", // Will be updated after payment
                                    bonusEarned: 0,
                                    dateJoined: firebase.firestore.FieldValue.serverTimestamp()
                                })
                                .then(() => console.log("✅ Referrer updated with new referral."))
                                .catch((error) => console.error("🚨 Error updating referrer:", error));
                        }
                    })
                    .catch((error) => {
                        console.error("🚨 Error creating user document in Firestore:", error);
                    });
                }
            })
            .catch((error) => {
                console.error("🚨 Error checking user document in Firestore:", error);
            });
    }

    // ✅ Helper function to generate a referral code
    function generateReferralCode(email) {
        return email.split("@")[0].toUpperCase() + Math.floor(1000 + Math.random() * 9000);
    }

    // Firebase Authentication - Login with email verification check
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent form submission

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;

                    if (user.emailVerified) {
                        alert("Login successful!");
                        window.location.href = "personal-cabinet.html"; // Redirect to personal cabinet
                    } else {
                        alert("Please verify your email before logging in.");
                        auth.signOut(); // Sign out the user if not verified
                    }
                })
                .catch((error) => {
                    console.error("Error during login:", error);
                    alert("Login failed: " + error.message);
                });
        });
    }

    // Ensure elements exist before attaching event listeners
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const resetPasswordBtn = document.getElementById('reset-password-btn');

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function () {
            const modal = document.getElementById('password-reset-modal');
            if (modal) {
                modal.style.display = 'flex'; // Show modal
            }
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function () {
            const modal = document.getElementById('password-reset-modal');
            if (modal) {
                modal.style.display = 'none'; // Hide modal
            }
        });
    }

    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', async function () {
            const emailInput = document.getElementById('reset-email');
            if (emailInput) {
                const email = emailInput.value.trim();
                if (!email) {
                    alert('Please enter your email address.');
                    return;
                }

                try {
                    await firebase.auth().sendPasswordResetEmail(email);
                    alert('Password reset link has been sent to your email.');
                    const modal = document.getElementById('password-reset-modal');
                    if (modal) {
                        modal.style.display = 'none'; // Hide modal after success
                    }
                } catch (error) {
                    console.error('Error sending reset email:', error);
                    alert('Error sending password reset link. Please try again later.');
                }
            }
        });
    }

    // Handle authenticated user display settings
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userEmail = user.email.toLowerCase(); // Normalize email
            console.log("Normalized user email:", userEmail);

            displayUserEmail(userEmail); // Show email in relevant sections
            const userStatus = await fetchAccountStatus(user.email); // Fetch and display account status
            updateAccountStatusUI(userStatus);
            fetchTMCBalance(userEmail); // Fetch and display TMC balance
        } else {
            console.log("No user is signed in");
        }
    });

    // Display user email in multiple elements
    function displayUserEmail(email) {
        const emailElements = [document.getElementById('user-email'), document.getElementById('user-email-settings')];
        emailElements.forEach(element => {
            if (element) element.textContent = email;
        });
    }

    // Function to retrieve the account status from Firestore
    async function fetchAccountStatus(userEmail) {
        try {
            const doc = await db.collection('users').doc(userEmail.toLowerCase()).get();
            return doc.exists && doc.data().status ? doc.data().status : 'Not Activated';
        } catch (error) {
            console.error("Error fetching account status:", error);
            return 'Not Activated'; // Default to 'Not Activated' in case of an error
        }
    }

    // Update account status and download section access based on activation
    function updateAccountStatusUI(userStatus) {
        console.log("User Status:", userStatus); // Log the retrieved status
        const accountStatusElement = document.getElementById('account-status');
        const downloadSectionLink = document.getElementById('download-section-link');
        const downloadButton = document.getElementById('download-btn'); // The actual download button

        if (accountStatusElement && downloadSectionLink && downloadButton) {
            const isActivated = userStatus === 'Activated';

            console.log("Is Activated:", isActivated); // Confirm the toggle is as expected

            // Update account status text and classes
            accountStatusElement.textContent = isActivated ? "Activated" : "Not Activated";
            accountStatusElement.classList.toggle('activated', isActivated);
            accountStatusElement.classList.toggle('not-activated', !isActivated);

            // Apply styles to the download link in the side menu
            downloadSectionLink.classList.toggle('disabled', !isActivated);
            downloadSectionLink.style.pointerEvents = isActivated ? 'auto' : 'none';
            downloadSectionLink.style.opacity = isActivated ? '1' : '0.5';

            // Disable the actual download button and make it pale if the account is not activated
            downloadButton.disabled = !isActivated;
            downloadButton.style.opacity = isActivated ? '1' : '0.5';
            downloadButton.style.pointerEvents = isActivated ? 'auto' : 'none';
        }
    }

    // Call the function with the current user's ID
    auth.onAuthStateChanged((user) => {
        if (user) {
            fetchReferralDetails(user.uid);
        }
    });

    // Firebase Authentication Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            auth.signOut().then(() => {
                alert("Logged out!");
                window.location.href = 'index.html';  // Redirect to the main page or login page
            }).catch((error) => {
                console.error("Logout error:", error);
            });
        });
    }
    
    // Ensure the 'Account' section is visible on page load
    const accountSection = document.getElementById('account');
    if (accountSection) {
        accountSection.style.display = 'block';  // Set to visible or any style manipulation
    } else {
        console.error('Element with ID "account" not found.');
    }

    // Function to fetch TMC balance and referral details from Firestore using email
    function fetchTMCBalance(userEmail) {
        console.log("Fetching TMC balance and referral details for user email:", userEmail); // Log the email
        const userDocRef = db.collection("users").doc(userEmail);

        console.log("Firestore document reference:", userDocRef.path);  // Log document path

        userDocRef.get().then((doc) => {
            if (doc.exists) {
                const userData = doc.data(); // Retrieve all user data

                // TMC and USDT balances
                const tmcBalance = parseFloat(userData.tmc) || 0;
                const usdtBalance = parseFloat(userData.usdt) || 0;
                const totalTMCEarned = parseFloat(userData.totalTMC) || 0;

                // Update balance displays
                document.getElementById('tmc-balance').textContent = `${tmcBalance.toFixed(2)} TMC`;
                document.getElementById('usdt-balance-account').textContent = `${usdtBalance.toFixed(2)} USDT`;
                document.getElementById('total-tmc-earned').textContent = `${totalTMCEarned.toFixed(2)} TMC`;

                // Update referral code and usage count
                document.getElementById('user-referral-code').textContent = userData.referralCode || 'N/A';
                document.getElementById('referral-usage-count').textContent = userData.referralCount || 0;

                // Update progress bar
                updateProgress(tmcBalance); // Update progress based on TMC balance
            } else {
                console.log("No such document! Check if the document ID matches the email exactly.");
            }
        }).catch((error) => {
            console.error("Error fetching user document:", error);  // Log error details
        });
    }

    // Function to update progress bar and image based on TMC balance
    function updateProgress(tmcBalance) {
        const progress = document.querySelector('.progress');
        const catPhoto = document.getElementById('cat-photo');

        // Map the TMC balance to 8 stages
        let stage = 1;
        if (tmcBalance >= 100 && tmcBalance < 200) {
            stage = 2;
        } else if (tmcBalance >= 200 && tmcBalance < 300) {
            stage = 3;
        } else if (tmcBalance >= 300 && tmcBalance < 400) {
            stage = 4;
        } else if (tmcBalance >= 400 && tmcBalance < 500) {
            stage = 5;
        } else if (tmcBalance >= 500 && tmcBalance < 600) {
            stage = 6;
        } else if (tmcBalance >= 600 && tmcBalance < 700) {
            stage = 7;
        } else if (tmcBalance >= 700) {
            stage = 8;
        }

        // Update the progress bar width
        progress.style.width = (stage / 8) * 100 + '%';

        // Update the cat photo based on the stage
        catPhoto.src = `path/to/cat-stage-${stage}.png`;
    }

    // Event listener for Buy Button
    document.getElementById('buy-btn').addEventListener('click', async function () {
        console.log('Buy button clicked!');
        const paymentMethod = document.getElementById('payment-options').value;
        console.log('Selected payment method:', paymentMethod);
        const referralCode = document.getElementById('referral-code').value.trim();
        console.log('Entered referral code:', referralCode);

        if (!paymentMethod) {
            alert('Please select a payment method.');
            return;
        }

        try {
            // Validate referral code before processing payment
            if (referralCode && !(await validateReferralCode(referralCode))) {
                alert('Invalid referral code. Please check and try again.');
                return;
            }

            await processPayment(1, 'USD', paymentMethod, `order-123-${paymentMethod}`, referralCode);
            console.log('Payment processing initiated.');
        } catch (error) {
            console.error('Error during payment:', error);
        }
    });

    // Referral Code Logic
    const checkReferralButton = document.getElementById("check-referral-btn");
    const referralInput = document.getElementById("referral-code");
    const referralStatusImage = document.getElementById("referral-status-img");
    const referralFeedback = document.getElementById("referral-feedback");

    const API_URL = "/api/check-referral";
    const USER_REFERRAL_URL = "/api/user-referral"; // API to get user's referral code

    let userReferralCode = ""; // Store user's referral code

    // ✅ Fetch User's Referral Code
    async function getUserReferralCode() {
        try {
            const response = await fetch(USER_REFERRAL_URL);
            const data = await response.json();
            userReferralCode = data.referralCode ? data.referralCode.trim() : "";
            console.log("📌 User's referral code:", userReferralCode);
        } catch (error) {
            console.error("🚨 Error fetching user referral code:", error);
        }
    }

    // ✅ Prevent User from Checking Their Own Referral Code
    referralInput.addEventListener("input", () => {
        if (!userReferralCode) {
            console.warn("⚠️ User referral code is not loaded yet!");
            return;
        }

        if (referralInput.value.trim() === userReferralCode) {
            showFeedback("🚫 You cannot validate your own referral code!", "#f44336", "photo/fail.png");
            checkReferralButton.disabled = true;
        } else {
            referralFeedback.textContent = "";
            checkReferralButton.disabled = false;
        }
    });

    // ✅ Check Referral Code Event
    checkReferralButton.addEventListener("click", async () => {
        const referralCode = referralInput.value.trim(); // Keep original case

        if (!referralCode) {
            showFeedback("⚠️ Please enter a referral code.", "#f44336", "photo/fail.png");
            return;
        }

        if (referralCode === userReferralCode) {
            showFeedback("🚫 You cannot validate your own referral code!", "#f44336", "photo/fail.png");
            return;
        }

        // ✅ Show Loading State
        checkReferralButton.disabled = true;
        showFeedback("⏳ Checking...", "#ff9800", "photo/loading.gif");

        const isValid = await validateReferralCode(referralCode);

        // ✅ Restore Button & Show Result
        checkReferralButton.disabled = false;

        if (isValid) {
            checkReferralButton.classList.add("success");
            showFeedback("✅ Referral code is valid!", "#4caf50", "photo/success.png");
        } else {
            checkReferralButton.classList.add("error");
            showFeedback("❌ Invalid referral code. Try again.", "#f44336", "photo/fail.png");
            referralInput.value = ""; // Clear input for re-entry
            referralInput.focus();
        }

        setTimeout(() => {
            checkReferralButton.classList.remove("success", "error"); // Reset button color after 2 sec
        }, 2000);
    });

    // ✅ Validate Referral Code with Backend
    async function validateReferralCode(referralCode) {
        console.log("🔍 Checking referral code:", referralCode);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ referralCode }), // Keep case-sensitive
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();
            return data.valid;
        } catch (error) {
            console.error("🚨 Error checking referral code:", error);
            showFeedback("⚠️ Error checking referral. Try again later.", "#f44336", "photo/fail.png");
            return false;
        }
    }

    // ✅ Helper Function: Update Feedback UI
    function showFeedback(message, color, imageSrc) {
        referralFeedback.textContent = message;
        referralFeedback.style.color = color;
        referralStatusImage.src = imageSrc;
    }

    // 🔥 Fetch user referral code **before** allowing input
    getUserReferralCode();

    async function processPayment(priceAmount, priceCurrency, paymentMethod, orderId, referralCode, userId, toEmail) {
        console.log("🛠 processPayment called:", { priceAmount, priceCurrency, paymentMethod, orderId, referralCode, userId, toEmail });

        try {
            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: priceAmount, currency: priceCurrency, paymentMethod, orderId })
            });

            const data = await response.json();

            if (response.ok && data.checkoutLink) {
                console.log("✅ Redirecting to:", data.checkoutLink);

                // ✅ Store referral before payment
                if (referralCode) {
                    console.log("📝 Saving referral code:", referralCode);
                    await saveReferralCodeToFirebase(referralCode, userId);
                }

                // ✅ Send payment success & email
                console.log("📤 Sending payment confirmation...");
                await sendPaymentSuccess(userId, priceAmount, toEmail, orderId, priceCurrency);

                window.location.href = data.checkoutLink;
            } else {
                console.error("❌ Payment error:", data.error || "No checkout link.");
                alert("Payment failed.");
            }
        } catch (error) {
            console.error("🚨 Error in processPayment:", error);
        }
    }

    // ✅ Notify Backend & Send Email
    async function sendPaymentSuccess(userId, amountPaid, toEmail, orderId, currency, referralCode = null) {
        try {
            const response = await fetch("/api/payment-success", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, amountPaid, referralCode })
            });

            const data = await response.json();
            if (data.success) {
                console.log("✅ Payment success recorded:", data.message);

                // ✅ Send Confirmation Email from Frontend
                await sendConfirmationEmail(toEmail, orderId, amountPaid, currency);
            } else {
                console.error("❌ Payment success failed:", data.error);
            }
        } catch (error) {
            console.error("🚨 Error sending payment success:", error);
        }
    }

    // ✅ Function to store referral code in Firestore
    async function saveReferralCodeToFirebase(referralCode, userId) {
        try {
            const response = await fetch('/api/store-referral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referralCode, userId }),
            });

            const data = await response.json();
            if (data.success) {
                console.log('✅ Referral code saved successfully:', referralCode);
            } else {
                console.error('❌ Error saving referral code:', data.error);
            }
        } catch (error) {
            console.error('🚨 Error saving referral code:', error);
        }
    }

    // Function to send confirmation email
    async function sendConfirmationEmail(toEmail, orderId, amount, currency) {
        try {
            const subject = 'Payment Confirmation';
            const htmlContent = `
                <p>Thank you for your payment!</p>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Amount:</strong> ${amount} ${currency}</p>
                <p>We appreciate your business and look forward to serving you again.</p>
            `;

            const response = await fetch('https://api.sparkpost.com/api/v1/transmissions', {
                method: 'POST',
                headers: {
                    'Authorization': process.env.SPARKPOST_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    options: {
                        sandbox: false, // Set to true only if using SparkPost's sandbox mode
                    },
                    content: {
                        from: 'noreply@aicontrib.com', // Replace with your verified sending domain email
                        subject: subject,
                        html: htmlContent,
                    },
                    recipients: [{ address: toEmail }],
                }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Email sent successfully:', data);
                return data;
            } else {
                console.error('Failed to send email:', data);
                throw new Error(data.errors[0]?.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error sending email:', error.message);
        }
    }

    // Function to handle download action
    document.getElementById('download-btn').addEventListener('click', function () {
        const downloadLink = document.createElement('a');
        downloadLink.href = 'installers/AIcontrib_Installer.exe';  // Replace with your file URL
        downloadLink.download = 'AIcontrib_Installer.exe';    // Set the download file name
        downloadLink.click();

        // Show download confirmation message
        const message = document.getElementById('download-message');
        message.style.display = 'block';

        // Hide the message after a short delay
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000);
    });

    // Default balances (real data will be fetched from Firebase)
    let tmcBalance = 0;  // Default TMC balance
    let usdtBalance = 0; // Default USDT balance
    let exchangeRate = 0; // Default exchange rate for TMC to USDT

    // Get the input, slider, and balance elements
    const tmcInput = document.getElementById('tmc-amount');
    const tmcSlider = document.getElementById('tmc-slider');
    const usdtInput = document.getElementById('usdt-amount');
    const tmcBalanceDisplay = document.getElementById('tmc-balance-exchange');
    const usdtBalanceDisplay = document.getElementById('usdt-balance-exchange');
    const exchangeRateDisplay = document.getElementById('rate-amount'); // Rate box for displaying the exchange rate

    function downloadWindowsApp() {
        // Path to the Windows installer
        const windowsInstallerPath = 'installers/AIcontrib_Installer.exe';
        
        // Trigger download
        const link = document.createElement('a');
        link.href = windowsInstallerPath;
        link.download = 'AIcontrib_Installer.exe'; // Suggest a filename
        link.click();
        
        // Show confirmation message
        const message = document.getElementById('download-message');
        message.style.display = 'block';
        message.textContent = 'Your download has started!';
    }

    // Firebase Authentication - Fetch balances and exchange rate when user is logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            const userEmail = user.email.toLowerCase().trim(); // Normalize email to lowercase
            
            // Fetch TMC and USDT balances from Firestore in real-time
            const userDocRef = db.collection("users").doc(userEmail);

            // Listen to real-time updates for the user’s document
            userDocRef.onSnapshot((doc) => {
                if (doc.exists) {
                    tmcBalance = parseFloat(doc.data().tmc) || 0;  // Ensure numeric TMC balance
                    usdtBalance = parseFloat(doc.data().usdt) || 0;  // Ensure numeric USDT balance

                    // Update balance displays with fetched values
                    tmcBalanceDisplay.textContent = `${tmcBalance.toFixed(2)} TMC`;
                    usdtBalanceDisplay.textContent = `${usdtBalance.toFixed(2)} USDT`;

                    // Set slider max to TMC balance
                    tmcSlider.max = tmcBalance;
                    tmcSlider.value = 0;  // Start slider at 0
                    tmcInput.value = '';  // Start input empty for the user to type
                    updateTMCSilderBackground(0, tmcBalance); // Update slider background to reflect initial state
                } else {
                    console.log("No such document! Ensure the user data exists.");
                }
            }, (error) => {
                console.error("Error fetching user document in real-time:", error);
            });

            // Fetch exchange rate from Firestore
            const rateDocRef = db.collection("exchangeRates").doc("tmcToUsdt");

            rateDocRef.get().then((rateDoc) => {
                if (rateDoc.exists) {
                    exchangeRate = parseFloat(rateDoc.data().rate);  // Ensure the rate is a floating-point number
                    console.log("Fetched exchange rate:", exchangeRate);

                    if (!isNaN(exchangeRate) && exchangeRate > 0) {
                        exchangeRateDisplay.value = exchangeRate.toFixed(2); // Update the input's value
                    } else {
                        console.error("Fetched exchange rate is invalid.");
                        exchangeRateDisplay.value = "-";
                    }
                } else {
                    console.error("No exchange rate document found!");
                    exchangeRateDisplay.value = "-";
                }
            }).catch((error) => {
                console.error("Error fetching exchange rate document:", error);
            });

        } else {
            console.log("No user is signed in");
        }
    });

    // Sync TMC input box with slider
    tmcInput.addEventListener('input', function () {
        const tmcValue = parseFloat(tmcInput.value);
        if (tmcValue <= tmcBalance && tmcValue >= 50) {
            tmcSlider.value = tmcValue;  // Update slider handle
            updateTMCSilderBackground(tmcValue, tmcSlider.max);

            amountError.style.display = 'none'; // Hide the error message for valid amounts

            // Update USDT value based on the exchange rate
            if (exchangeRate > 0) {
                usdtInput.value = (tmcValue * exchangeRate).toFixed(2);
            } else {
                usdtInput.value = "-";  // Placeholder if the exchange rate is not available
            }
        } else if (tmcValue > 0 && tmcValue < 50) {
            amountError.style.display = 'block'; // Show error for amounts below 50
            tmcInput.value = tmcSlider.value;  // Reset to valid value if out of bounds
        } else {
            amountError.style.display = 'none'; // Hide error if no amount is entered
        }
    });

    // Sync slider with TMC input box
    tmcSlider.addEventListener('input', function () {
        const tmcValue = parseFloat(tmcSlider.value); // Get the current value of the slider
        tmcInput.value = tmcValue; // Sync the TMC input with the slider value

        if (tmcValue >= 50) {
            amountError.style.display = 'none'; // Hide the error message if valid
        } else {
            amountError.style.display = 'block'; // Show the error message if the amount is less than 50
        }

        console.log("Current TMC Value:", tmcValue);
        console.log("Current Exchange Rate:", exchangeRate);

        // Check if exchange rate is valid and greater than 0
        if (!isNaN(exchangeRate) && exchangeRate > 0) {
            usdtInput.value = (tmcValue * exchangeRate).toFixed(2); // Calculate USDT value based on exchange rate
            console.log("Updated USDT Value:", usdtInput.value);
        } else {
            usdtInput.value = "-";  // Placeholder if exchange rate is invalid
            console.error("Invalid exchange rate. Make sure the rate is fetched correctly.");
        }

        // Update the slider background as the user moves the slider
        updateTMCSilderBackground(tmcValue, tmcSlider.max);
    });

    // Function to update the slider background for TMC slider (Exchange section)
    function updateTMCSilderBackground(value, maxValue) {
        const percentage = (value / maxValue) * 100;
        tmcSlider.style.background = `linear-gradient(to right, green ${percentage}%, lightgrey ${percentage}%)`;
    }

    // Placeholder function for the Exchange button click
    document.getElementById('exchange-btn').addEventListener('click', function () {
        const tmcToExchange = parseFloat(tmcInput.value);
        if (tmcToExchange >= 50 && tmcToExchange <= tmcBalance) {
            const usdtToReceive = (tmcToExchange * exchangeRate).toFixed(2);

            // Update Firestore with the new TMC and USDT balances
            const userDocRef = db.collection("users").doc(auth.currentUser.email.toLowerCase().trim());

            // Perform the balance update in a transaction to ensure atomicity
            db.runTransaction((transaction) => {
                return transaction.get(userDocRef).then((userDoc) => {
                    if (!userDoc.exists) {
                        throw "User document does not exist!";
                    }

                    const newTmcBalance = userDoc.data().tmc - tmcToExchange;
                    const newUsdtBalance = userDoc.data().usdt + parseFloat(usdtToReceive);

                    transaction.update(userDocRef, {
                        tmc: newTmcBalance,
                        usdt: newUsdtBalance
                    });
                });
            }).then(() => {
                alert(`Exchanged ${tmcToExchange} TMC for ${usdtToReceive} USDT.`);

                // Automatically update the balances displayed on the page after the transaction
                tmcInput.value = 0; // Reset TMC amount input
                tmcSlider.value = 0; // Reset TMC slider to 0
                usdtInput.value = "-"; // Reset USDT amount to placeholder

                // Fetch updated balances and refresh the display
                userDocRef.get().then((doc) => {
                    if (doc.exists) {
                        tmcBalance = parseFloat(doc.data().tmc) || 0;
                        usdtBalance = parseFloat(doc.data().usdt) || 0;

                        // Update the display with new balances
                        tmcBalanceDisplay.textContent = `${tmcBalance.toFixed(2)} TMC`;
                        usdtBalanceDisplay.textContent = `${usdtBalance.toFixed(2)} USDT`;

                        // Set slider max to new TMC balance
                        tmcSlider.max = tmcBalance;

                        // Update slider background
                        updateTMCSilderBackground(tmcSlider.value, tmcBalance);
                    }
                });
            }).catch((error) => {
                console.error("Transaction failed: ", error);
                alert("Exchange failed. Please try again.");
            });
        } else {
            alert("Invalid TMC amount.");
        }
    });

    const usdtInputSend = document.getElementById('usdt-amount-send');
    const usdtSliderSend = document.getElementById('usdt-slider-send');
    const trcAddressInput = document.getElementById('trc20-address');
    const sendBtn = document.getElementById('send-btn');
    const amountError = document.getElementById('amount-error');
    const addressError = document.getElementById('address-error');
    const usdtBalanceDisplaySend = document.getElementById('usdt-balance-send');

    // Fetch user's USDT balance and update UI
    auth.onAuthStateChanged((user) => {
        if (user) {
            const userEmail = user.email.toLowerCase().trim(); // Normalize email to lowercase
            const userDocRef = db.collection("users").doc(userEmail);

            userDocRef.get().then((doc) => {
                if (doc.exists) {
                    const usdtBalance = parseFloat(doc.data().usdt) || 0;  // Get USDT balance from Firestore

                    // Update balance display
                    usdtBalanceDisplaySend.textContent = `${usdtBalance.toFixed(2)} USDT`;

                    // Set the slider's max to the user's USDT balance
                    usdtSliderSend.max = usdtBalance;
                    usdtSliderSend.value = 0; // Start slider at 0
                    usdtInputSend.value = ''; // Start input empty for the user to type
                    updateSendSliderBackground(0, usdtSliderSend.max); // Update slider background to reflect initial state
                } else {
                    console.error("No such document!");
                }
            }).catch((error) => {
                console.error("Error fetching user document:", error);
            });
        }
    });

    // Sync USDT input box with slider
    usdtInputSend.addEventListener('input', function () {
        const usdtValue = parseFloat(this.value);

        if (usdtValue >= 50) {
            usdtSliderSend.value = usdtValue;
            amountError.style.display = 'none'; // Hide error if amount is valid
            updateSendSliderBackground(usdtValue, usdtSliderSend.max);
            checkAddressAndEnableButton();
        } else if (usdtValue > 0 && usdtValue < 50) {
            amountError.style.display = 'block'; // Show error if amount is below 50
            sendBtn.disabled = true;
        } else {
            amountError.style.display = 'none'; // Hide error if input is empty or less than 50
            sendBtn.disabled = true;
        }
    });

    // Sync slider with USDT input box
    usdtSliderSend.addEventListener('input', function () {
        usdtInputSend.value = this.value;
        updateSendSliderBackground(this.value, this.max);
        checkAddressAndEnableButton();
    });

    // Validate TRC-20 USDT address and enable/disable Send button
    trcAddressInput.addEventListener('input', function () {
        checkAddressAndEnableButton();
    });

    // Function to check both the address and the amount validity
    function checkAddressAndEnableButton() {
        const usdtAddress = trcAddressInput.value.trim();
        const usdtAmount = parseFloat(usdtInputSend.value);

        const isValidAddress = validateTRC20Address(usdtAddress);
        
        if (usdtAddress.length > 0) { // Only show error when user typed or pasted an address
            if (isValidAddress && usdtAmount >= 50) {
                addressError.style.display = 'none';
                sendBtn.disabled = false;
            } else {
                if (!isValidAddress) {
                    addressError.style.display = 'block';
                }
                sendBtn.disabled = true;
            }
        }
    }

    // Placeholder function to validate TRC-20 address (length and pattern check)
    function validateTRC20Address(address) {
        // TRC-20 addresses are typically 34 characters and start with 'T'
        return address.length === 34 && address.startsWith('T');
    }

    // Handle Send button click
    sendBtn.addEventListener('click', function () {
        const usdtAddress = trcAddressInput.value.trim();
        const usdtAmount = parseFloat(usdtInputSend.value);
        
        if (usdtAmount >= 50 && validateTRC20Address(usdtAddress)) {
            alert(`Sending ${usdtAmount} USDT to ${usdtAddress}. Transaction pending confirmation.`);

            // Send the transaction details to Firestore for admin processing
            db.collection("pendingTransactions").add({
                userId: auth.currentUser.email,
                usdtAmount: usdtAmount,
                usdtAddress: usdtAddress,
                status: 'Pending', // Transaction status
                timestamp: firebase.firestore.FieldValue.serverTimestamp() // Timestamp for the transaction
            }).then(() => {
                // Transaction successfully logged
                alert("Transaction successfully logged. It will be processed within 24 hours.");

                // Reset form after submission
                usdtInputSend.value = ''; // Clear USDT input
                usdtSliderSend.value = 0; // Reset slider to 0
                trcAddressInput.value = ''; // Clear the address input
                sendBtn.disabled = true; // Disable the send button

                // Hide error messages
                addressError.style.display = 'none';
                amountError.style.display = 'none';

                // Update the slider background to reflect reset state
                updateSendSliderBackground(0, usdtSliderSend.max);
            }).catch((error) => {
                // Handle error in transaction logging
                console.error("Error submitting transaction:", error);
                alert("An error occurred while logging the transaction. Please try again.");
            });
        }
    });

    // Update the slider background for Send Crypto section based on its value
    function updateSendSliderBackground(value, maxValue) {
        const percentage = (value / maxValue) * 100;
        const slider = document.querySelector('#send input[type="range"]');
        
        slider.style.background = `linear-gradient(to right, green ${percentage}%, lightgrey ${percentage}%)`;
    }

    // ✅ Function to Load Referral Dashboard
    async function loadReferralDashboard(userEmail) {
        if (!userEmail) {
            console.warn("⚠️ No email provided.");
            return;
        }

        try {
            const userRef = db.collection("users").doc(userEmail);
            const referralTable = document.querySelector("#referral-table tbody");
            const totalBonusElement = document.getElementById("total-referral-bonus");
            const referralCodeElement = document.getElementById("user-referral-code");

            if (!referralTable || !totalBonusElement || !referralCodeElement) {
                console.error("❌ Referral dashboard elements not found!");
                return;
            }

            console.log("📡 Listening for referral data...");

            // ✅ Listen for user referral data updates
            userRef.onSnapshot((doc) => {
                if (!doc.exists) {
                    console.warn("⚠️ User data not found!");
                    return;
                }
                const userData = doc.data();
                referralCodeElement.textContent = userData.referralCode || "N/A";
                totalBonusElement.textContent = `${userData.usdt || 0} USDT`;
            });

            // ✅ Listen for real-time referral updates
            userRef.collection("referrals").onSnapshot((snapshot) => {
                referralTable.innerHTML = snapshot.empty ? `<tr><td colspan='4'>No referrals yet</td></tr>` : "";
                
                snapshot.forEach((doc) => {
                    const { email = "N/A", status = "Pending", dateJoined, bonusEarned = 0 } = doc.data();
                    const formattedDate = dateJoined ? new Date(dateJoined).toLocaleDateString() : "N/A";
                    
                    const row = document.createElement("tr");
                    row.innerHTML = `<td>${email}</td><td>${status}</td><td>${formattedDate}</td><td>${bonusEarned} USDT</td>`;
                    referralTable.appendChild(row);
                });
            });
        } catch (error) {
            console.error("🚨 Error loading referral dashboard:", error);
        }
    }

    async function fetchReferralDetails(userEmail) {
        if (!userEmail) {
            console.warn("⚠️ No user email provided for referral fetch.");
            return;
        }

        try {
            console.log("🔍 Fetching referral details for:", userEmail);

            const authToken = await firebase.auth().currentUser.getIdToken(); // ✅ Get Firebase token

            const response = await fetch(`https://www.aicontrib.com/api/user-referral?email=${encodeURIComponent(userEmail)}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`, // ✅ Send token in request
                },
            });

            const text = await response.text();
            console.log("📄 Raw API Response:", text);

            if (!response.ok) {
                throw new Error(`❌ API error: ${response.status} - ${text}`);
            }

            const data = JSON.parse(text);
            console.log("✅ Referral details fetched:", data);
            return data;
        } catch (error) {
            console.error("🚨 Error fetching user referral code:", error);
        }
    }

    // ✅ Copy Referral Code
    function copyReferralCode() {
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

    // ✅ Initialize Referral Dashboard
    document.addEventListener("DOMContentLoaded", () => {
        const copyButton = document.getElementById("copy-referral-code");
        if (copyButton) {
            copyButton.addEventListener("click", copyReferralCode);
        } else {
            console.warn("⚠️ Copy button not found!");
        }

        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                const normalizedEmail = user.email.toLowerCase();
                console.log("✅ Logged-in user:", normalizedEmail);

                loadReferralDashboard(normalizedEmail);
                fetchReferralDetails(normalizedEmail);
            } else {
                console.warn("⚠️ User not logged in. Unable to load referral dashboard.");
            }
        });
    });

    // Change Password Logic
    const changePasswordLink = document.getElementById('change-password-link');
    if (changePasswordLink) {
        changePasswordLink.addEventListener('click', function () {
            const user = auth.currentUser;
            if (user) {
                auth.sendPasswordResetEmail(user.email)
                    .then(() => {
                        alert("A password reset email has been sent to " + user.email);
                    })
                    .catch((error) => {
                        console.error("Error sending password reset email:", error);
                    });
            } else {
                alert("No user is logged in.");
            }
        });
    }

    // Change Language Logic
    function changeLanguage(languageCode) {
        switch (languageCode) {
            case 'en':
                alert("Language switched to English.");
                break;
            case 'es':
                alert("Idioma cambiado a Español.");
                break;
            case 'tr':
                alert("Dil Türkçe olarak değiştirildi.");
                break;
            default:
                alert("Language not supported.");
        }
    }

    // Handle language dropdown functionality
    const languageDropdownBtn = document.getElementById('language-dropdown-btn');
    const languageOptions = document.getElementById('language-options');

    if (languageDropdownBtn) {
        languageDropdownBtn.addEventListener('click', () => {
            languageOptions.classList.toggle('show'); // Toggle visibility of language options
        });
    }
});
