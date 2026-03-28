import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../components/auth/AuthContext'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { chatApi, friendsApi } from '../services/api'
import styles from './chat.module.css'

interface Conversation {
  id: number
  type: 'direct' | 'group'
  name: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  avatar?: string
}

interface Message {
  id: number
  senderId: number
  senderName: string
  content: string
  messageType: string
  createdAt: string
  isRead: boolean
}

export default function ChatPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')

  useEffect(() => {
    if (user?.id) {
      fetchConversations()
    }
  }, [user?.id])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages()
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      
      // Fetch user's chat groups
      const groupsResponse = await chatApi.getUserGroups()
      const groups = groupsResponse.success && groupsResponse.data ? groupsResponse.data : []
      
      // Fetch friends for direct messages
      const friendsResponse = await friendsApi.getFriendsList()
      const friends = friendsResponse.success && friendsResponse.data ? friendsResponse.data.friends || [] : []
      
      // Create conversations list
      const convos: Conversation[] = []
      
      // Add groups
      groups.forEach((group: any) => {
        convos.push({
          id: group.id,
          type: 'group',
          name: group.name,
          lastMessage: group.lastMessage || 'No messages yet',
          lastMessageTime: group.lastMessageTime,
          unreadCount: group.unreadCount || 0,
          avatar: group.avatar
        })
      })
      
      // Add direct message conversations (from friends)
      friends.forEach((friend: any) => {
        convos.push({
          id: friend.id,
          type: 'direct',
          name: friend.displayName || friend.username,
          lastMessage: 'Start a conversation',
          lastMessageTime: undefined,
          unreadCount: 0,
          avatar: friend.avatarUrl
        })
      })
      
      setConversations(convos)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!selectedConversation) return
    
    try {
      setMessagesLoading(true)
      let response
      
      if (selectedConversation.type === 'group') {
        response = await chatApi.getGroupMessages(selectedConversation.id)
      } else {
        response = await chatApi.getDirectMessages(selectedConversation.id)
      }
      
      if (response.success && response.data) {
        setMessages(response.data)
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    
    try {
      let response
      
      if (selectedConversation.type === 'group') {
        response = await chatApi.sendGroupMessage(selectedConversation.id, newMessage)
      } else {
        response = await chatApi.sendDirectMessage(selectedConversation.id, newMessage)
      }
      
      if (response.success) {
        setNewMessage('')
        fetchMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return
    
    try {
      const response = await chatApi.createGroup(groupName, groupDescription)
      if (response.success) {
        setShowCreateGroup(false)
        setGroupName('')
        setGroupDescription('')
        fetchConversations()
      }
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }

  const handleJoinGroup = async (groupId: number) => {
    try {
      const response = await chatApi.joinGroup(groupId)
      if (response.success) {
        fetchConversations()
      }
    } catch (error) {
      console.error('Error joining group:', error)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className={styles.chat}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading chat...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className={styles.chat}>
        <div className={styles.chatHeader}>
          <h1 className={styles.title}>Chat</h1>
          <button 
            className={styles.createGroupButton}
            onClick={() => setShowCreateGroup(true)}
          >
            Create Group
          </button>
        </div>

        <div className={styles.chatContent}>
          {/* Conversations List */}
          <div className={styles.conversationsList}>
            <h3>Conversations</h3>
            {loading ? (
              <div className={styles.loadingSpinner}></div>
            ) : conversations.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No conversations yet</p>
                <p>Start chatting with friends or join a group!</p>
              </div>
            ) : (
              conversations.map((convo) => (
                <div 
                  key={`${convo.type}-${convo.id}`}
                  className={`${styles.conversationItem} ${selectedConversation?.id === convo.id ? styles.selected : ''}`}
                  onClick={() => setSelectedConversation(convo)}
                >
                  <div className={styles.conversationAvatar}>
                    {convo.avatar ? (
                      <img src={convo.avatar} alt={convo.name} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {convo.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.conversationInfo}>
                    <h4>{convo.name}</h4>
                    <p className={styles.lastMessage}>{convo.lastMessage}</p>
                    {convo.lastMessageTime && (
                      <span className={styles.messageTime}>{convo.lastMessageTime}</span>
                    )}
                  </div>
                  {convo.unreadCount > 0 && (
                    <span className={styles.unreadBadge}>{convo.unreadCount}</span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div className={styles.chatArea}>
            {selectedConversation ? (
              <>
                <div className={styles.chatAreaHeader}>
                  <h3>{selectedConversation.name}</h3>
                  <span className={styles.conversationType}>
                    {selectedConversation.type === 'group' ? 'Group' : 'Direct Message'}
                  </span>
                </div>
                
                <div className={styles.messagesContainer}>
                  {messagesLoading ? (
                    <div className={styles.loadingSpinner}></div>
                  ) : messages.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No messages yet</p>
                      <p>Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div 
                        key={message.id}
                        className={`${styles.message} ${message.senderId === user.id ? styles.ownMessage : ''}`}
                      >
                        <div className={styles.messageHeader}>
                          <span className={styles.senderName}>{message.senderName}</span>
                          <span className={styles.messageTime}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className={styles.messageContent}>
                          {message.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className={styles.messageInput}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list to start chatting</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Create New Group</h3>
              <input
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <textarea
                placeholder="Group description (optional)"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
              />
              <div className={styles.modalActions}>
                <button onClick={() => setShowCreateGroup(false)}>Cancel</button>
                <button onClick={handleCreateGroup} disabled={!groupName.trim()}>
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}