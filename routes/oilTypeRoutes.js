const express = require('express');
const router = express.Router();
const oilTypeController = require('../controllers/oilTypeController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.get('/', oilTypeController.list);
router.post('/', authenticate, requireAdmin, oilTypeController.create);

module.exports = router;