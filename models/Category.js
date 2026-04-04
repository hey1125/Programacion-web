const mongoose = require('mongoose');
 
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la categoría es obligatorio'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model('Category', categorySchema);
 