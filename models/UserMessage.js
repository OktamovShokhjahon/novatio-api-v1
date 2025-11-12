const { Schema, model } = require("mongoose");

const UserMessageSchema = new Schema(
  {
    fromId: String,
    firstName: String,
    lastName: String,
    message: String,
    toAgent: String,
    imageUrl: { type: String, default: null },
    isRead: { type: Boolean, default: false }, // New field
  },
  {
    timestamps: true,
  }
);

const UserMessageModel = model("UserMessageModel", UserMessageSchema);
module.exports = UserMessageModel;
