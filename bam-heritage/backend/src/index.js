require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const { handleStripeWebhook } = require('./controllers/webhook.controller');
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/cours', require('./routes/cours.routes'));
app.use('/api/membre', require('./routes/membre.routes'));
app.use('/api/evenements', require('./routes/evenement.routes'));
app.use('/api/produits', require('./routes/produit.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BAM Heritage API running on port ${PORT}`));
