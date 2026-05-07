require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/create-checkout-session', async (req, res) => {
  const { items } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Panier vide' });
  }

  try {
    const line_items = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Couvertine métallique — ${item.finish}`,
          description: `Longueur : ${item.length}`,
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    const origin = req.headers.origin || `http://localhost:${process.env.PORT || 3000}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/commande-confirmee.html`,
      cancel_url: `${origin}/#shop`,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur Metal Pliage → http://localhost:${PORT}`);
});
