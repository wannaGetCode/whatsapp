// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyDMBek40Nun0j2Ou3JHbyjdUzT1MmA6dNQ',
	authDomain: 'whatsapp-fa38d.firebaseapp.com',
	projectId: 'whatsapp-fa38d',
	storageBucket: 'whatsapp-fa38d.appspot.com',
	messagingSenderId: '329074100127',
	appId: '1:329074100127:web:707840b4646e73a9cf9faa',
}

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

const db = getFirestore(app)

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export { db, auth, provider }
