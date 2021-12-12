import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs, query, onSnapshot, doc, updateDoc, where/*, setDoc, orderBy, limit */ } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, connectAuthEmulator } from "firebase/auth";
import { firebaseConfigTest } from '../config/firebaseConfig';

let db;
let auth;

export const startFirebase = (setCurrentUser) => {
  const firebaseConfig = firebaseConfigTest;
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, "http://localhost:9099");
  const unsubscribeOnAuthStateChanged = onAuthStateChanged(auth, (user) => {
    if (user)
      setCurrentUser(user);
    else
      setCurrentUser(false);
  })

  return unsubscribeOnAuthStateChanged;
}

export const getCollection = () => async (collectionName) => {
  const col = collection(db, collectionName);
  const snapshot = await getDocs(col);
  return snapshot;
}

export function onChangeRequests(collectionName, setCollection) {
  let unsubscribeOnSnapshot = () => { };
  let q = query(collection(db, collectionName), where('status', '!=', 'finished'));
  unsubscribeOnSnapshot = onSnapshot(q, (doc) => {
    setCollection(doc);
  })

  return unsubscribeOnSnapshot;
}

export async function startRequest(collectionName, requestId) {
  const docReference = doc(db, collectionName, requestId);
  const validator = auth.currentUser.email;
  const startTime = new Date();

  await updateDoc(docReference, {
    status: 'started',
    validator,
    startTime
  });
}

export async function finishRequest(collectionName, requestId) {
  const docReference = doc(db, collectionName, requestId);
  const finishTime = new Date();

  await updateDoc(docReference, {
    status: 'finished',
    finishTime
  });
}

export const login = (email, password, setCurrentUser) => {
  return new Promise((resolve) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setCurrentUser(userCredential.user);
        resolve(true)
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  })
}

export const logout = (setCurrentUser) => {
  signOut(auth).then(() => {
    setCurrentUser(null);
  }).catch((error) => {
    console.log(error);
  });
}