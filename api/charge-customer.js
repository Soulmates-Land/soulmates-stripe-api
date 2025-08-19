const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
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
    const { customer_id } = req.body;
    
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer_id,
      type: 'card',
    });

    if (paymentMethods.data.length === 0) {
      throw new Error('No saved payment method found');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2500,
      currency: 'eur',
      customer: customer_id,
      payment_method: paymentMethods.data[0].id,
      confirm: true,
      off_session: true,
      description: 'Soulmates Founding Membership'
    });

    res.status(200).json({
      success: true,
      payment_intent: paymentIntent.id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
