import sendConfirmationEmail from './sendConfirmationEmail'; // Import your email-sending function
import db from './firebase'; // Import Firebase Firestore configuration

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

      // Retrieve the order details from Firestore
      const orderDoc = await db.collection('orders').doc(orderId).get();
      
      if (orderDoc.exists) {
        const orderDetails = orderDoc.data();
        const { email, price, currency, userId } = orderDetails;

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

        // Update the user's account status to 'Activated' in Firestore
        await db.collection('users').doc(userId).update({ status: 'Activated' });

        console.log('User account status set to "Activated" for userId:', userId);
      } else {
        console.error(`Order not found for orderId: ${orderId}`);
      }

    } else if (status === 'failed') {
      console.log('Payment failed:', orderId);

      // Handle failed payments as necessary (e.g., mark as failed in your database)
      await db.collection('orders').doc(orderId).update({ status: 'failed' });
    }

    // Send response to BTCPay to confirm receipt of IPN
    res.status(200).json({ message: 'IPN received' });

  } catch (error) {
    console.error('Error handling IPN callback:', error);
    res.status(500).json({ error: 'Failed to process IPN' });
  }
};
