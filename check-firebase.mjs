import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyARjBS1i7OHzsYA5m9Av1cYWXTyQNfLNFQ",
    authDomain: "epi-serra-sull.firebaseapp.com",
    projectId: "epi-serra-sull",
    storageBucket: "epi-serra-sull.firebasestorage.app",
    messagingSenderId: "49100006374",
    appId: "1:49100006374:web:24436329e209345499ac27",
    measurementId: "G-TV91YBKHT0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    const snapshot = await getDocs(collection(db, 'products'));
    console.log(`Found ${snapshot.docs.length} products`);
    if (snapshot.docs.length > 0) {
        console.log("Sample 1:", snapshot.docs[0].id, snapshot.docs[0].data());
        console.log("Sample 2:", snapshot.docs[1].id, snapshot.docs[1].data());
    }
}

check().catch(console.error);
