const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboard = async (req, res) => {
  try {
    const [user, abonnements, reservations] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, email: true, nom: true, prenom: true, telephone: true } }),
      prisma.abonnement.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 1 }),
      prisma.reservation.findMany({ where: { userId: req.user.id, statut: 'CONFIRMEE' }, include: { cours: { include: { coach: true } } }, take: 5 }),
    ]);
    res.json({ user, abonnement: abonnements[0] || null, prochainsCoursReserves: reservations });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const updateProfil = async (req, res) => {
  try {
    const { nom, prenom, telephone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { nom, prenom, telephone },
      select: { id: true, email: true, nom: true, prenom: true, telephone: true },
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hash } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getPaiements = async (req, res) => {
  try {
    const abonnements = await prisma.abonnement.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
    res.json(abonnements);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { getDashboard, updateProfil, updatePassword, getPaiements };
