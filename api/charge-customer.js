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
    const { name, email, city, intentions, instagram } = req.body;
    
    const customer = await stripe.customers.create({
      name: name,
      email: email,
      metadata: { city: city || '', intentions: intentions || '', instagram: instagram || '' }
    });

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      usage: 'off_session',
      payment_method_types: ['card'],
    });

    res.status(200).json({
      client_secret: setupIntent.client_secret,
      customer_id: customer.id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
