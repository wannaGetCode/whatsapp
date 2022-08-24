import { IMessage } from './../types/index';
import { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";

export const convertFirestoreTimestampToString = (timestamp: Timestamp) =>
	new Date(timestamp.toDate().getTime()).toLocaleString()

export const transformMessage = (message: QueryDocumentSnapshot<DocumentData>) => ({
  id: message.id,
  ...message.data(), // spread out conversation_id, text, sent_at, user
  sent_at: message.data().sent_at ? convertFirestoreTimestampToString((message.data().sent_at as Timestamp)) : null
} as IMessage)