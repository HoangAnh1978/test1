'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChatList } from '@/components/ChatList';
import { ChatRoomComponent } from '@/components/ChatRoom';
import { CreateRoomModal } from '@/components/CreateRoomModal';
import { ChatRoom, ChatMessage, User, CreateChatRoomRequest } from '@/types/chat';

// Mock data for demonstration
const mockCurrentUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
  created_at: new Date().toISOString(),
  is_online: true,
};

const mockRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'General Discussion',
    description: 'General chat for everyone',
    room_type: 'public',
    is_private: false,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T14:25:00Z',
    created_by: '1',
    participant_count: 5,
    participants: [],
    messages: [],
    last_message: {
      id: '1',
      room_id: '1',
      user_id: '2',
      content: 'Hey everyone! How is the project going?',
      message_type: 'text',
      created_at: '2024-01-15T14:25:00Z',
      user: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=32&h=32&fit=crop&crop=face',
        created_at: '2024-01-15T09:00:00Z',
      }
    }
  },
  {
    id: '2',
    name: 'Development Team',
    description: 'Private chat for developers',
    room_type: 'private',
    is_private: true,
    created_at: '2024-01-14T10:00:00Z',
    updated_at: '2024-01-15T12:30:00Z',
    created_by: '1',
    participant_count: 3,
    participants: [],
    messages: [],
    last_message: {
      id: '2',
      room_id: '2',
      user_id: '1',
      content: 'Let me check the latest changes in the codebase',
      message_type: 'text',
      created_at: '2024-01-15T12:30:00Z',
      user: mockCurrentUser
    }
  }
];

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    room_id: '1',
    user_id: '2',
    content: 'Hey everyone! How is the project going?',
    message_type: 'text',
    created_at: '2024-01-15T14:20:00Z',
    user: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=32&h=32&fit=crop&crop=face',
      created_at: '2024-01-15T09:00:00Z',
    }
  },
  {
    id: '2',
    room_id: '1',
    user_id: '1',
    content: 'Great! We\'re making good progress. The new chat feature is almost ready.',
    message_type: 'text',
    created_at: '2024-01-15T14:25:00Z',
    user: mockCurrentUser
  },
  {
    id: '3',
    room_id: '1',
    user_id: '3',
    content: 'Awesome! Can\'t wait to test it out. When will it be deployed?',
    message_type: 'text',
    created_at: '2024-01-15T14:27:00Z',
    user: {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=face',
      created_at: '2024-01-15T09:00:00Z',
    }
  }
];

export default function ChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>(mockRooms);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load messages when room is selected
  const loadMessages = useCallback((room: ChatRoom) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const roomMessages = mockMessages.filter(msg => msg.room_id === room.id);
      setMessages(roomMessages);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom);
    } else {
      setMessages([]);
    }
  }, [selectedRoom, loadMessages]);

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
  };

  const handleSendMessage = async (content: string, replyToId?: string) => {
    if (!selectedRoom) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      room_id: selectedRoom.id,
      user_id: mockCurrentUser.id,
      content,
      message_type: 'text',
      created_at: new Date().toISOString(),
      user: mockCurrentUser,
      reply_to_id: replyToId,
    };

    // Add reply reference if replying
    if (replyToId) {
      const replyTo = messages.find(msg => msg.id === replyToId);
      if (replyTo) {
        newMessage.reply_to = replyTo;
      }
    }

    setMessages(prev => [...prev, newMessage]);

    // Update room's last message
    setRooms(prev => prev.map(room => 
      room.id === selectedRoom.id 
        ? { ...room, last_message: newMessage, updated_at: newMessage.created_at }
        : room
    ));

    // TODO: Send message to Hasura API
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    const editedAt = new Date().toISOString();
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content, edited_at: editedAt }
        : msg
    ));

    // TODO: Update message via Hasura API
  };

  const handleDeleteMessage = async (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));

    // TODO: Delete message via Hasura API
  };

  const handleCreateRoom = async (roomData: CreateChatRoomRequest) => {
    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      ...roomData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      participant_count: 1,
      participants: [],
      messages: [],
    };

    setRooms(prev => [newRoom, ...prev]);

    // TODO: Create room via Hasura API
  };

  return (
    <div className="h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Chat Management</h1>
          <nav className="flex space-x-4">
            <a 
              href="/tickets" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Tickets
            </a>
            <a 
              href="/chat" 
              className="text-blue-600 hover:text-blue-700 px-3 py-2 text-sm font-medium border-b-2 border-blue-600"
            >
              Chat
            </a>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - Room List */}
        <div className="w-80 flex-shrink-0">
          <ChatList
            rooms={rooms}
            currentUser={mockCurrentUser}
            selectedRoom={selectedRoom}
            onRoomSelect={handleRoomSelect}
            onCreateRoom={() => setIsCreateModalOpen(true)}
            isLoading={false}
          />
        </div>

        {/* Main content - Chat Room */}
        <div className="flex-1">
          {selectedRoom ? (
            <ChatRoomComponent
              room={selectedRoom}
              messages={messages}
              currentUser={mockCurrentUser}
              onSendMessage={handleSendMessage}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              isLoading={isLoading}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-white">
              <div className="text-center">
                <div className="text-4xl mb-4">??</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a chat room to start messaging
                </h2>
                <p className="text-gray-600">
                  Choose a room from the sidebar or create a new one to begin the conversation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRoom={handleCreateRoom}
        currentUserId={mockCurrentUser.id}
      />
    </div>
  );
}