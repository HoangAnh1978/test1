'use client';

import React, { useState } from 'react';
import { ChatMessage, User } from '../types/chat';

interface ChatMessageProps {
  message: ChatMessage;
  currentUser: User;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  message,
  currentUser,
  onReply,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  const isOwnMessage = message.user.id === currentUser.id;
  const isEdited = !!message.edited_at;

  const handleEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {/* Reply indicator */}
        {message.reply_to && (
          <div className="mb-1 text-xs text-gray-500 border-l-2 border-gray-300 pl-2">
            <div className="font-medium">{message.reply_to.user.name}</div>
            <div className="truncate">{message.reply_to.content}</div>
          </div>
        )}

        <div
          className={`px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          {/* User avatar and name (for others' messages) */}
          {!isOwnMessage && (
            <div className="flex items-center mb-1">
              {message.user.avatar && (
                <img
                  src={message.user.avatar}
                  alt={message.user.name}
                  className="w-4 h-4 rounded-full mr-2"
                />
              )}
              <span className="text-xs font-medium text-gray-600">
                {message.user.name}
              </span>
            </div>
          )}

          {/* Message content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 text-sm border rounded text-gray-900"
                rows={2}
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          {/* Timestamp and edited indicator */}
          <div className={`text-xs mt-1 ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatTime(message.created_at)}
            {isEdited && (
              <span className="ml-1 italic">
                (edited {formatTime(message.edited_at!)})
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {showActions && (
          <div className={`flex space-x-1 mt-1 ${
            isOwnMessage ? 'justify-end' : 'justify-start'
          }`}>
            <button
              onClick={() => onReply?.(message)}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              title="Reply"
            >
              Reply
            </button>
            {isOwnMessage && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  title="Edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete?.(message.id)}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  title="Delete"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Own message avatar */}
      {isOwnMessage && currentUser.avatar && (
        <div className="order-3 ml-2">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full"
          />
        </div>
      )}
    </div>
  );
};