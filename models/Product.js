const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true }, // Change to Seller model
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
