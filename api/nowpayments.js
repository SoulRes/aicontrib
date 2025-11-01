// nowpayments.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, currency, referralCode, order_description } = req.body;

  const API_KEY = process.env.NOWPAYMENTS_API_KEY;
  const BASE_URL = "https://api.nowpayments.io/v1";

  try {
    const response = await fetch(`${BASE_URL}/invoice`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: currency,
        pay_currency: "usdttrc20", // or any supported crypto
        order_id: `order_${Date.now()}`,
        order_description,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/nowpayments-webhook`,

        // ✅ Redirect URLs:
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/failed`,
      }),
    });

    const data = await response.json();
    console.log("NOWPayments Invoice:", data);

    if (data.invoice_url) {
      return res.status(200).json({ invoice_url: data.invoice_url });
    } else {
      return res.status(500).json({ error: data });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create invoice" });
  }
}
