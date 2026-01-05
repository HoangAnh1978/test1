'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatRoom, ChatMessage, User } from '@/types/chat';
import { ChatMessageComponent } from './ChatMessage';

interface ChatRoomProps {
  room: ChatRoom;
  messages: ChatMessage[];
  currentUser: User;
  onSendMessage: (content: string, replyToId?: string) => void;
  onEditMessage: (messageId: string, content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  isLoading?: boolean;
}

export const ChatRoomComponent: React.FC<ChatRoomProps> = ({
  room,
  messages,
  currentUser,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  isLoading = false,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  const handleSendMessage = () => {
    const content = newMessage.trim();
    if (!content) return;
    onSendMessage(content, replyTo?.id);
    setNewMessage('');
    setReplyTo(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReply = (message: ChatMessage) => {
    setReplyTo(message);
  };

  const handleDelete = (messageId: string) => {
    if (window.confirm('Delete this message?')) {
      onDeleteMessage(messageId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{room.name}</h2>
          {room.description && (
            <p className="text-sm text-gray-600">{room.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {room.participants?.length || 0} participants
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessageComponent
              key={message.id}
              message={message}
              currentUser={currentUser}
              onReply={handleReply}
              onEdit={onEditMessage}
              onDelete={handleDelete}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {replyTo && (
        <div className="px-4 py-2 bg-gray-100 border-t">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs text-gray-600">
                Replying to <span className="font-medium">{replyTo.user.name}</span>
              </div>
              <div className="text-sm text-gray-700 truncate mt-1">
                {replyTo.content}
              </div>
            </div>
            <button onClick={() => setReplyTo(null)} className="ml-2 text-gray-500 hover:text-gray-700">X</button>
          </div>
        </div>
      )}

      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};