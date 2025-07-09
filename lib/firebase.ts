import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDJAZYBXGfLHkijux54mu8R2WBxi9mIMME",
  authDomain: "simplebank-a4510.firebaseapp.com",
  databaseURL: "https://simplebank-a4510-default-rtdb.firebaseio.com",
  projectId: "simplebank-a4510",
  storageBucket: "simplebank-a4510.firebasestorage.app",
  messagingSenderId: "207568763443",
  appId: "1:207568763443:web:5f57c17484df4b4fde0146",
  measurementId: "G-QJD0Z78R9F",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
