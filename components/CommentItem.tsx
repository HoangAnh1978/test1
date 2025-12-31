'use client';

import { Comment } from '../types/ticket';

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="flex space-x-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {comment.author.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {comment.author.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );
}