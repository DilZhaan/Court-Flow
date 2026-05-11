import admin from "firebase-admin";

const buildServiceAccount = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    type: "service_account",
    project_id: projectId,
    private_key: privateKey,
    client_email: clientEmail,
  };
};

const initializeFirebase = () => {
  if (admin.apps.length) {
    return admin;
  }

  const serviceAccount = buildServiceAccount();

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return admin;
  }

  admin.initializeApp();
  return admin;
};

const firebaseAdmin = initializeFirebase();

export default firebaseAdmin;
