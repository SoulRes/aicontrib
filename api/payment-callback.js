import sendConfirmationEmail from './sendConfirmationEmail'; // Import your email-sending function

// Mock database structure for storing orders (use a real database in production)
const orders = {}; // Replace with your actual database logic

// Callback function to handle payment status updates from BTCPay (IPN Callback)
export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Destructure data from the callback (IPN) request
  const { id, status, orderId } = req.body;

  console.log('IPN Callback received:', { id, status, orderId });

  try {
    if (status === 'complete') {
      console.log('Payment confirmed:', orderId);

      // Retrieve the order details from your database
      const orderDetails = orders[orderId]; // Replace with actual DB query, e.g., findOrderById(orderId)

      if (orderDetails) {
        const { email, price, currency } = orderDetails;

        // Send a payment confirmation email to the user
        await sendConfirmationEmail(
          email,
          'Payment Confirmation',
          `
            <p>Thank you for your payment of ${price} ${currency}!</p>
            <p>Your order ID is: ${orderId}</p>
          `
        );

        console.log('Confirmation email sent to:', email);
      } else {
        console.error(`Order not found for orderId: ${orderId}`);
      }
      
      // Optional: Mark the order as paid in your database if necessary
      // await markOrderAsPaid(orderId);

    } else if (status === 'failed') {
      console.log('Payment failed:', orderId);

      // Handle failed payments as necessary (e.g., mark as failed in your database)
      // await markOrderAsFailed(orderId);
    }

    // Send response to BTCPay to confirm receipt of IPN
    res.status(200).json({ message: 'IPN received' });

  } catch (error) {
    console.error('Error handling IPN callback:', error);
    res.status(500).json({ error: 'Failed to process IPN' });
  }
};
