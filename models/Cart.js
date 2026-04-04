const mongoose = require('mongoose');
 
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'La cantidad mínima es 1'],
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'El precio no puede ser negativo'],
    },
  },
  { _id: false }
);
 
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Un carrito por usuario
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
 
// Virtual: total del carrito
cartSchema.virtual('total').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});
 
module.exports = mongoose.model('Cart', cartSchema);