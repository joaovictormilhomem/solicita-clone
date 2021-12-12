import { initializeApp } from 'firebase/app';
import { getFirestore, collection,addDoc, Timestamp } from '@firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { getDatabase, query, ref, onValue, runTransaction, orderByChild, startAt, endAt, serverTimestamp, onDisconnect, set } from "firebase/database";
import { defineFirebaseConfig } from '../config/firebaseConfig';

let auth;
let uid;
let database;
let firestoreDb;

function detectPresence() {
  const uid = auth.currentUser.uid ? auth.currentUser.uid : 'unknow'
  const myConnectionRef = ref(database, `users/${uid}/connected`);
  const lastOnlineRef = ref(database, `users/${uid}/lastOnline`);
  const connectedRef = ref(database, '.info/connected');

  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      set(myConnectionRef, true);
      onDisconnect(myConnectionRef).remove();
      onDisconnect(lastOnlineRef).set(serverTimestamp());
    }
  });
}

export const startFirebase = (placeOp, setCurrentUser) => {
  const firebaseConfig = defineFirebaseConfig(placeOp);
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);
  firestoreDb = getFirestore(app);

  const unsubscribeOnAuthStateChanged = onAuthStateChanged(auth, (user) => {
    if (user) {
      uid = auth.currentUser.uid;
      setCurrentUser(user);
      detectPresence();
    }
    else
      setCurrentUser(false);
  })

  return unsubscribeOnAuthStateChanged;
}

export const onChangeRequests = (setRequests) => {
  const reference = query(ref(database, 'requests/'), orderByChild('status'), startAt(0), endAt(1));
  onValue(reference, (snapshot) => {
    const requests = snapshot.val();
    const parsedRequests = requests && Object.entries(requests).map(([key, value]) => {
      return {
        id: key,
        createTime: value.createTime,
        notes: value.notes,
        pon: value.pon,
        status: value.status,
        type: value.type,
        techNumber: value.techNumber,
        startTime: value.startTime ?? undefined,
        validator: value.validator ?? undefined
      }
    })

    setRequests(parsedRequests);
  });
}

export async function startRequest(key, techNumber) {
  const validator = auth.currentUser.email;
  const validatorId = auth.currentUser.uid;

  const requestReference = ref(database, `/requests/${key}`);
  await runTransaction(requestReference, (request) => {
    if (request) {
      request.status = 1;
      request.startTime = serverTimestamp();
      request.validator = validator;
      request.validatorId = validatorId;
    }

    return request;
  })

  const requestTechReference = ref(database, `/techs/${techNumber}`);
  await runTransaction(requestTechReference, (request) => {
    if (request) {
      request.status = 1;
      request.startTime = serverTimestamp();
      request.validator = validator;
      request.validatorId = validatorId;
    }

    return request;
  })
}

export async function finishRequest(request) {
  await createFirestoreRequest(request);
  await deleteRequest(request.id);

  await runTransaction(ref(database, `/techs/${request.techNumber}`), (requestUpdated) => {
    if (requestUpdated) {
      requestUpdated.status = 2;
      requestUpdated.endTime = serverTimestamp();
    }
    return requestUpdated;
  })
}

export async function denyRequest(request, reason) {
  await createFirestoreRequest(request, reason);
  await deleteRequest(request.id);

  const requestTechReference = ref(database, `/techs/${request.techNumber}`);
  await runTransaction(requestTechReference, (request) => {
    if (request) {
      request.status = 3;
      request.endTime = serverTimestamp();
      request.reason = reason;
    }

    return request;
  })
}

async function deleteRequest(key) {
  set(ref(database, 'requests/' + key), null);
}

export const login = (email, password, setCurrentUser) => {
  return new Promise((resolve) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setCurrentUser(userCredential.user);
        uid = auth.currentUser.uid;
        resolve(null);
      })
      .catch((error) => {
        resolve(error.code);
      });
  })
}

export const logout = (setCurrentUser) => {
  return new Promise((resolve) => {
    const myConnectionRef = ref(database, `users/${uid}/connected`);
    const lastOnlineRef = ref(database, `users/${uid}/lastOnline`);
    set(myConnectionRef, null);
    set(lastOnlineRef, serverTimestamp());

    signOut(auth).then(() => {
      setCurrentUser(null);
      resolve(null);
    }).catch((error) => {
      resolve(error);
    });
  })
}

export function changePassword(email) {
  return new Promise((resolve, reject) => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        reject(error.code);
      });
  })
}

async function createFirestoreRequest({ id, createTime, startTime, endTime, notes, pon, status, techNumber, type, validator }, reason) {
  const newReq = {
    createTime: Timestamp.fromMillis(createTime),
    startTime: Timestamp.fromMillis(startTime),
    endTime: Timestamp.now(),
    notes,
    pon,
    techNumber,
    type,
    validator
  }
  newReq.status = 'finished';
  if (reason) {
    newReq.status = 'denied';
    newReq.reason = reason;
  }
  await addDoc(collection(firestoreDb, "requestsCopy"), newReq);
}