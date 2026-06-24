const router = require('express').Router();
const ctrl = require('../controllers/membre.controller');
const { authenticate } = require('../middleware/auth');

router.get('/dashboard', authenticate, ctrl.getDashboard);
router.put('/profil', authenticate, ctrl.updateProfil);
router.put('/password', authenticate, ctrl.updatePassword);
router.get('/paiements', authenticate, ctrl.getPaiements);

module.exports = router;
