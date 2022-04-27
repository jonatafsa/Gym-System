// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAQTfLH0ju8xj99rojp2GaY0A6MgCHjFLU",
    authDomain: "my-gym-system.firebaseapp.com",
    projectId: "my-gym-system",
    storageBucket: "my-gym-system.appspot.com",
    messagingSenderId: "849363309328",
    appId: "1:849363309328:web:744b43ec98ca9457c74b95",
    measurementId: "G-ZX8CVWS2BF"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

