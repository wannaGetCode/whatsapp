import { Conversation, IMessage } from "../types"

interface ConversationScreenProps {
  conversation: Conversation;
  messages: IMessage[];
}

const ConversationScreen = ({ conversation, messages }: ConversationScreenProps) => {
  return (
    <div>ConversationScreen</div>
  )
}
export default ConversationScreen