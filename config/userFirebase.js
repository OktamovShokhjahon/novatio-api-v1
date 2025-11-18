const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account-user.json");

console.log(admin.apps);

// if (!admin.apps.length) {
admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  "user-device"
);
// }

module.exports = admin;
