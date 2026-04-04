const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
 
// Públicas
router.post('/register', registerUser);
router.post('/login', loginUser);
 
// Privadas (usuario autenticado)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
 
// Solo admin
router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);
 
module.exports = router;
 