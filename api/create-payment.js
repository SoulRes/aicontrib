import fetch from 'node-fetch';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { price_amount, price_currency, pay_currency, order_id } = req.body;

  // Log the request data and environment variables for debugging
  console.log('Creating payment with the following data:', {
    price_amount,
    price_currency,
    pay_currency,
    order_id,
    ipn_callback_url: process.env.IPN_CALLBACK_URL,
  });

  console.log('API Key:', process.env.NOWPAYMENTS_API_KEY);
  console.log('IPN Callback URL:', process.env.IPN_CALLBACK_URL);

  if (!process.env.NOWPAYMENTS_API_KEY || !process.env.IPN_CALLBACK_URL) {
    return res.status(500).json({ error: 'API Key or IPN Callback URL is missing in environment variables.' });
  }

  try {
    const response = await fetch('https://api.nowpayments.io/v1/payment', {
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

    const contentType = response.headers.get('content-type');

    // Ensure response is JSON
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (response.ok && data.payment_url) {
        return res.status(200).json(data);
      } else {
        console.error('Error creating payment:', data);
        return res.status(response.status).json({ error: data.message || 'Error creating payment' });
      }
    } else {
      const text = await response.text();
      console.error('Unexpected response format:', text);
      return res.status(500).json({ error: 'Unexpected response format from NOWPayments' });
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json({ error: error.message });
  }
};
