// Example serverless function implementation (Vercel / Netlify style) for creating a Stripe PaymentIntent.
// This file is provided as an example. Do NOT commit real secrets. Use environment variables in deployment.

// For Vercel, save this as /api/create-payment-intent.js
// For Netlify, save under netlify/functions/create-payment-intent.js with small wrapper.

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET || 'sk_test_placeholder');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { amount, currency='inr', metadata } = req.body;
    // Basic validation
    const a = Number(amount);
    if (!a || a <= 0) return res.status(400).json({ error: 'Invalid amount' });

    // Create a PaymentIntent on the server
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(a * 100), // rupees to paise
      currency,
      metadata: metadata || {},
      // optionally: receipt_email, description, customer
    });

    return res.status(200).json({ clientSecret: intent.client_secret, id: intent.id });
  } catch (err) {
    console.error('Stripe create intent error', err);
    return res.status(500).json({ error: 'internal_error' });
  }
};
