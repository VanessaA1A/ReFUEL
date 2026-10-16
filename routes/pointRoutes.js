const express = require('express');
const router = express.Router();
const pointController = require('../controllers/pointController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.get('/', pointController.list);
router.get('/:id', pointController.get);
router.post('/', authenticate, requireAdmin, pointController.create);
router.put('/:id', authenticate, requireAdmin, pointController.update);
router.delete('/:id', authenticate, requireAdmin, pointController.remove);

module.exports = router;

const express = require('express');
const router = express.Router();
const pointController = require('../controllers/pointController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.get('/', pointController.list);
router.get('/nearby', pointController.nearby);   // ⭐ NUEVO (debe ir ANTES de /:id)
router.get('/:id', pointController.get);
router.post('/', authenticate, requireAdmin, pointController.create);
router.put('/:id', authenticate, requireAdmin, pointController.update);
router.delete('/:id', authenticate, requireAdmin, pointController.remove);

module.exports = router;