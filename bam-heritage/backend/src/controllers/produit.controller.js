const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getAll = async (req, res) => {
  try {
    const produits = await prisma.produit.findMany({ where: { actif: true } });
    res.json(produits);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getAllAdmin = async (req, res) => {
  try {
    const produits = await prisma.produit.findMany();
    res.json(produits);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const create = async (req, res) => {
  try {
    const { nom, description, prix, stock, imageUrl, categorie } = req.body;
    const stripeProduct = await stripe.products.create({ name: nom, description, images: imageUrl ? [imageUrl] : [] });
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(prix * 100),
      currency: 'eur',
    });
    const produit = await prisma.produit.create({
      data: { nom, description, prix, stock, imageUrl, categorie, stripeId: stripePrice.id },
    });
    res.status(201).json(produit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const produit = await prisma.produit.update({ where: { id: req.params.id }, data: req.body });
    res.json(produit);
  } catch {
    res.status(404).json({ error: 'Produit introuvable' });
  }
};

const acheter = async (req, res) => {
  try {
    const { produitId, quantite = 1 } = req.body;
    const produit = await prisma.produit.findUnique({ where: { id: produitId } });
    if (!produit || !produit.actif) return res.status(404).json({ error: 'Produit introuvable' });
    if (produit.stock < quantite) return res.status(409).json({ error: 'Stock insuffisant' });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: produit.stripeId, quantity: quantite }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/membre/paiements?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/?cancelled=true`,
      metadata: { userId: req.user.id, produitId: produit.id, type: 'PRODUIT', quantite },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getAllAdmin, create, update, acheter };
