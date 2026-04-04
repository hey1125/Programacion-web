const mongoose = require('mongoose');
 
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'El stock no puede ser negativo'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La categoría es obligatoria'],
    },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model('Product', productSchema);
 