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

// Log API key and other relevant variables to verify they are loaded correctly
console.log('BitPay API Key:', process.env.BITPAY_API_KEY);

// API route to handle payment creation using BitPay
app.post('/api/create-payment', async (req, res) => {
  const { price, currency, orderId } = req.body;

  // Log the request data for debugging
  console.log('Creating payment with the following data:', {
    price,
    currency,
    orderId
  });

  try {
    const response = await fetch(`${process.env.BITPAY_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.BITPAY_API_KEY}`, // Use BitPay API key in the token format for authorization
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price: price,          // Price of the product/service
        currency: currency,    // Currency (e.g., USD, BTC)
        orderId: orderId,      // Order ID for tracking purposes
        notificationURL: process.env.IPN_CALLBACK_URL, // Notification callback URL
      }),
    });

    // Log the entire response object for detailed debugging
    console.log('BitPay API full response:', response);

    const data = await response.json();

    // Log the parsed data response
    console.log('Parsed response from BitPay:', data);

    if (response.ok && data.url) {
      // If response is successful, return the payment URL to the frontend
      console.log('Payment creation successful:', data);
      return res.status(200).json(data);
    } else {
      // Log the error details
      console.error('Error in payment creation:', data);
      return res.status(500).json({ error: data.error || 'Error creating payment' });
    }
  } catch (error) {
    // Catch and log any errors during the process
    console.error('Error in payment creation request:', error);
    return res.status(500).json({ error: error.message });
  }
});

// API route to handle the IPN callback from BitPay
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

  // Respond to BitPay that the callback was received successfully
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

