const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const uploadEvidence = require('../middlewares/evidenceUpload');

function parseEvidence(req, res, next) {
	uploadEvidence.single('evidence')(req, res, (err) => {
		if (!err) return next();
		const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
		res.status(status).json({ message: err.message });
	});
}

router.post('/', authenticate, requestController.create);
router.get('/my', authenticate, requestController.myRequests);
router.get('/', authenticate, requireAdmin, requestController.listAll);
router.post('/:id/evidence', authenticate, parseEvidence, requestController.uploadEvidence);
router.get('/:id/evidence', authenticate, requestController.getEvidence);
router.patch('/:id/status', authenticate, requireAdmin, requestController.updateStatus);

module.exports = router;