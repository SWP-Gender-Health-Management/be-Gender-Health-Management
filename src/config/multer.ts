import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {fileURLToPath} from 'url'; 
import { ensureDir } from 'fs-extra';

// Lấy __dirname trong ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn thư mục lưu trữ
const avatarDir = path.join(__dirname, '../../uploads/avatars');
const blogImageDir = path.join(__dirname, '../../uploads/blog_images');


ensureDir(avatarDir);
ensureDir(blogImageDir);

console.log(avatarDir);
// Cấu hình lưu trữ cho avatar
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.body.account_id}_${uuidv4()}${ext}`);
  },
});

// Cấu hình lưu trữ cho ảnh blog
const blogImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, blogImageDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const blogId = req.body.blog_id || req.params.blog_id || 'temp'; // Dùng 'temp' nếu chưa có blog_id
    cb(null, `blog_${blogId}_${uuidv4()}${ext}`);
  },
});

// Middleware Multer cho avatar (chỉ cho phép 1 file)
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn 2MB
});

// Middleware Multer cho ảnh blog (cho phép nhiều file)
const uploadBlogImages = multer({
  storage: blogImageStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

export { uploadAvatar, uploadBlogImages };