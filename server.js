require('dotenv').config();
const express = require('express');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const {
  BREVO_API_KEY,
  FROM_EMAIL,
  FROM_NAME = 'Metal Pliage',
  ADMIN_EMAIL,
} = process.env;

if (!BREVO_API_KEY || !FROM_EMAIL || !ADMIN_EMAIL) {
  console.error('[CONFIG] Variables manquantes dans .env : BREVO_API_KEY, FROM_EMAIL, ADMIN_EMAIL');
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: '100kb' }));

// CORS : autorise le front (metal-pliage.fr) à appeler l'API hébergée ailleurs (Render).
// En dev local, on autorise aussi localhost et 127.0.0.1.
const ALLOWED_ORIGINS = new Set([
  'https://metal-pliage.fr',
  'https://www.metal-pliage.fr',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
]);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// Endpoint de warmup : appelé par le frontend quand l'utilisateur arrive sur /contact
// pour réveiller le free tier Render (cold start ~30s) avant la vraie soumission.
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Bloque l'accès direct aux fichiers sensibles
app.use((req, res, next) => {
  const blocked = ['/.env', '/server.js', '/package.json', '/package-lock.json'];
  if (blocked.includes(req.path) || req.path.startsWith('/.git') || req.path.startsWith('/node_modules')) {
    return res.status(404).send('404 Not Found');
  }
  next();
});

// Fichiers statiques (HTML, CSS, JS, images) — utile uniquement en dev local.
// En prod sur Render, le service n'a pas vocation à servir les pages HTML
// (elles sont servies par GitHub Pages sur metal-pliage.fr).
app.use(express.static(__dirname, {
  extensions: ['html'],
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache');
  },
}));

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

async function sendBrevoEmail({ to, subject, htmlContent, replyTo }) {
  const body = {
    sender: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: to }],
    subject,
    htmlContent,
  };
  if (replyTo) body.replyTo = replyTo;

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Brevo ${response.status} : ${text}`);
  }
  return response.json();
}

app.post('/api/contact', async (req, res) => {
  const { name, company, email, phone, product, message } = req.body || {};

  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Nom et email obligatoires.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email invalide.' });
  }
  if (name.length > 200 || (message ?? '').length > 5000) {
    return res.status(400).json({ error: 'Champs trop longs.' });
  }

  const safe = {
    name: escapeHtml(name),
    company: escapeHtml(company),
    email: escapeHtml(email),
    phone: escapeHtml(phone),
    product: escapeHtml(product),
    message: escapeHtml(message).replace(/\n/g, '<br>'),
  };

  const adminHtml = `
    <h2 style="font-family:sans-serif">Nouvelle demande de contact</h2>
    <table cellpadding="6" style="font-family:sans-serif;border-collapse:collapse">
      <tr><td><strong>Nom</strong></td><td>${safe.name}</td></tr>
      <tr><td><strong>Société</strong></td><td>${safe.company || '—'}</td></tr>
      <tr><td><strong>Email</strong></td><td><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
      <tr><td><strong>Téléphone</strong></td><td>${safe.phone || '—'}</td></tr>
      <tr><td><strong>Produit</strong></td><td>${safe.product || '—'}</td></tr>
    </table>
    <hr>
    <p style="font-family:sans-serif"><strong>Message :</strong></p>
    <p style="font-family:sans-serif">${safe.message || '<em>(vide)</em>'}</p>
  `;

  const clientHtml = `
    <div style="font-family:sans-serif;max-width:560px">
      <h2>Merci pour votre demande, ${safe.name}</h2>
      <p>Nous avons bien reçu votre message et vous répondrons sous 24h ouvrées.</p>
      <p>Rappel de votre demande :</p>
      <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">
        ${safe.message || '<em>(pas de message)</em>'}
      </blockquote>
      <p>À très bientôt,<br>L'équipe Metal Pliage</p>
    </div>
  `;

  try {
    await sendBrevoEmail({
      to: ADMIN_EMAIL,
      subject: `[Metal Pliage] Nouvelle demande — ${name}`,
      htmlContent: adminHtml,
      replyTo: { email, name },
    });

    await sendBrevoEmail({
      to: email,
      subject: 'Nous avons bien reçu votre demande — Metal Pliage',
      htmlContent: clientHtml,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('[BREVO]', err.message);
    res.status(500).json({ error: "Erreur d'envoi du message. Réessayez plus tard ou écrivez-nous directement." });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré : http://localhost:${PORT}`);
});
