// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Agregamos autenticación
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, getDocs } from "firebase/firestore"; // Importar getDocs

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCs7dByNG3DT4tYEkHajwdYV1kCdaizmaY",
  authDomain: "parcial1-1d7e9.firebaseapp.com",
  projectId: "parcial1-1d7e9",
  storageBucket: "parcial1-1d7e9.appspot.com",
  messagingSenderId: "465176187424",
  appId: "1:465176187424:web:1b6f79c391a5c06b11e245",
  measurementId: "G-F69FJTPCQX",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Inicializamos la autenticación
const db = getFirestore(app); // Base de datos Firestore

// Exportar las funciones de Firestore para su uso en otros componentes
export { auth, db, doc, setDoc, getDoc, onSnapshot, collection, getDocs }; // Asegúrate de exportar 'getDocs' también
