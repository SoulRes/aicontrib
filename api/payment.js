import fetch from 'node-fetch';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { price, currency, orderId } = req.body;

  // Log the request data for debugging
  console.log('Creating payment with the following data:', {
    price,
    currency,
    orderId
  });

  try {
    const response = await fetch(`${process.env.BITPAY_URL}/stores/${process.env.BTCPAY_STORE_ID}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.BITPAY_API_KEY}`, // Use BitPay API token for authorization
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          orderId: orderId,
          itemDesc: "My Product",
          posData: {}
        },
        checkout: {
          speedPolicy: "HighSpeed",
          expirationMinutes: 90,
          monitoringMinutes: 90,
          redirectURL: process.env.SUCCESS_URL || "https://yourdomain.com/success",
          redirectAutomatically: true,
          requiresRefundEmail: false
        },
        amount: price,
        currency: currency,
        additionalSearchTerms: ["product", "my-store"]
      }),
    });

    const data = await response.json();

    if (response.ok && data.checkoutLink) {
      console.log('Payment creation successful:', data);
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
