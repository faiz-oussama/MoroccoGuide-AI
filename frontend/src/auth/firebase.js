import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCCelHGmq01jnO25UzkBrB0OapXf9j1lx0",
  authDomain: "reactjs-d232a.firebaseapp.com",
  projectId: "reactjs-d232a",
  storageBucket: "reactjs-d232a.firebasestorage.app",
  messagingSenderId: "1036181403075",
  appId: "1:1036181403075:web:0a070b6cb43146a998f976",
  measurementId: "G-V43GTGHZHW"
};

export const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default auth;