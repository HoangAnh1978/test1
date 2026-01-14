'use client';

import React, { useState, useMemo } from 'react';
import { ChatRoom, User } from '../types/chat';

interface ChatListProps {
  rooms: ChatRoom[];
  currentUser: User;
  selectedRoom?: ChatRoom | null;
  onRoomSelect: (room: ChatRoom) => void;
  onCreateRoom?: () => void;
  isLoading?: boolean;
}

export const ChatList: React.FC<ChatListProps> = ({
  rooms,
  currentUser,
  selectedRoom,
  onRoomSelect,
  onCreateRoom,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate stable unread status based on room IDs
  const unreadStatus = useMemo(() => {
    const status: Record<string, boolean> = {};
    rooms.forEach((room, index) => {
      // Use room id hash to create stable "random" unread status
      const hash = room.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      status[room.id] = hash % 10 > 6; // roughly 30% chance
    });
    return status;
  }, [rooms]);

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getRoomTypeIcon = (roomType: string, isPrivate: boolean) => {
    if (roomType === 'direct') return '??';
    if (isPrivate) return '??';
    return '??';
  };

  const truncateMessage = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gray-900">Chat Rooms</h1>
          {onCreateRoom && (
            <button
              onClick={onCreateRoom}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Create new room"
            >
              + New
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <div className="absolute left-2.5 top-2.5 text-gray-400">
            ??
          </div>
        </div>
      </div>

      {/* Rooms list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No rooms found' : 'No chat rooms available'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onRoomSelect(room)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedRoom?.id === room.id
                    ? 'bg-blue-100 border-blue-200'
                    : 'bg-white hover:bg-gray-100'
                } border`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Room name and type */}
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm">
                        {getRoomTypeIcon(room.room_type, room.is_private)}
                      </span>
                      <h3 className="font-medium text-gray-900 truncate">
                        {room.name}
                      </h3>
                      {room.participant_count && (
                        <span className="text-xs text-gray-500">
                          ({room.participant_count})
                        </span>
                      )}
                    </div>

                    {/* Last message preview */}
                    {room.last_message && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">
                          {room.last_message.user.name}:
                        </span>{' '}
                        <span className="text-gray-500">
                          {truncateMessage(room.last_message.content)}
                        </span>
                      </div>
                    )}

                    {/* Room description (if no last message) */}
                    {!room.last_message && room.description && (
                      <div className="text-sm text-gray-500">
                        {truncateMessage(room.description)}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-gray-400 ml-2 flex-shrink-0">
                    {room.last_message
                      ? formatLastMessageTime(room.last_message.created_at)
                      : formatLastMessageTime(room.created_at)
                    }
                  </div>
                </div>

                {/* Room status indicators */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex space-x-1">
                    {room.room_type === 'private' && (
                      <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Private
                      </span>
                    )}
                    {room.room_type === 'direct' && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                        Direct
                      </span>
                    )}
                  </div>

                  {/* Unread indicator */}
                  {unreadStatus[room.id] && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current user info */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-center space-x-2">
          {currentUser.avatar && (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900 truncate">
              {currentUser.name}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {currentUser.email}
            </div>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
        </div>
      </div>
    </div>
  );
};