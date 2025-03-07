const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Order = require("../models/Orders");
const Message = require("../models/Message");
const {
  verifyToken,
  checkSellerRole,
} = require("../middleware/authMiddleware"); // Middleware for authentication

// **Product Management**
// Add a product
router.post("/products", verifyToken, checkSellerRole, async (req, res) => {
  try {
    const { name, price, description, category, image,quantity } = req.body;
    const newProduct = new Product({
      name,
      price,
      description,
      category,
      image,
      quantity,
      sellerId: req.user.userId, // Getting seller's ID from token
    });
    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product details
router.put("/products/:id", verifyToken, checkSellerRole, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      sellerId: req.user.id,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });

    Object.assign(product, req.body); // Update fields
    await product.save();
    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a product
router.delete(
  "/products/:id",
  verifyToken,
  checkSellerRole,
  async (req, res) => {
    try {
      const product = await Product.findOneAndDelete({
        _id: req.params.id,
        sellerId: req.user.id,
      });
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// **Order Management**
// Get seller's orders
router.get("/orders", verifyToken, checkSellerRole, async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.user.id }).populate(
      "productId buyerId"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.put(
  "/orders/:id/status",
  verifyToken,
  checkSellerRole,
  async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findOne({
        _id: req.params.id,
        sellerId: req.user.id,
      });
      if (!order) return res.status(404).json({ message: "Order not found" });

      order.status = status;
      await order.save();
      res.json({ message: "Order status updated", order });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// **Communication**
// Send a message to a buyer
router.post("/messages", verifyToken, checkSellerRole, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const newMessage = new Message({
      senderId: req.user.id,
      receiverId,
      message,
    });
    await newMessage.save();
    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all messages sent/received by the seller
router.get("/messages", verifyToken, checkSellerRole, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }],
    }).populate("senderId receiverId", "name email");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




module.exports = router;
