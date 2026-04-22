// ============================================
// Firebase setup for STH Cartage
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, doc, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, orderBy, serverTimestamp, writeBatch, getDocs
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmUGL8Tyfy74OMjgaBZlFK-PTFG3AYYK0",
  authDomain: "sth-cartage.firebaseapp.com",
  projectId: "sth-cartage",
  storageBucket: "sth-cartage.firebasestorage.app",
  messagingSenderId: "613314698438",
  appId: "1:613314698438:web:6acb8a91215b5a8efe0bc7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Expose Firestore + helpers globally so app.js (non-module) can use them.
// This is a pragmatic pattern for keeping app.js simple — in a build-tooled
// project you'd import everything, but here we want zero build steps.
window.sthDB = {
  db, collection, doc, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, orderBy, serverTimestamp, writeBatch, getDocs,
  ready: true
};

// Dispatch ready event so app.js can wait for it
window.dispatchEvent(new CustomEvent('firebase-ready'));
console.log('[Firebase] initialized:', firebaseConfig.projectId);
