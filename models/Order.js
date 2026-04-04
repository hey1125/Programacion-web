const mongoose = require('mongoose');
 
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true, // Se guarda el nombre al momento de la compra
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'La cantidad mínima es 1'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'El precio no puede ser negativo'],
    },
  },
  { _id: false }
);
 
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      zip:     { type: String, required: true },
      country: { type: String, default: 'Costa Rica' },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['credit_card', 'debit_card', 'paypal', 'cash'],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'El total no puede ser negativo'],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model('Order', orderSchema);