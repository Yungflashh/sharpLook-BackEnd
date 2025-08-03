// src/utils/firebase.ts
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../config/firebaseServiceAccount.json')),
  });
}

export default admin;
