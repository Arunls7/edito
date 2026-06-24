const router = require('express').Router();
const ctrl = require('../controllers/produit.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.get('/admin', authenticate, requireAdmin, ctrl.getAllAdmin);
router.post('/', authenticate, requireAdmin, ctrl.create);
router.put('/:id', authenticate, requireAdmin, ctrl.update);
router.post('/acheter', authenticate, ctrl.acheter);

module.exports = router;
