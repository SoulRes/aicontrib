const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

const NOWPAYMENTS_API_KEY = 'your_api_key';
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1/';

app.use(bodyParser.json());

// Route for creating a payment
app.post('/create-payment', async (req, res) => {
  try {
    const { priceAmount, orderId } = req.body;
    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}invoice`,
      {
        price_amount: priceAmount,
        price_currency: 'usd', // You can use any currency
        pay_currency: 'usdttrc20', // Payment in TRC-20 USDT
        order_id: orderId,
        ipn_callback_url: 'https://yourdomain.com/ipn',
        success_url: 'https://yourdomain.com/success',
        cancel_url: 'https://yourdomain.com/cancel'
      },
      {
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY
        }
      }
    );
    res.json({ paymentUrl: response.data.invoice_url });
  } catch (error) {
    res.status(500).send({ error: 'Error creating payment' });
  }
});

// IPN (Instant Payment Notification) route for receiving NOWPayments status updates
app.post('/ipn', (req, res) => {
  const paymentData = req.body;
  if (paymentData.payment_status === 'confirmed') {
    const orderId = paymentData.order_id;
    console.log(`Payment confirmed for order ${orderId}`);
  }
  res.status(200).send('OK');
});

app.listen(port, () => console.log(`Server running on port ${port}`));

