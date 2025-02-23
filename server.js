// Import necessary modules using ES Modules syntax
import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import admin from 'firebase-admin'; // Firebase Admin SDK
import fs from 'fs';

// Load environment variables from the .env file
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // Allow requests from any origin

// Log API keys and relevant variables to verify they are loaded correctly
console.log('BTCPay API Key:', process.env.BTCPAY_API_KEY || 'Not Found');
console.log('BTCPay Store ID:', process.env.BTCPAY_STORE_ID || 'Not Found');
console.log('BTCPay URL:', process.env.BTCPAY_URL || 'Not Found');

const serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_CREDENTIALS, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.firestore();

/**
 * 🟢 API: Check Referral Code Validity
 */
app.post('/api/check-referral', async (req, res) => {
  const { referralCode } = req.body;

  console.log('Checking referral code:', referralCode);

  if (!referralCode) {
    return res.status(400).json({ error: 'Referral code is required' });
  }

  try {
    const querySnapshot = await db
      .collection('users')
      .where('referralCode', '==', referralCode)
      .get();

    if (querySnapshot.empty) {
      console.log('Invalid referral code:', referralCode);
      return res.status(404).json({ valid: false, message: 'Invalid referral code' });
    }

    console.log('Valid referral code:', referralCode);
    res.json({ valid: true, message: 'Referral code is valid' });
  } catch (error) {
    console.error('Error checking referral code:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 🟢 API: Create Payment using BTCPay
 */
app.post('/api/create-payment', async (req, res) => {
  const { price, currency, orderId } = req.body;

  console.log('Creating payment with:', { price, currency, orderId });

  try {
    const btcpayUrl = `${process.env.BTCPAY_URL}/stores/${process.env.BTCPAY_STORE_ID}/invoices`;

    const response = await fetch(btcpayUrl, {
      method: 'POST',
      headers: {
        Authorization: `token ${process.env.BTCPAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          orderId: orderId,
          itemDesc: 'My Product',
          posData: {},
        },
        checkout: {
          speedPolicy: 'HighSpeed',
          redirectURL: process.env.SUCCESS_URL,
          redirectAutomatically: true,
          requiresRefundEmail: false,
        },
        amount: price,
        currency: currency,
      }),
    });

    const data = await response.json();

    if (response.ok && data.id) {
      const checkoutUrl = `${process.env.BTCPAY_URL}/i/${data.id}`;
      console.log('Payment successful. Redirect to:', checkoutUrl);
      return res.status(200).json({ paymentUrl: checkoutUrl });
    } else {
      console.error('Payment error:', data);
      return res.status(500).json({ error: data.error || 'Error creating payment' });
    }
  } catch (error) {
    console.error('Payment request error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 🟢 API: Handle BTCPay IPN Callback
 */
app.post('/api/payment-callback', (req, res) => {
  const paymentData = req.body;

  console.log('IPN Callback received:', paymentData);

  if (paymentData.status === 'complete') {
    console.log('Payment confirmed:', paymentData);
  } else if (paymentData.status === 'failed') {
    console.log('Payment failed:', paymentData);
  }

  res.status(200).send('IPN callback received');
});

// Get current directory (__dirname not available in ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
