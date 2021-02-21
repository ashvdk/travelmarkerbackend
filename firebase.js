var admin = require('firebase-admin');

var serviceAccount = require("./travelapp-e23ae-firebase-adminsdk-9qis1-7faf83a205.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin.auth();