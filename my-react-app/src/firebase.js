// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBAum8xonT5CR-ZrrVOmGT-OLANxdOsKgs",
  authDomain: "my-web1-74985.firebaseapp.com",
  projectId: "my-web1-74985",
  storageBucket: "my-web1-74985.appspot.com",
  messagingSenderId: "34933550550",
  appId: "1:34933550550:web:3811d84096f0f8b4654877",
  measurementId: "G-6Q6GLZ3R8G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Firebase Storage 초기화

export { db, auth, storage };