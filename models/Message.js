const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "senderModel" },
    senderModel: { type: String, enum: ["User", "Seller"], required: true },

    receiverId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "receiverModel" },
    receiverModel: { type: String, enum: ["User", "Seller"], required: true },

    message: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
