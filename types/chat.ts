export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  created_at: string;
  last_seen?: string;
  is_online?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  room_type: 'public' | 'private' | 'direct' | 'group';
  is_private: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  participant_count?: number;
  participants?: ChatRoomParticipant[];
  messages?: ChatMessage[];
  last_message?: ChatMessage;
}

export interface ChatRoomParticipant {
  room_id: string;
  user_id: string;
  joined_at: string;
  role: 'admin' | 'moderator' | 'member';
  user: User;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system' | 'notification';
  created_at: string;
  updated_at?: string;
  edited_at?: string;
  reply_to_id?: string;
  user: User;
  reply_to?: ChatMessage;
}

// Request/Response types
export interface CreateChatRoomRequest {
  name: string;
  description?: string;
  room_type: ChatRoom['room_type'];
  is_private: boolean;
  created_by: string;
}

export interface SendMessageRequest {
  room_id: string;
  content: string;
  message_type?: ChatMessage['message_type'];
  reply_to_id?: string;
}

export interface UpdateMessageRequest {
  content: string;
}

export interface JoinRoomRequest {
  room_id: string;
  user_id: string;
  role?: ChatRoomParticipant['role'];
}

// GraphQL input types (for Hasura)
export interface ChatRoomInsertInput {
  name: string;
  description?: string;
  room_type: string;
  is_private: boolean;
  created_by: string;
}

export interface ChatMessageInsertInput {
  room_id: string;
  user_id: string;
  content: string;
  message_type: string;
  reply_to_id?: string;
}

export interface ChatRoomParticipantInsertInput {
  room_id: string;
  user_id: string;
  role: string;
}

export interface UserInsertInput {
  name: string;
  email: string;
  avatar?: string;
}

export interface UserSetInput {
  name?: string;
  email?: string;
  avatar?: string;
  last_seen?: string;
  is_online?: boolean;
}

// UI Component Props
export interface ChatMessageProps {
  message: ChatMessage;
  isOwn: boolean;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onDelete?: (messageId: string) => void;
}

export interface ChatRoomProps {
  room: ChatRoom;
  currentUserId: string;
}

export interface ChatListProps {
  rooms: ChatRoom[];
  currentUserId: string;
  onRoomSelect: (room: ChatRoom) => void;
}

// Chat context types
export interface ChatContextType {
  currentUser: User | null;
  currentRoom: ChatRoom | null;
  rooms: ChatRoom[];
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  setCurrentRoom: (room: ChatRoom | null) => void;
  sendMessage: (content: string, replyToId?: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  createRoom: (roomData: CreateChatRoomRequest) => Promise<ChatRoom>;
}

// Event types for real-time updates
export interface NewMessageEvent {
  type: 'NEW_MESSAGE';
  data: ChatMessage;
}

export interface MessageUpdatedEvent {
  type: 'MESSAGE_UPDATED';
  data: ChatMessage;
}

export interface MessageDeletedEvent {
  type: 'MESSAGE_DELETED';
  data: { messageId: string; roomId: string };
}

export interface UserJoinedEvent {
  type: 'USER_JOINED';
  data: { user: User; roomId: string };
}

export interface UserLeftEvent {
  type: 'USER_LEFT';
  data: { userId: string; roomId: string };
}

export type ChatEvent = 
  | NewMessageEvent 
  | MessageUpdatedEvent 
  | MessageDeletedEvent 
  | UserJoinedEvent 
  | UserLeftEvent;