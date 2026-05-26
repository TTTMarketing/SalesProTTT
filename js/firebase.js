import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDCs3y2HtUaTnkz5TXZTr4NRZ7ixxyjoyE",
  authDomain: "salespro-eff35.firebaseapp.com",
  projectId: "salespro-eff35",
  storageBucket: "salespro-eff35.firebasestorage.app",
  messagingSenderId: "653406700626",
  appId: "1:653406700626:web:36d0eeb4a8c57cc1ee4b8b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let recaptchaVerifier = null;
let confirmationResult = null;

function getRecaptcha(){
  if(!recaptchaVerifier){
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible'
    });
  }
  return recaptchaVerifier;
}

window.SP_FIREBASE = {
  auth, db,

  onAuthStateChanged: (cb) => onAuthStateChanged(auth, cb),

  async sendPhoneCode(phone){
    const verifier = getRecaptcha();
    confirmationResult = await signInWithPhoneNumber(auth, phone, verifier);
    return true;
  },

  async verifyPhoneCode(code){
    if(!confirmationResult) throw new Error('Сначала запросите код');
    const result = await confirmationResult.confirm(code);
    confirmationResult = null;
    return result.user;
  },

  async loginGoogle(){
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  },

  async loginEmail(email, password){
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  async signupEmail(email, password){
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  async logout(){
    await signOut(auth);
  },

  async getProfile(uid){
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  },

  async saveProfile(uid, profile){
    await setDoc(doc(db, 'users', uid), {
      ...profile,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
};

window.dispatchEvent(new Event('sp-firebase-ready'));
