const admin = require("firebase-admin");

// Option A: load service account JSON directly (dev only)
const serviceAccount = require("./novatioelchi-firebase-adminsdk-fbsvc-7fae3b48ee.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

module.exports = messaging;
