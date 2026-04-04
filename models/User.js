const mongoose = require('mongoose');
 
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    address: {
      street: { type: String },
      city:   { type: String },
      zip:    { type: String },
    },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model('User', userSchema);
 