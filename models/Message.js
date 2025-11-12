const { Schema, model } = require("mongoose");

const MessageSchema = new Schema(
  {
    agentId: String,
    userId: String,
    message: String,
    sentBy: String,
    imageUrl: { type: String, default: null },
    firstName: String,
    lastName: String,
    isRead: { type: Boolean, default: false }, // New field
  },
  {
    timestamps: true,
  }
);

const Message = model("Message", MessageSchema);
module.exports = Message;
