import fetch from 'node-fetch';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { price, currency, orderId } = req.body;

  // Log the request data and environment variables for debugging
  console.log('Creating payment with the following data:', {
    price,
    currency,
    orderId,
    ipn_callback_url: process.env.IPN_CALLBACK_URL,
  });

  console.log('API Key:', process.env.BITPAY_API_KEY);
  console.log('IPN Callback URL:', process.env.IPN_CALLBACK_URL);

  if (!process.env.BITPAY_API_KEY || !process.env.IPN_CALLBACK_URL) {
    return res.status(500).json({ error: 'API Key or IPN Callback URL is missing in environment variables.' });
  }

  try {
    // Send request to BitPay API to create the invoice
    const response = await fetch(`${process.env.BITPAY_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.BITPAY_API_KEY}`, // Use the API Key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price,         // Price of the product/service
        currency,      // Currency (e.g., USD, BTC)
        orderId,       // Your custom order ID
        notificationURL: process.env.IPN_CALLBACK_URL, // IPN Callback URL for notifications
      }),
    });

    const contentType = response.headers.get('content-type');

    // Ensure response is JSON
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (response.ok && data.url) {
        return res.status(200).json(data);  // Return payment URL to frontend
      } else {
        console.error('Error creating payment:', data);
        return res.status(response.status).json({ error: data.error || 'Error creating payment' });
      }
    } else {
      const text = await response.text();
      console.error('Unexpected response format:', text);
      return res.status(500).json({ error: 'Unexpected response format from BitPay' });
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json({ error: error.message });
  }
};
