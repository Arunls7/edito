const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res) => {
  try {
    const { discipline, niveau } = req.query;
    const where = { actif: true };
    if (discipline) where.discipline = discipline;
    if (niveau) where.niveau = niveau;
    const cours = await prisma.cours.findMany({
      where,
      include: { coach: true, _count: { select: { reservations: { where: { statut: 'CONFIRMEE' } } } } },
      orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
    });
    res.json(cours);
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
};

const create = async (req, res) => {
  try {
    const cours = await prisma.cours.create({ data: req.body });
    res.status(201).json(cours);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

const update = async (req, res) => {
  try {
    const cours = await prisma.cours.update({ where: { id: req.params.id }, data: req.body });
    res.json(cours);
  } catch { res.status(404).json({ error: 'Cours introuvable' }); }
};

const remove = async (req, res) => {
  try {
    await prisma.cours.update({ where: { id: req.params.id }, data: { actif: false } });
    res.json({ success: true });
  } catch { res.status(404).json({ error: 'Cours introuvable' }); }
};

const reserver = async (req, res) => {
  try {
    const { coursId } = req.body;
    const userId = req.user.id;
    const cours = await prisma.cours.findUnique({
      where: { id: coursId },
      include: { _count: { select: { reservations: { where: { statut: 'CONFIRMEE' } } } } },
    });
    if (!cours) return res.status(404).json({ error: 'Cours introuvable' });
    if (cours._count.reservations >= cours.capacite) return res.status(409).json({ error: 'Cours complet' });
    const reservation = await prisma.reservation.upsert({
      where: { userId_coursId: { userId, coursId } },
      create: { userId, coursId, statut: 'CONFIRMEE' },
      update: { statut: 'CONFIRMEE' },
    });
    res.status(201).json(reservation);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

const annulerReservation = async (req, res) => {
  try {
    await prisma.reservation.update({ where: { id: req.params.id }, data: { statut: 'ANNULEE' } });
    res.json({ success: true });
  } catch { res.status(404).json({ error: 'Réservation introuvable' }); }
};

const getMesReservations = async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { userId: req.user.id, statut: 'CONFIRMEE' },
      include: { cours: { include: { coach: true } } },
    });
    res.json(reservations);
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
};

module.exports = { getAll, create, update, remove, reserver, annulerReservation, getMesReservations };
