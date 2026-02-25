const multer = require('multer');
const path = require('path');

const stockage = multer.diskStorage({
  destination: (req, fichier, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, fichier, cb) => {
    const nomUnique = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(fichier.originalname)}`;
    cb(null, nomUnique);
  },
});

const filtreTypes = (req, fichier, cb) => {
  const typesAutorises = ['image/jpeg', 'image/png', 'image/webp'];
  if (typesAutorises.includes(fichier.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorise. Utilisez JPEG, PNG ou WEBP.'), false);
  }
};

const upload = multer({
  storage: stockage,
  fileFilter: filtreTypes,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
  },
});

module.exports = upload;
