const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

router.get('/stats', ctrl.getStats);
router.get('/membres', ctrl.getMembres);
router.put('/membres/:id', ctrl.updateMembre);
router.get('/popup', ctrl.getPopupConfig);
router.put('/popup', ctrl.updatePopupConfig);

module.exports = router;
