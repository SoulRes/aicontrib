import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { price_amount, price_currency, pay_currency } = req.body;

  // Your NOWPayments API key
  const API_KEY = process.env.NOWPAYMENTS_API_KEY; // store this in .env.local

  try {
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount,
        price_currency,
        pay_currency,
        order_id: `order_${Date.now()}`,
        order_description: "Purchase License",
        ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/nowpayments-webhook`,
      }),
    });

    const data = await response.json();

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
