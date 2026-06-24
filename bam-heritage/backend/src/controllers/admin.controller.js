const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMembres = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const where = search ? { OR: [{ nom: { contains: search, mode: 'insensitive' } }, { prenom: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {};
    const [membres, total] = await Promise.all([
      prisma.user.findMany({ where, select: { id: true, email: true, nom: true, prenom: true, role: true, createdAt: true, abonnements: { orderBy: { createdAt: 'desc' }, take: 1 } }, skip: Number(skip), take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);
    res.json({ membres, total, page: Number(page), limit: Number(limit) });
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
};

const updateMembre = async (req, res) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: req.body, select: { id: true, email: true, nom: true, prenom: true, role: true } });
    res.json(user);
  } catch { res.status(404).json({ error: 'Membre introuvable' }); }
};

const getPopupConfig = async (req, res) => {
  try {
    let config = await prisma.popupConfig.findFirst();
    if (!config) config = await prisma.popupConfig.create({ data: {} });
    res.json(config);
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
};

const updatePopupConfig = async (req, res) => {
  try {
    let config = await prisma.popupConfig.findFirst();
    if (!config) config = await prisma.popupConfig.create({ data: req.body });
    else config = await prisma.popupConfig.update({ where: { id: config.id }, data: req.body });
    res.json(config);
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
};

const getStats = async (req, res) => {
  try {
    const [totalMembres, abonnementsActifs, reservationsAujourdhui] = await Promise.all([
      prisma.user.count({ where: { role: 'MEMBRE' } }),
      prisma.abonnement.count({ where: { statut: 'ACTIF' } }),
      prisma.reservation.count({ where: { statut: 'CONFIRMEE', createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
    ]);
    res.json({ totalMembres, abonnementsActifs, reservationsAujourdhui });
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
};

module.exports = { getMembres, updateMembre, getPopupConfig, updatePopupConfig, getStats };
