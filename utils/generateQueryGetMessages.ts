import { collection, orderBy, query, where } from "firebase/firestore";
import { db } from "../config/firebase";

export const generateQueryGetMessages = (conversationId?: string) => (
  query(collection(db, 'messages'),
  where('conversation_id', '==', conversationId),
  orderBy('sent_at', 'asc'))
)