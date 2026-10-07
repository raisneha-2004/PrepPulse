import multer from 'multer';
import { AppError } from './errorHandler.js';

// Configure multer with memory storage (never write to disk)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdfMime || isPdfExt) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF files are allowed for resume parsing', 400, 'INVALID_FILE_TYPE'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
}).single('resume');

/**
 * Middleware wrapper to handle Multer upload errors gracefully
 */
export const uploadResumeMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('Resume file size exceeds the 5MB limit', 400, 'FILE_TOO_LARGE'));
        }
        return next(new AppError(`Upload error: ${err.message}`, 400, 'UPLOAD_ERROR'));
      }
      return next(err);
    }

    if (!req.file) {
      return next(new AppError('No resume file uploaded. Please upload a PDF file under the field name "resume".', 400, 'FILE_REQUIRED'));
    }

    next();
  });
};
