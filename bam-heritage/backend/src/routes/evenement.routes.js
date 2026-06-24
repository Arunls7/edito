const router = require('express').Router();
const ctrl = require('../controllers/evenement.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.get('/admin', authenticate, requireAdmin, ctrl.getAllAdmin);
router.post('/', authenticate, requireAdmin, ctrl.create);
router.put('/:id', authenticate, requireAdmin, ctrl.update);
router.post('/:id/acheter', authenticate, ctrl.acheterBillet);

module.exports = router;
