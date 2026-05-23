import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBfce9kXxSEz5A5iG_cJCN8uki7A1RMKlA",
  authDomain: "myeventzaragoza.firebaseapp.com",
  projectId: "myeventzaragoza",
  storageBucket: "myeventzaragoza.firebasestorage.app",
  messagingSenderId: "409439845988",
  appId: "1:409439845988:web:09ca1600bde35382b92971",
  measurementId: "G-3Z6JEEVBLX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
