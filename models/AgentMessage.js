const { Schema, model } = require("mongoose");

const AgentMessageSchema = new Schema(
  {
    fromId: String,
    firstName: String,
    lastName: String,
    message: String,
    toUser: String,
    imageUrl: { type: String, default: null },
    isRead: { type: Boolean, default: false }, // New field
  },
  {
    timestamps: true,
  }
);

const AgentMessage = model("AgentMessage", AgentMessageSchema);
module.exports = AgentMessage;
