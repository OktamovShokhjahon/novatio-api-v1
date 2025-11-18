const sendNotificationToUser = require("./sendNotificationToDeviceUser.js");

sendNotificationToUser(
  "fbv4EuV7T3WiEJJFRDSQqL:APA91bEil93hshpuzUbUAfpHOMo8oECU__OLOJg11QVASYI-7UYmGL9JvZOBeoZSgZ5dR_xbKRysaPbsqWmANTIlDxs2TIHi79U-iyemQucWm9hBBSs4AbY",
  { title: "Test Notification", body: "This is a test notification body." },
  {
    redirecting_page: "agents_page",
    agent_id: "6",
    agent_name: "Shokhjahon Oktamov",
  }
);

module.exports = sendNotificationToUser;
