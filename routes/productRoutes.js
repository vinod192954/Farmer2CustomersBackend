const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { name, price, description, category, image } = req.body;

    // Validation
    if (!name || !price || !category || !image) {
      return res
        .status(400)
        .json({ message: "Name, price, category, and image are required." });
    }

    const newProduct = new Product({
      name,
      price,
      description,
      category,
      image, // Store the image URL
    });

    // Save to database
    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product added successfully!", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

router.get("/all-products", async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

module.exports = router;
