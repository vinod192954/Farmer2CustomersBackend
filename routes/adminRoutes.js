const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Orders"); // Assuming you have an Order schema
const { verifyToken, checkAdminRole } = require("../middleware/authMiddleware");

// Approve a seller
router.put("/sellers/:id/approve", verifyToken, checkAdminRole, async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    if (seller.role !== "seller") {
      return res.status(400).json({ message: "Only sellers need approval" });
    }

    seller.isApproved = true;
    await seller.save();
    res.json({ message: "Seller approved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (buyers and sellers)
router.get("/users", verifyToken, checkAdminRole, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all sellers (approved & unapproved)
router.get("/sellers", verifyToken, checkAdminRole, async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" });
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user (buyer/seller)
router.delete("/users/:id", verifyToken, checkAdminRole, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products
router.get("/products", verifyToken, checkAdminRole, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a product
router.delete("/products/:id", verifyToken, checkAdminRole, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders
router.get("/orders", verifyToken, checkAdminRole, async (req, res) => {
  try {
    const orders = await Order.find().populate("buyerId").populate("sellerId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an order
router.delete("/orders/:id", verifyToken, checkAdminRole, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
