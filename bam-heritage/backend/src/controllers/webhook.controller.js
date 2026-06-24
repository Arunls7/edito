const Stripe = require('stripe');
const { Resend } = require('resend');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, type, evenementId, produitId, quantite } = session.metadata;
    try {
      if (type === 'BILLET') {
        await prisma.$transaction([
          prisma.commande.create({ data: { userId, type: 'BILLET', itemId: evenementId, montant: session.amount_total / 100, statut: 'PAYEE', stripeSessionId: session.id } }),
          prisma.evenement.update({ where: { id: evenementId }, data: { placesRestantes: { decrement: 1 } } }),
        ]);
        const [user, evenement] = await Promise.all([prisma.user.findUnique({ where: { id: userId } }), prisma.evenement.findUnique({ where: { id: evenementId } })]);
        await resend.emails.send({ from: 'BAM Heritage <noreply@bam-heritage.fr>', to: user.email, subject: `Confirmation de billet - ${evenement.nom}`, html: `<h2>Billet confirmé !</h2><p>Bonjour ${user.prenom}, votre billet pour <strong>${evenement.nom}</strong> est confirmé.</p><p>Date : ${new Date(evenement.date).toLocaleDateString('fr-FR')} · Lieu : ${evenement.lieu} · Montant : ${(session.amount_total/100).toFixed(2)}€</p>` });
      }
      if (type === 'PRODUIT') {
        await prisma.$transaction([
          prisma.commande.create({ data: { userId, type: 'PRODUIT', itemId: produitId, montant: session.amount_total / 100, statut: 'PAYEE', stripeSessionId: session.id, quantite: Number(quantite) } }),
          prisma.produit.update({ where: { id: produitId }, data: { stock: { decrement: Number(quantite) } } }),
        ]);
        const [user, produit] = await Promise.all([prisma.user.findUnique({ where: { id: userId } }), prisma.produit.findUnique({ where: { id: produitId } })]);
        await resend.emails.send({ from: 'BAM Heritage <noreply@bam-heritage.fr>', to: user.email, subject: `Confirmation de commande - ${produit.nom}`, html: `<h2>Commande confirmée !</h2><p>Bonjour ${user.prenom}, votre commande de <strong>${produit.nom}</strong> (x${quantite}) est confirmée. Montant : ${(session.amount_total/100).toFixed(2)}€</p>` });
      }
    } catch (err) { console.error('Erreur webhook:', err); }
  }
  res.json({ received: true });
};

module.exports = { handleStripeWebhook };
