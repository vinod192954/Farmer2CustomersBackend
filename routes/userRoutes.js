const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "vinod";

// User Registration (Buyer or Seller)
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If the role is seller, they need admin approval
    const isApproved = role === "seller" ? false : true;

    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isApproved,
    });
    await user.save();

    res.status(201).json({
      message: "User registered successfully, waiting for approval if seller",
    });
  } catch (err) {
    console.error("Error in /register:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Check if seller is approved before allowing login
    if (user.role === "seller" && !user.isApproved) {
      return res.status(403).json({
        message: "Seller not approved yet. Please wait for admin approval.",
      });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });
    //console.log("secrete token", JWT_SECRET);
    res.json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    console.error("JWT Verification Error:", err); // Logs the full error details
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
