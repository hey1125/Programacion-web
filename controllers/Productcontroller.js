const Product = require('../models/Product');

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;

    let filter = {};

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Product.find(filter).populate('category', 'name');

    if (sort === 'price_asc') query = query.sort({ price: 1 });
    else if (sort === 'price_desc') query = query.sort({ price: -1 });
    else query = query.sort({ createdAt: -1 });

    const products = await query;
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Crear un producto (con imagen subida a Cloudinary)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Nombre, precio y categoría son obligatorios' });
    }

    // Si se subió una imagen, req.file.path contiene la URL de Cloudinary
    const imageUrl = req.file ? req.file.path : '';

    const product = await Product.create({
      name,
      description,
      price,
      stock: stock || 0,
      category,
      imageUrl,
    });

    const populated = await product.populate('category', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Actualizar un producto (con imagen opcional)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const { name, description, price, stock, category } = req.body;

    product.name        = name        || product.name;
    product.description = description || product.description;
    product.price       = price       !== undefined ? price : product.price;
    product.stock       = stock       !== undefined ? stock : product.stock;
    product.category    = category    || product.category;

    // Solo reemplazar imagen si se subió una nueva
    if (req.file) {
      product.imageUrl = req.file.path;
    }

    const updated = await product.save();
    await updated.populate('category', 'name');

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    await product.deleteOne();
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};