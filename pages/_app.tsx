import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { useAuthState } from 'react-firebase-hooks/auth'

import '../styles/globals.css'
import Login from './login'
import Loading from '../components/Loading'
import { auth, db } from '../config/firebase'
import { serverTimestamp, setDoc, doc } from 'firebase/firestore'

function MyApp({ Component, pageProps }: AppProps) {
	const [loggedInUser, loading, _error] = useAuthState(auth)

	useEffect(() => {
		const setUserInDb = async () => {
			try {
				await setDoc(
					doc(db, 'users', loggedInUser?.uid as string),
					{
						emial: loggedInUser?.email,
						lastSeen: serverTimestamp(),
						photoURL: loggedInUser?.photoURL,
					},
					{ merge: true }, // replace old data with new data
				)
			} catch (error) {
				console.log('setUserInDb => err', error)
			}
		}

		if (loggedInUser) {
			setUserInDb()
		}
	}, [loggedInUser])

	if (loading) return <Loading />

	if (!loggedInUser) return <Login />

	return <Component {...pageProps} />
}

export default MyApp
