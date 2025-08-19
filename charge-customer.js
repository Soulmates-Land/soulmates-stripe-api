const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customer_id, amount = 2500 } = req.body; // €25.00 in cents
    
    if (!customer_id) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    // Get customer's saved payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer_id,
      type: 'card',
    });

    if (paymentMethods.data.length === 0) {
      throw new Error('No saved payment method found for this customer');
    }

    // Create and confirm payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      customer: customer_id,
      payment_method: paymentMethods.data[0].id,
      confirm: true,
      off_session: true,
      description: 'Soulmates Founding Membership',
    });

    res.status(200).json({ 
      success: true, 
      payment_intent: paymentIntent.id,
      amount_charged: amount 
    });
  } catch (error) {
    console.error('Charge Error:', error);
    res.status(500).json({ error: error.message });
  }
}
