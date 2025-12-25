import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCYvx1mVGqftSrTIYam-lF3PTtWKqrweZc",
  authDomain: "migrate-346c7.firebaseapp.com",
  projectId: "migrate-346c7",
  storageBucket: "migrate-346c7.firebasestorage.app",
  messagingSenderId: "754673176878",
  appId: "1:754673176878:web:09504ac908aeac8e586abf",
  measurementId: "G-BE0356ENJT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app;
