const { Schema, model } = require("mongoose");

const MessageSchema = new Schema(
  {
    agentId: String,
    userId: String,
    message: String,
    sentBy: String,
    imageUrl: { type: String, default: null },
    firstname: String,
    lastname: String,
  },
  {
    timestamps: true,
  }
);

const Message = model("Message", MessageSchema);
module.exports = Message;
