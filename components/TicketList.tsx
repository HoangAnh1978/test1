'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ticket } from '../types/ticket';

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

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
        <p className="text-red-700 dark:text-red-300">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/tickets/${ticket.id}`}
            className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200 hover:border-gray-300 dark:hover:border-gray-600"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{typeIcons[ticket.type]}</span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                  {ticket.title}
                </h2>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                  {ticket.status.replace('-', ' ')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {ticket.description}
            </p>

            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span>Reporter:</span>
                  <div className="flex items-center gap-1">
                    {ticket.reporter.avatar && (
                      <img
                        src={ticket.reporter.avatar}
                        alt={ticket.reporter.name}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <span className="font-medium">{ticket.reporter.name}</span>
                  </div>
                </div>
                {ticket.assignee && (
                  <div className="flex items-center gap-2">
                    <span>Assignee:</span>
                    <div className="flex items-center gap-1">
                      {ticket.assignee.avatar && (
                        <img
                          src={ticket.assignee.avatar}
                          alt={ticket.assignee.name}
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <span className="font-medium">{ticket.assignee.name}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span>??</span>
                  <span>{ticket.comments.length}</span>
                </div>
              </div>
              <div>
                Created: {formatDate(ticket.createdAt)}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No tickets found.</p>
        </div>
      )}
    </div>
  );
}