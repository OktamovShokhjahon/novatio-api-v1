const { default: mongoose } = require("mongoose");

const AgentDevice = new mongoose.Schema({
  agentId: String,
  fcmTokens: [
    {
      token: String,
      device: String,
      addedAt: { type: Date, default: Date.now },
    },
  ],
});

const AgentDeviceModel = mongoose.model("AgentDevice", AgentDevice);
module.exports = AgentDeviceModel;
