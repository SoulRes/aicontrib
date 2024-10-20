// Import necessary modules using ES Modules syntax
import express from 'express';
import fetch from 'node-fetch';
import crypto from 'crypto'; // To handle HMAC for IPN validation
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

const app = express();

// Use built-in middleware to parse JSON requests
app.use(express.json());

// Log API key and IPN Callback URL to verify they are loaded correctly
console.log('NOWPayments API Key:', process.env.NOWPAYMENTS_API_KEY);
console.log('IPN Callback URL:', process.env.IPN_CALLBACK_URL);

// Function to validate the HMAC signature from the IPN request
function validateHMACSignature(params, xNowPaymentsSig, ipnSecret) {
  // Sort the object and create the signature
  const sortedParams = Object.keys(params).sort().reduce((result, key) => {
    result[key] = params[key];
    return result;
  }, {});

  const hmac = crypto.createHmac('sha512', ipnSecret);
  hmac.update(JSON.stringify(sortedParams));
  const signature = hmac.digest('hex');

  return signature === xNowPaymentsSig;
}

// API route to handle payment creation
app.post('/api/create-payment', async (req, res) => {
  const { price_amount, price_currency, pay_currency, order_id } = req.body;

  // Log the request data for debugging
  console.log('Creating payment with the following data:', {
    price_amount,
    price_currency,
    pay_currency,
    order_id,
    ipn_callback_url: process.env.IPN_CALLBACK_URL,
  });

  try {
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY, // Securely use the API key from the environment
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount,
        price_currency,
        pay_currency,
        order_id,
        ipn_callback_url: process.env.IPN_CALLBACK_URL, // Use the IPN callback URL from environment
      }),
    });

    const data = await response.json();

    // Log the entire response for debugging
    console.log('Payment creation response from NOWPayments:', data);

    if (response.ok && data.payment_url) {
      // Return the payment URL to the frontend
      res.status(200).json(data);
    } else {
      // Log and return error
      console.error('Error creating payment:', data.error || 'Unknown error');
      res.status(500).json({ error: data.error || 'Error creating payment' });
    }
  } catch (error) {
    console.error('Error in payment creation request:', error);
    res.status(500).json({ error: error.message });
  }
});

// API route to handle the IPN callback from NOWPayments
app.post('/api/payment-callback', (req, res) => {
  const paymentData = req.body;
  const xNowPaymentsSig = req.headers['x-nowpayments-sig'];

  // Log the payment data received for debugging
  console.log('IPN Callback received:', paymentData);

  // Validate the IPN signature
  const ipnSecret = process.env.IPN_SECRET;
  const isValid = validateHMACSignature(paymentData, xNowPaymentsSig, ipnSecret);

  if (!isValid) {
    console.error('Invalid IPN signature!');
    return res.status(400).send('Invalid IPN signature');
  }

  // Handle the payment status (e.g., confirmed, failed, etc.)
  if (paymentData.payment_status === 'confirmed') {
    console.log('Payment confirmed:', paymentData);
    // Update your database or perform any other actions necessary
  } else if (paymentData.payment_status === 'failed') {
    console.log('Payment failed:', paymentData);
  }

  // Respond to NOWPayments that the callback was received successfully
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

