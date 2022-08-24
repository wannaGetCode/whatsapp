import { useState } from 'react'
import { signOut } from 'firebase/auth'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import styled from 'styled-components'
import ChatIcon from '@mui/icons-material/Chat'
import MoreVerticalIcon from '@mui/icons-material/MoreVert'
import LogoutIcon from '@mui/icons-material/Logout'
import SearchIcon from '@mui/icons-material/Search'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import TextField from '@mui/material/TextField'
import DialogActions from '@mui/material/DialogActions'
import EmailValidator from 'email-validator'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollection } from 'react-firebase-hooks/firestore'

import { auth, db } from '../config/firebase'
import { addDoc, collection, query, where } from 'firebase/firestore'
import { Conversation } from '../types'
import ConversationSelect from './ConversationSelect'

const StyledContainer = styled.div`
	height: 100vh;
	min-width: 300px;
	max-width: 350px;
	overflow-y: auto;
	border-right: 1px solid whitesmoke;

	
  /* Hide scrollbar for Chrome, Safari and Opera */
  ::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
`

const StyledHeader = styled.div`
	position: sticky;
	top: 0;
	display: flex;
	justify-content: space-between;
	alight-items: center;
	height: 80px;
	padding: 15px;
	border-bottom: 1px solid whitesmoke;
	background-color: white;
	z-index: 1;
`

const StyledSearch = styled.div`
	display: flex;
	align-items: center;
	padding: 15px;
	border-radius: 2px;
`

const StyledSearchInput = styled.input`
	outline: none;
	border: none;
	margin-left: 8px;
	flex: 1;
`

const StyledSidebarButton = styled(Button)`
	width: 100%;
	border-top: 1px solid whitesmoke;
	border-top: 1px solid whitesmoke;
`

const StyledUserAvatar = styled(Avatar)`
	cursor: pointer;
	:hover {
		opacity: 0.8;
	}
`

function Sidebar() {
	const [loggedInUser, _loading, _error] = useAuthState(auth)

	const [isOpenNewConversationDialog, setIsOpenNewConversationDialog] =
		useState(false)
	const [recipientEmail, setRecipientEmail] = useState('')

	const closeNewConversationDialog = () => {
		setIsOpenNewConversationDialog(false)
		setRecipientEmail('')
	}

	const openNewConversationDialog = () => {
		setIsOpenNewConversationDialog(true)
	}

	// check if conversation alrealy exists between the current logged in user and recipient
	const queryGetConversationForCurrentUser = query(
		collection(db, 'conversations'),
		where('users', 'array-contains', loggedInUser?.email),
	)
	const [conversationsSnapshot] = useCollection(
		queryGetConversationForCurrentUser,
	)

	const isConversationExisted = (recipientEmail: string) => {
		return conversationsSnapshot?.docs.find((conversation) =>
			(conversation.data() as Conversation).users.includes(recipientEmail),
		)
	}

	const createNewConversation = async () => {
		const isInvitingSelf = recipientEmail === loggedInUser?.email

		if (!recipientEmail) return

		if (
			EmailValidator.validate(recipientEmail) &&
			!isInvitingSelf &&
			!isConversationExisted(recipientEmail)
		) {
			// Add conversation user to db "conversations" collection
			// A conversation is between the currently

			await addDoc(collection(db, 'conversations'), {
				users: [loggedInUser?.email, recipientEmail],
			})
		}

		closeNewConversationDialog()
	}

	const onHandleLogout = async () => {
		try {
			await signOut(auth)
		} catch (error) {
			console.log('onHandleLogout => error', error)
		}
	}

	return (
		<StyledContainer>
			<StyledHeader>
				<Tooltip title={loggedInUser?.email as String} placement="right">
					<StyledUserAvatar src={loggedInUser?.photoURL || ''} />
				</Tooltip>

				<div>
					<IconButton>
						<ChatIcon />
					</IconButton>
					<IconButton>
						<MoreVerticalIcon />
					</IconButton>
					<IconButton onClick={onHandleLogout}>
						<LogoutIcon />
					</IconButton>
				</div>
			</StyledHeader>

			<StyledSearch>
				<SearchIcon />
				<StyledSearchInput placeholder="Search in conversations" />
			</StyledSearch>

			<StyledSidebarButton onClick={openNewConversationDialog}>
				Start a new conversation
			</StyledSidebarButton>

			{/* List of conversations */}
			{conversationsSnapshot?.docs.map(conversation => (
				<ConversationSelect 
					key={conversation.id}
					id={conversation.id}
					conversationUsers={(conversation.data() as Conversation).users}
				/>
			))}

			<Dialog
				open={isOpenNewConversationDialog}
				onClose={closeNewConversationDialog}
			>
				<DialogTitle>New Conversation</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Please enter a Google email address for the user you wish to chat
						with
					</DialogContentText>
					<TextField
						autoFocus
						label="Email Address"
						type="email"
						fullWidth
						variant="standard"
						value={recipientEmail}
						onChange={(e) => setRecipientEmail(e.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeNewConversationDialog}>Cancel</Button>
					<Button disabled={!recipientEmail} onClick={createNewConversation}>
						Create
					</Button>
				</DialogActions>
			</Dialog>
			{/* List of conversations */}
		</StyledContainer>
	)
}
export default Sidebar
