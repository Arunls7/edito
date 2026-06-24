const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { email, password, nom, prenom, telephone } = req.body;
    if (!email || !password || !nom || !prenom) return res.status(400).json({ error: 'Champs obligatoires manquants' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hash, nom, prenom, telephone },
      select: { id: true, email: true, nom: true, prenom: true, role: true },
    });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Identifiants incorrects' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role }, token });
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
};

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, nom: true, prenom: true, role: true, telephone: true, createdAt: true },
    });
    res.json(user);
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
};

module.exports = { register, login, me };
