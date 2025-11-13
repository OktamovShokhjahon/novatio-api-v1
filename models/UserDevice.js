const { default: mongoose } = require("mongoose");

const UserDevice = new mongoose.Schema({
  userId: String,
  fcmTokens: [
    {
      token: String,
      device: String,
      addedAt: { type: Date, default: Date.now },
    },
  ],
});

const UserDeviceModel = mongoose.model("UserDevice", UserDevice);
module.exports = UserDeviceModel;
