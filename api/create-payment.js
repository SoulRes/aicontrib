import fetch from 'node-fetch';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { price, currency, orderId, referrerId } = req.body; // Extract referrerId

  // Log the request data for debugging
  console.log('Creating payment with the following data:', {
    price,
    currency,
    orderId,
    referrerId, // Include referrerId in logs
  });

  try {
    const response = await fetch(`${process.env.BTCPAY_URL}/stores/${process.env.BTCPAY_STORE_ID}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.BTCPAY_API_KEY}`, // Use BTCPay API token for authorization
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          orderId: orderId,
          itemDesc: "My Product",
          posData: {
            referrerId: referrerId || null, // Include referrerId in metadata if provided
          },
        },
        checkout: {
          speedPolicy: "HighSpeed",
          expirationMinutes: 90,
          monitoringMinutes: 90,
          redirectURL: process.env.SUCCESS_URL || "https://aicontrib.com/success",
          redirectAutomatically: true,
          requiresRefundEmail: false,
        },
        amount: price,
        currency: currency,
        additionalSearchTerms: ["product", "my-store"],
      }),
    });

    const data = await response.json();

    if (response.ok && data.checkoutLink) {
      console.log('Payment creation successful:', data);

      // Handle referral crediting after successful payment creation
      if (referrerId) {
        await creditReferrer(referrerId, price / 2); // 50% of the payment amount as referral reward
      }

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

// Function to credit the referral reward
async function creditReferrer(referrerId, rewardAmount) {
  try {
    const response = await fetch(`${process.env.YOUR_API_BASE_URL}/api/credit-referrer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`, // Ensure secure internal communication
      },
      body: JSON.stringify({
        referrerId,
        rewardAmount,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('Referral reward credited successfully:', data);
    } else {
      console.error('Failed to credit referral reward:', data.error || 'Unknown error.');
    }
  } catch (error) {
    console.error('Error crediting referral reward:', error);
  }
}

