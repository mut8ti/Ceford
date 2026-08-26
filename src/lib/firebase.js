/* Firestore access.
 *
 * The Firebase web config is NOT a secret — it ships in every client bundle by
 * design. Access control lives in firestore.rules, which allow create-only with
 * a strict field allowlist. Treat that file as the security boundary, not this
 * one. To move these to env vars, swap the literals for
 * import.meta.env.PUBLIC_FIREBASE_* and add them to .env.
 *
 * The SDK is ~90KB gz, so it is imported dynamically on first submit rather
 * than shipped with the page.
 */
const config = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || 'AIzaSyB__VrarOe_CFfI7hKL5jFsEni1Lh3Lnqs',
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || 'cefored-institute',
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || '1:460320160628:web:614f9decdecbdfb50a4a21',
};

let ready;

function connect() {
  ready ??= (async () => {
    const [{ initializeApp }, firestore] = await Promise.all([
      import('firebase/app'),
      import('firebase/firestore'),
    ]);
    return { db: firestore.getFirestore(initializeApp(config)), firestore };
  })();
  return ready;
}

/** Write one document. Keys must match the allowlist in firestore.rules. */
export async function addDocument(collectionName, data) {
  const { db, firestore } = await connect();
  const { collection, addDoc, serverTimestamp } = firestore;
  return addDoc(collection(db, collectionName), {
    ...data,
    timestamp: serverTimestamp(),
  });
}
