const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
 
// @desc    Crear una orden a partir del carrito
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
 
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Dirección de envío y método de pago son obligatorios' });
    }
 
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }
 
    // Verificar stock y construir items de la orden
    const orderItems = [];
    let totalPrice = 0;
 
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stock insuficiente para el producto: ${item.product.name}`,
        });
      }
 
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });
 
      totalPrice += product.price * item.quantity;
 
      // Descontar stock
      product.stock -= item.quantity;
      await product.save();
    }
 
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: 'pending',
    });
 
    // Vaciar carrito tras crear la orden
    cart.items = [];
    await cart.save();
 
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
 
// @desc    Obtener todas las órdenes del usuario autenticado
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name imageUrl')
      .sort({ createdAt: -1 });
 
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
 
// @desc    Obtener una orden por ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name imageUrl');
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
 
    // Solo el dueño o un admin puede ver la orden
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para ver esta orden' });
    }
 
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
 
// @desc    Obtener todas las órdenes (solo admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name imageUrl')
      .sort({ createdAt: -1 });
 
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
 
// @desc    Actualizar el estado de una orden (solo admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
 
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Estado inválido. Válidos: ${validStatuses.join(', ')}` });
    }
 
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
 
    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }
 
    const updated = await order.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
 
// @desc    Cancelar una orden (usuario o admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
 
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para cancelar esta orden' });
    }
 
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'No se puede cancelar una orden ya enviada o entregada' });
    }
 
    // Restaurar stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
 
    order.status = 'cancelled';
    await order.save();
 
    res.status(200).json({ message: 'Orden cancelada correctamente', order });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
 
module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};