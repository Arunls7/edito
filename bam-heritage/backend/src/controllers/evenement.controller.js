const Stripe = require('stripe');
const { Resend } = require('resend');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const getAll = async (req, res) => {
  try {
    const evenements = await prisma.evenement.findMany({ where: { actif: true }, orderBy: { date: 'asc' } });
    res.json(evenements);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getAllAdmin = async (req, res) => {
  try {
    const evenements = await prisma.evenement.findMany({ orderBy: { date: 'asc' } });
    res.json(evenements);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const create = async (req, res) => {
  try {
    const { nom, description, date, lieu, prix, placesTotal, imageUrl } = req.body;
    const stripeProduct = await stripe.products.create({ name: nom, description });
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(prix * 100),
      currency: 'eur',
    });
    const evenement = await prisma.evenement.create({
      data: { nom, description, date: new Date(date), lieu, prix, placesTotal, placesRestantes: placesTotal, imageUrl, stripeId: stripePrice.id },
    });
    res.status(201).json(evenement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const evenement = await prisma.evenement.update({ where: { id: req.params.id }, data: req.body });
    res.json(evenement);
  } catch {
    res.status(404).json({ error: 'Evenement introuvable' });
  }
};

const acheterBillet = async (req, res) => {
  try {
    const evenement = await prisma.evenement.findUnique({ where: { id: req.params.id } });
    if (!evenement || !evenement.actif) return res.status(404).json({ error: 'Evenement introuvable' });
    if (evenement.placesRestantes <= 0) return res.status(409).json({ error: 'Plus de places disponibles' });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: evenement.stripeId, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/membre/paiements?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/?cancelled=true`,
      metadata: { userId: req.user.id, evenementId: evenement.id, type: 'BILLET' },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getAllAdmin, create, update, acheterBillet };
