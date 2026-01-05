'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChatRoomComponent } from '@/components/ChatRoom';
import { ChatRoom, ChatMessage, User } from '@/types/chat';

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
  }
];

const mockMessages: { [roomId: string]: ChatMessage[] } = {
  '1': [
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
      content: 'Great! We are making good progress. The new chat feature is almost ready.',
      message_type: 'text',
      created_at: '2024-01-15T14:25:00Z',
      user: mockCurrentUser
    }
  ],
  '2': [
    {
      id: '3',
      room_id: '2',
      user_id: '1',
      content: 'Let me check the latest changes in the codebase',
      message_type: 'text',
      created_at: '2024-01-15T12:30:00Z',
      user: mockCurrentUser
    }
  ]
};

interface ChatRoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function ChatRoomPage({ params }: ChatRoomPageProps) {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>('');
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setRoomId(resolvedParams.roomId);
    });
  }, [params]);

  const loadRoomData = useCallback((id: string) => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const foundRoom = mockRooms.find(r => r.id === id);
      
      if (!foundRoom) {
        setError('Chat room not found');
        setIsLoading(false);
        return;
      }

      setRoom(foundRoom);
      setMessages(mockMessages[id] || []);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (!roomId) return;
    loadRoomData(roomId);
  }, [roomId, loadRoomData]);

  const handleSendMessage = async (content: string, replyToId?: string) => {
    if (!room) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      room_id: room.id,
      user_id: mockCurrentUser.id,
      content,
      message_type: 'text',
      created_at: new Date().toISOString(),
      user: mockCurrentUser,
      reply_to_id: replyToId,
    };

    if (replyToId) {
      const replyTo = messages.find(msg => msg.id === replyToId);
      if (replyTo) {
        newMessage.reply_to = replyTo;
      }
    }

    setMessages(prev => [...prev, newMessage]);
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    const editedAt = new Date().toISOString();
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content, edited_at: editedAt }
        : msg
    ));
  };

  const handleDeleteMessage = async (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const handleBackToChat = () => {
    router.push('/chat');
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat room...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">??</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Chat room not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            The chat room you are looking for does not exist or you do not have access to it.
          </p>
          <button
            onClick={handleBackToChat}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100">
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToChat}
              className="text-gray-600 hover:text-gray-900 p-1 rounded"
              title="Back to chat list"
            >
              ? Back
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{room.name}</h1>
              {room.description && (
                <p className="text-sm text-gray-600">{room.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {room.participant_count} participants
            </span>
            <div className={`w-2 h-2 rounded-full ${
              room.room_type === 'private' ? 'bg-yellow-500' : 'bg-green-500'
            }`} title={room.room_type === 'private' ? 'Private room' : 'Public room'} />
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-64px)]">
        <ChatRoomComponent
          room={room}
          messages={messages}
          currentUser={mockCurrentUser}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          isLoading={false}
        />
      </div>
    </div>
  );
}