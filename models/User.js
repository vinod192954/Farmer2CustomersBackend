const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["buyer", "seller", "admin"], required: true },
    isApproved: { type: Boolean, default: function () { return this.role === "buyer"; } }, // Auto approve buyers
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
