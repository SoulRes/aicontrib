export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { payment_id, payment_status, order_id } = req.body;

  // Handle payment status and update order in your database
  if (payment_status === 'confirmed') {
    // Mark order as paid
  } else if (payment_status === 'failed') {
    // Handle failed payments
  }

  res.status(200).json({ message: 'IPN received' });
};

