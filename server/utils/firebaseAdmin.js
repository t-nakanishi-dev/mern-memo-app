// server/utils/firebaseAdmin.js
const admin = require("firebase-admin");

const serviceAccount = require("../firebaseServiceAccount.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`,
  });
}

const bucket = admin.storage().bucket();

module.exports = { bucket };
