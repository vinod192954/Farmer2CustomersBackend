const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Buyer who placed order
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Seller fulfilling the order
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // Ordered product
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["pending", "shipped", "delivered"], default: "pending" },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
