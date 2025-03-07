const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const Product = require("../models/Product");
const Order = require("../models/Orders");

const router = express.Router();

// Get all products (Buyers can browse)
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get product by ID
router.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Place an order
router.post("/order", verifyToken, async (req, res) => {
  try {
    const { productId, quantity, sellerId } = req.body;
    const buyerId = req.user.userId; // Get buyer's ID from token

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const totalAmount = product.price * quantity;

    const order = new Order({
      buyerId,
      sellerId,
      productId,
      quantity,
      totalAmount,
      status: "Pending", // Default status
    });

    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get buyer's order history
router.get("/orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.userId }).populate(
      "productId"
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
