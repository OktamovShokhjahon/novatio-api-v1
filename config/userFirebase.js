const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account-user.json");

console.log(admin.apps.length);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
