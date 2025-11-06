const { Schema, model } = require("mongoose");

const MessageSchema = new Schema(
  {
    agentId: String,
    userId: String,
    message: String,
    sentBy: String,
    imageUrl: { type: String, default: null }, // New field
  },
  {
    timestamps: true,
  }
);

const Message = model("Message", MessageSchema);
module.exports = Message;
