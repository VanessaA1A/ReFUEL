const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

router.post('/', authenticate, requestController.create);
router.get('/my', authenticate, requestController.myRequests);
router.get('/', authenticate, requireAdmin, requestController.listAll);
router.patch('/:id/status', authenticate, requireAdmin, requestController.updateStatus);

module.exports = router;