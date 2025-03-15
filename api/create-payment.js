import fetch from 'node-fetch';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { price, currency, orderId, userId, referralCode } = req.body;

  console.log('🔄 Creating payment with:', {
    price,
    currency,
    orderId,
    userId,
    referralCode: referralCode || 'No referral',
  });

  try {
    const response = await fetch(`${process.env.BTCPAY_URL}/stores/${process.env.BTCPAY_STORE_ID}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.BTCPAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: price,
        currency: currency,
        metadata: {
          orderId,
          userId, // ✅ Ensures userId is correctly sent to webhook
          ...(referralCode ? { referralCode } : {}), // ✅ Only send referralCode if it exists
          itemDesc: "My Product"
        },
        checkout: {
          speedPolicy: "HighSpeed",
          expirationMinutes: 90,
          monitoringMinutes: 90,
          redirectURL: process.env.SUCCESS_URL || "https://aicontrib.com/success",
          redirectAutomatically: true,
          requiresRefundEmail: false,
        },
        additionalSearchTerms: ["product", "my-store"],
        posData: JSON.stringify({ userId, referralCode }) // ✅ Correctly formatted for BTCPay
      }),
    });

    const data = await response.json();

    if (response.ok && data.checkoutLink) {
      console.log('✅ Payment created successfully:', data);
      return res.status(200).json(data);
    } else {
      console.error('❌ Payment creation failed:', data);
      return res.status(500).json({ error: data.error || 'Failed to create payment' });
    }
  } catch (error) {
    console.error('🚨 Error in create-payment:', error);
    return res.status(500).json({ error: error.message });
  }
};

