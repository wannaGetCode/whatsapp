import { AttachFile, Mic, MoreVert, Send, InsertEmoticon } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { serverTimestamp, setDoc, doc, addDoc, collection } from "firebase/firestore";
import { useRouter } from "next/router";
import { KeyboardEventHandler, MouseEventHandler, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import styled from "styled-components";

import { auth, db } from "../config/firebase";
import { useRecipient } from "../hooks/useRecipient";
import { Conversation, IMessage } from "../types";
import { generateQueryGetMessages } from "../utils/generateQueryGetMessages";
import { convertFirestoreTimestampToString, transformMessage } from "../utils/transformMessage";
import Message from "./Message";
import RecipientAvatar from "./RecipientAvatar";

interface ConversationScreenProps {
  conversation: Conversation;
  messages: IMessage[];
}

const StyledRecipientHeader = styled.div`
  position: sticky;
  background-color: white;
  z-index: 100;
  top: 0;
  display: flex;
  align-items: center;
  padding: 11px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;
`;

const StyledHeaderInfo = styled.div`
  flex-grow: 1;

  > h3 {
    margin-top: 0;
    margin-bottom: 3px;
  }

  > span {
    font-size: 14px;
    color: gray;
  }
`;

const StyledH3 = styled.h3`
  word-break: break-all;
`;

const StyledHeaderIcon = styled.div`
  display: flex;
`;

const StyledMessageContainer = styled.div`
  padding: 30px;
  background-color: #e5ded8;
  min-height: 90vh;
`;

const StyledInputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
`

const StyledInput = styled.input`
  flex-grow: 1;
  outline: none;
  border: none;
  border-radius: 10px;
  background-color: whitesmoke;
  padding: 15px;
  margin-left: 15px;
  margin-right: 15px;
`

const EndOfMessageForAutoScroll = styled.div`
  margin-bottom: 30px;
`

const ConversationScreen = ({
  conversation,
  messages,
}: ConversationScreenProps) => {
  const [newMessage, setNewMessage] = useState('')
  const [loggedInUser, _loading, _error] = useAuthState(auth)

  const conversationUsers = conversation.users;
  const { recipientEmail, recipient } = useRecipient(conversationUsers);

  const router = useRouter();
  const conversationId = router.query.id;

  const queryGetMessages = generateQueryGetMessages(conversationId as string)
  const [messagesSnapshop, messagesLoading, __error] = useCollection(queryGetMessages)
  console.log("CONVERSATION ID", conversationId);

  const showMessages = () => {
    // if front-end is loading messages behind the scenes
    // display messages retrived from Next SSR passed down from [id].tsx
    if (messagesLoading) {
      return messages.map(message => (
        <Message key={message.id} message={message} />
      ))
    }

    // after front-end has finised loading messages, so now we have messagesSnapshot
    if (messagesSnapshop) {
      return messagesSnapshop.docs.map(message => (
        <Message key={message.id} message={transformMessage(message)} />
      ))
    }

    return null
  };

  const addMessageToDbAndUpdateLastSeen = async () => {
    // update last seen in 'users'
    await setDoc(doc(db, 'users', loggedInUser?.email as string), {
      lastSeen: serverTimestamp()
    }, { merge: true })

    // add new message to 'messages' in collection
    await addDoc(collection(db, 'messages'), {
      conversation_id: conversationId,
      sent_at: serverTimestamp(),
      text: newMessage,
      user: loggedInUser?.email
    })

    // reset input field
    setNewMessage('')

    // scroll to bottm
    scrollToBottom()
  }

  const handleSendMessageOnEnter: KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!newMessage) return
      addMessageToDbAndUpdateLastSeen()
    }
  }

  const handleSendMessageOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    if (!newMessage) return
    addMessageToDbAndUpdateLastSeen()
  }

  const endOfMessageRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    endOfMessageRef.current?.scrollIntoView({ behavior: 'smooth'})
  }

  return (
    <>
      <StyledRecipientHeader>
        <RecipientAvatar
          recipient={recipient}
          recipientEmail={recipientEmail}
        />

        <StyledHeaderInfo>
          <StyledH3>{recipientEmail}</StyledH3>

          {recipient && (
            <span>
              Last active:
              {convertFirestoreTimestampToString(recipient.lastSeen)}
            </span>
          )}
        </StyledHeaderInfo>

        <StyledHeaderIcon>
          <IconButton>
            <AttachFile />
          </IconButton>
          <IconButton>
            <MoreVert />
          </IconButton>
        </StyledHeaderIcon>
      </StyledRecipientHeader>

      <StyledMessageContainer>
        {showMessages()}
        {/* Auto scroll to the end when a new message is sent */}
        <EndOfMessageForAutoScroll ref={endOfMessageRef} />
      </StyledMessageContainer>

      {/* Enter new message */}
      <StyledInputContainer>
        <InsertEmoticon />

        <StyledInput
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleSendMessageOnEnter}
        />

        <IconButton onClick={handleSendMessageOnClick} disabled={!newMessage}>
          <Send />
        </IconButton>
        <IconButton>
          <Mic />
        </IconButton>
      </StyledInputContainer>
    </>
  );
};

export default ConversationScreen;
