import { useCollection } from 'react-firebase-hooks/firestore';
import { query, collection, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

import { getRecipientEmail } from './../utils/getRecipientEmail';
import { auth, db } from '../config/firebase';
import { AppUser, Conversation } from "../types";

export const useRecipient = (conversationUser: Conversation['users']) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth)

  // get recipient email
  const recipientEmail = getRecipientEmail(conversationUser, loggedInUser)

  // get recipient avatar
  const queryGetRecipient = query(collection(db, 'users'), where('email', '==', recipientEmail))
  const [recipientsSnapshot, __loading, __error] = useCollection(queryGetRecipient)

  // recipientsSnapshot?.docs could be an empty array
  // so we have to force "?" after docs[0] because there is no data() on "undefined"
  const recipient = recipientsSnapshot?.docs[0]?.data() as AppUser | undefined

  return {
    recipient,
    recipientEmail
  }
}
