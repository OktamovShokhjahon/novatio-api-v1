const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account-user.json");

const appName = "user-device";

if (!admin.apps.find((app) => app.name === appName)) {
  admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount),
    },
    appName
  );
}

module.exports = admin;
