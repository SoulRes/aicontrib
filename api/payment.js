import fetch from 'node-fetch';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { price_amount, price_currency, order_id } = req.body;

  // Log the request data and environment variables for debugging
  console.log('Creating payment with the following data:', {
    price_amount,
    price_currency,
    order_id,
    ipn_callback_url: process.env.IPN_CALLBACK_URL,
  });

  console.log('BitPay API Key:', process.env.BITPAY_API_KEY);
  console.log('IPN Callback URL:', process.env.IPN_CALLBACK_URL);

  if (!process.env.BITPAY_API_KEY || !process.env.IPN_CALLBACK_URL) {
    return res.status(500).json({ error: 'API Key or IPN Callback URL is missing in environment variables.' });
  }

  try {
    const response = await fetch(`${process.env.BITPAY_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.BITPAY_API_KEY}`, // Use BitPay API token for authorization
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price: price_amount,          // Price of the product/service
        currency: price_currency,     // Currency (e.g., USD, BTC)
        orderId: order_id,            // Order ID for tracking purposes
        notificationURL: process.env.IPN_CALLBACK_URL, // Notification callback URL
      }),
    });

    const data = await response.json();

    // Log the parsed response data for debugging
    console.log('Parsed response from BitPay:', data);

    if (response.ok && data.url) {
      // If successful, return the payment URL to the frontend
      return res.status(200).json(data);
    } else {
      console.error('Error creating payment:', data);
      return res.status(500).json({ error: data.message || 'Error creating payment' });
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json({ error: error.message });
  }
};
