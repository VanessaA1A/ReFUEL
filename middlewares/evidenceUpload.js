const multer = require('multer');

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const uploadEvidence = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new Error('La evidencia debe ser una imagen JPEG, PNG o WebP'));
    }
    callback(null, true);
  },
});

module.exports = uploadEvidence;