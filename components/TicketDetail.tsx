'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ticket, Comment } from '../types/ticket';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

const statusColors = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
};

const typeIcons = {
  bug: '??',
  feature: '?',
  task: '??',
  improvement: '??'
};

interface TicketDetailProps {
  ticketId: string;
}

export default function TicketDetail({ ticketId }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTicket();
    fetchComments();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }
      const data = await response.json();
      setTicket(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [...prev, newComment]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
        <p className="text-red-700 dark:text-red-300">Error: {error || 'Ticket not found'}</p>
        <Link
          href="/tickets"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-2 inline-block"
        >
          ? Back to tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/tickets" className="hover:text-gray-700 dark:hover:text-gray-200">
          Tickets
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">#{ticket.id}</span>
      </div>

      {/* Ticket Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{typeIcons[ticket.type]}</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {ticket.title}
            </h1>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[ticket.status]}`}>
              {ticket.status.replace('-', ' ')}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[ticket.priority]}`}>
              {ticket.priority} priority
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Reporter
            </label>
            <div className="flex items-center gap-2">
              {ticket.reporter.avatar && (
                <img
                  src={ticket.reporter.avatar}
                  alt={ticket.reporter.name}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="text-gray-900 dark:text-white font-medium">
                {ticket.reporter.name}
              </span>
            </div>
          </div>

          {ticket.assignee && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Assignee
              </label>
              <div className="flex items-center gap-2">
                {ticket.assignee.avatar && (
                  <img
                    src={ticket.assignee.avatar}
                    alt={ticket.assignee.name}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-gray-900 dark:text-white font-medium">
                  {ticket.assignee.name}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Type
            </label>
            <div className="flex items-center gap-2">
              <span>{typeIcons[ticket.type]}</span>
              <span className="text-gray-900 dark:text-white font-medium capitalize">
                {ticket.type}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Description
          </label>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span>Created: {formatDate(ticket.createdAt)}</span>
          <span>Last updated: {formatDate(ticket.updatedAt)}</span>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Comments ({comments.length})
        </h2>

        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}

          {comments.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}

          <CommentForm ticketId={ticketId} onCommentAdded={handleCommentAdded} />
        </div>
      </div>
    </div>
  );
}