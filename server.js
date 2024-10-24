// Import necessary modules using ES Modules syntax
import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors'; // To handle cross-origin requests

// Load environment variables from the .env file
dotenv.config();

const app = express();

// Use built-in middleware to parse JSON requests and handle CORS
app.use(express.json());
app.use(cors()); // Allow requests from any origin

// Log environment variables for debugging
console.log('BtcPay API Key:', process.env.BTCPAY_API_KEY);
console.log('BtcPay Store ID:', process.env.BTCPAY_STORE_ID);
console.log('BtcPay URL:', process.env.BTCPAY_URL);
console.log('IPN Callback URL:', process.env.IPN_CALLBACK_URL);

// API route to handle payment creation using BtcPay
app.post('/api/create-payment', async (req, res) => {
  const { price, currency, orderId } = req.body;

  // Log the request data for debugging
  console.log('Creating payment with the following data:', {
    price,
    currency,
    orderId,
  });

  if (!process.env.BTCPAY_API_KEY || !process.env.BTCPAY_STORE_ID || !process.env.BTCPAY_URL) {
    console.error('Missing required environment variables');
    return res.status(500).json({ error: 'Missing required environment variables.' });
  }

  try {
    const apiUrl = `${process.env.BTCPAY_URL}/stores/${process.env.BTCPAY_STORE_ID}/invoices`;
    console.log('BtcPay API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.BTCPAY_API_KEY}`, // Use BtcPay API token for authorization
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          orderId: orderId,         // Order ID for tracking purposes
          itemDesc: "My Product",   // Description of the product
          posData: {}
        },
        checkout: {
          speedPolicy: "HighSpeed",       // Fast transaction processing
          expirationMinutes: 90,          // Payment expiration time
          monitoringMinutes: 90,          // Monitoring time for payment confirmations
          redirectURL: process.env.SUCCESS_URL || "https://aicontrib.com/success", // Redirect to success page
          redirectAutomatically: true,    // Redirect automatically after payment
          requiresRefundEmail: false
        },
        amount: price,            // Price of the product/service
        currency: currency,        // Currency (e.g., USD, BTC)
        additionalSearchTerms: ["product", "my-store"] // Optional search terms
      }),
    });

    // Log the entire response object for detailed debugging
    console.log('BtcPay API response status:', response.status);
    console.log('BtcPay API headers:', response.headers);

    const data = await response.json();

    // Log the parsed data response
    console.log('Parsed response from BtcPay:', data);

    if (response.ok && data.checkoutLink) {
      // If response is successful, return the payment URL to the frontend
      console.log('Payment creation successful:', data);
      return res.status(200).json(data);
    } else {
      // Log the error details
      console.error('Error in payment creation:', data);
      return res.status(500).json({ error: data.message || 'Error creating payment' });
    }
  } catch (error) {
    // Catch and log any errors during the process
    console.error('Error in payment creation request:', error);
    return res.status(500).json({ error: error.message });
  }
});

// API route to handle the IPN callback from BtcPay
app.post('/api/payment-callback', (req, res) => {
  const paymentData = req.body;

  // Log the payment data received for debugging
  console.log('IPN Callback received:', paymentData);

  // Handle the payment status (e.g., confirmed, failed, etc.)
  if (paymentData.status === 'complete') {
    console.log('Payment confirmed:', paymentData);
    // Update your database or perform any other actions necessary
  } else if (paymentData.status === 'failed') {
    console.log('Payment failed:', paymentData);
  }

  // Respond to BtcPay that the callback was received successfully
  res.status(200).send('IPN callback received');
});

// Get current directory (since __dirname is not available in ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

