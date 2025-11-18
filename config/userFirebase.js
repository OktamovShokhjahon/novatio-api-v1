const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account-user.json");

const appName = "messaging";

// if (!admin.apps.find((app) => app.name === appName)) {
admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  appName
);
// }

console.log(admin.apps.length);

module.exports = admin;
