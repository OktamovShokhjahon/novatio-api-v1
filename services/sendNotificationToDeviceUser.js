const admin = require("../config/userFirebase.js");

async function sendNotificationToUser(token, notification, data) {
  console.group("send notification to user device");
  console.log(token, notification, data);
  try {
    const message = {
      token: token,
      notification: {
        title: notification.title,
        body: notification.body,
        image: notification.image || undefined,
      },
      // data,
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "high_importance_channel",
        },
      },
      // iOS specific options
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error("Error sending message:", error);

    if (
      error.code === "messaging/invalid-registration-token" ||
      error.code === "messaging/registration-token-not-registered"
    ) {
      return { success: false, error: "Invalid token", shouldRemove: true };
    }

    return { success: false, error: error.message };
  }
}

module.exports = sendNotificationToUser;
