import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.firebaseConfig = {
apiKey: "AIzaSyMMNNNo3naog7jaGNqtvbtsBq5b0U8FVU",
authDomain: "pulse-litfinder.firebaseapp.com",
projectId: "pulse-litfinder",
storageBucket: "pulse-litfinder.appspot.com",
messagingSenderId: "9560830674762",
appId: "1:9560830674762:web:d6aa98ae07ccf1609183b3",
measurementId: "G-9G96JZG67B"
};

export const app = initializeApp(window.firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
