const Product = require('../models/Product');

const getProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

const createProduct = async (req, res) => {
  const { name, sku, description, specs } = req.body;
  if (!name || !sku) return res.status(400).json({ message: 'Name and SKU are required' });

  const existing = await Product.findOne({ sku });
  if (existing) return res.status(400).json({ message: 'SKU already exists' });

  const product = await Product.create({ name, sku, description: description || '', specs: specs || '' });
  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const { name, description, specs } = req.body;
  Object.assign(product, { name, description, specs });
  await product.save();
  res.json(product);
};

const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await product.deleteOne();
  res.json({ message: 'Product removed' });
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
