const jwt = require('jsonwebtoken');
const User = require('../models/User');
 
// Verificar token JWT
const protect = async (req, res, next) => {
  try {
    let token;
 
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
 
    if (!token) {
      return res.status(401).json({ message: 'No autorizado, token requerido' });
    }
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
 
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
 
// Verificar rol de admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado: solo administradores' });
  }
};
 
module.exports = { protect, admin };
 