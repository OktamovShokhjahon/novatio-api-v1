const messaging = require("./messaging.js");

async function sendToToken(token) {
  const message = {
    token,
    notification: {
      title: "Hello from server",
      body: "This is a test notification",
    },
    data: {
      myKey: "myValue",
    },
    android: {
      priority: "high",
      ttl: 3600 * 1000,
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
  };

  try {
    const response = await messaging.send(message);
    console.log("Successfully sent message:", response);
  } catch (err) {
    console.error("Error sending message:", err);
  }
}

sendToToken();
