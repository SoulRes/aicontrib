export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Destructure data from the callback (IPN) request
  const { id, status, orderId } = req.body;

  console.log('IPN Callback received:', { id, status, orderId });

  // Handle payment status and update order in your database
  if (status === 'complete') {
    console.log('Payment confirmed:', orderId);
    // Mark the order as paid in your database
    // For example: await markOrderAsPaid(orderId);
  } else if (status === 'failed') {
    console.log('Payment failed:', orderId);
    // Handle failed payments (e.g., mark the order as failed)
  }

  // Send response to BtcPay to confirm receipt of IPN
  res.status(200).json({ message: 'IPN received' });
};
