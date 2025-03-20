const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Seller = require("../models/Seller");
const Product = require("../models/Product");
const Order = require("../models/Orders");
const Message = require("../models/Message");
const {
  verifyToken,
  checkSellerRole,
} = require("../middleware/authMiddleware");

const JWT_SECRET = process.env.JWT_SECRET || "vinod"; // Default secret if not in env

// **Seller Registration**
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, businessName, businessAddress,phone } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new seller
    const newSeller = new Seller({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      businessName: businessName.trim(),
      businessAddress: businessAddress.trim(),
      phone: phone?.toString().trim() || "",
    });
    await newSeller.save();

    res.status(201).json({ message: "Seller registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **Seller Login**
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find seller
    const seller = await Seller.findOne({ email: email.trim() });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: seller._id, role: "seller" }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **Get Seller Profile**
router.get("/profile", verifyToken, checkSellerRole, async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.userId).select("-password");
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    res.json(seller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **Update Seller Profile**
router.put("/profile", verifyToken, checkSellerRole, async (req, res) => {
  try {
    const updates = { ...req.body };

    // If password update is requested, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedSeller = await Seller.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true }
    ).select("-password");
    if (!updatedSeller)
      return res.status(404).json({ message: "Seller not found" });

    res.json({
      message: "Profile updated successfully",
      seller: updatedSeller,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **Product Management** (Linked to seller)
router.post("/products", verifyToken, checkSellerRole, async (req, res) => {
  try {
    const { name, price, description, category, image, quantity } = req.body;
    const seller = await Seller.findById(req.user.userId);

    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const newProduct = new Product({
      name: name.trim(),
      price,
      description: description.trim(),
      category: category.trim(),
      image,
      quantity,
      sellerId: seller._id,
      sellerName: seller.businessName,
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **Get Seller's Orders**
router.get("/orders", verifyToken, checkSellerRole, async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.user.userId }).populate(
      "productId buyerId"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **Send Message to Buyer**
router.post("/messages", verifyToken, checkSellerRole, async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    const newMessage = new Message({
      senderId: req.user.userId,
      receiverId,
      message: message.trim(),
    });

    await newMessage.save();
    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
