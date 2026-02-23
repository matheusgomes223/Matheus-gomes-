import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyARjBS1i7OHzsYA5m9Av1cYWXTyQNfLNFQ",
    authDomain: "epi-serra-sull.firebaseapp.com",
    projectId: "epi-serra-sull",
    storageBucket: "epi-serra-sull.firebasestorage.app",
    messagingSenderId: "49100006374",
    appId: "1:49100006374:web:24436329e209345499ac27"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    const q = query(collection(db, "products"), limit(3));
    const snap = await getDocs(q);
    snap.forEach(d => {
        console.log("ID:", d.id);
        console.log("DATA:", d.data());
    });
    process.exit(0);
}

check().catch(console.error);
