const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Seller = require("../models/Seller");
const JWT_SECRET = process.env.JWT_SECRET || "vinod";

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  console.log("Authorization Header:", token); // Log raw header

  if (!token) {
    console.log("No token found"); // Debugging log
    return res.status(401).json({ message: "Access Denied" });
  }

  const extractedToken = token.split(" ")[1]; // Extract token from "Bearer <token>"
  console.log("Extracted Token:", extractedToken); // Log extracted token

  try {
    console.log("JWT_SECRET:", JWT_SECRET); // Log secret key
    const verified = jwt.verify(extractedToken, JWT_SECRET);
    console.log("Verification Success:", verified);

    req.user = verified;
    next();
  } catch (error) {
    console.log("JWT Verification Error:", error.message); // Log error message
    res.status(400).json({ message: "Invalid Token" });
  }
};

const checkSellerRole = async (req, res, next) => {
  try {
    // Check if the user exists in the Seller model
    const seller = await Seller.findById(req.user.userId);
    console.log("Seller Data:", seller);

    if (!seller) {
      return res.status(403).json({ message: "Access forbidden: Sellers only" });
    }
    next();
  } catch (error) {
    console.error("Error checking seller role:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { verifyToken, checkSellerRole };
