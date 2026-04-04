const Cart = require('../models/Cart');
const Product = require('../models/Product');
 
// @desc    Obtener el carrito del usuario autenticado
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price imageUrl stock');
 
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
 
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
 
// @desc    Agregar producto al carrito
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
 
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Producto y cantidad válida son obligatorios' });
    }
 
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
 
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Stock insuficiente. Disponible: ${product.stock}` });
    }
 
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
 
    const existingItem = cart.items.find(item => item.product.toString() === productId);
 
    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({ message: `Stock insuficiente. Disponible: ${product.stock}` });
      }
      existingItem.quantity = newQty;
      existingItem.price = product.price;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }
 
    await cart.save();
    await cart.populate('items.product', 'name price imageUrl stock');
 
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
 
// @desc    Actualizar cantidad de un producto en el carrito
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
 
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'La cantidad debe ser al menos 1' });
    }
 
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
 
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Stock insuficiente. Disponible: ${product.stock}` });
    }
 
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
 
    const item = cart.items.find(i => i.product.toString() === req.params.productId);
    if (!item) {
      return res.status(404).json({ message: 'Producto no está en el carrito' });
    }
 
    item.quantity = quantity;
    item.price = product.price;
 
    await cart.save();
    await cart.populate('items.product', 'name price imageUrl stock');
 
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
 
// @desc    Eliminar un producto del carrito
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
 
    const before = cart.items.length;
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
 
    if (cart.items.length === before) {
      return res.status(404).json({ message: 'Producto no está en el carrito' });
    }
 
    await cart.save();
    await cart.populate('items.product', 'name price imageUrl stock');
 
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
 
// @desc    Vaciar el carrito
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
 
    cart.items = [];
    await cart.save();
 
    res.status(200).json({ message: 'Carrito vaciado correctamente', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
 
module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};