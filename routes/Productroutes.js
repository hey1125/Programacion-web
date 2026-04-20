const express = require('express');
const router  = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/Productcontroller');

const { protect, admin }              = require('../middleware/authMiddleware');
const { upload, uploadToCloudinary }  = require('../middleware/uploadMiddleware');

// Rutas públicas
router.get('/',    getProducts);
router.get('/:id', getProductById);

// Rutas privadas/admin
// upload.single('image')  → recibe el archivo en memoria
// uploadToCloudinary       → sube el buffer a Cloudinary y pone la URL en req.file.path
router.post('/',    protect, admin, upload.single('image'), uploadToCloudinary, createProduct);
router.put('/:id',  protect, admin, upload.single('image'), uploadToCloudinary, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;