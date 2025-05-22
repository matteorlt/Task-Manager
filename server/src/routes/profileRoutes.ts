import express from 'express';
import { auth } from '../middleware/auth.middleware';
import { getProfile, updateProfile, updateProfilePicture, removeProfilePicture } from '../controllers/profileController';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Chemin d'upload pour server/server/uploads/profile-pictures
const uploadDir = path.join(__dirname, '../../uploads/profile-pictures');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté. Utilisez JPEG, PNG ou GIF.'));
    }
  }
});

router.get('/', auth, getProfile);
router.put('/', auth, updateProfile);
router.post('/picture', auth, upload.single('profilePicture'), updateProfilePicture);
router.delete('/picture', auth, removeProfilePicture);

export default router; 