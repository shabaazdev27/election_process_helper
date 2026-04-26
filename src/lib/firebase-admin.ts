import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export const getServerUserProgress = async (userId: string) => {
  const doc = await adminDb.collection('users').doc(userId).get();
  return doc.exists ? doc.data() : null;
};
