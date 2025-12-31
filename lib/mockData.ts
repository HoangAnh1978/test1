import { Ticket, User, Comment } from '../types/ticket';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=32&h=32&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
  }
];

export const mockComments: Comment[] = [
  {
    id: '1',
    content: 'I can reproduce this issue on my local environment. It seems to be related to the authentication module.',
    author: mockUsers[1],
    createdAt: '2024-01-15T10:30:00Z',
    ticketId: '1'
  },
  {
    id: '2',
    content: 'Thanks for the report. I\'ll investigate this issue and provide an update soon.',
    author: mockUsers[0],
    createdAt: '2024-01-15T11:15:00Z',
    ticketId: '1'
  },
  {
    id: '3',
    content: 'I\'ve identified the root cause. The problem is in the token validation logic. Working on a fix.',
    author: mockUsers[0],
    createdAt: '2024-01-15T14:20:00Z',
    updatedAt: '2024-01-15T14:25:00Z',
    ticketId: '1'
  },
  {
    id: '4',
    content: 'This would be a great addition to improve user experience. I suggest we implement this in the next sprint.',
    author: mockUsers[2],
    createdAt: '2024-01-16T09:00:00Z',
    ticketId: '2'
  },
  {
    id: '5',
    content: 'Agreed! I can start working on the wireframes and user flow this week.',
    author: mockUsers[3],
    createdAt: '2024-01-16T09:30:00Z',
    ticketId: '2'
  },
  {
    id: '6',
    content: 'The data has been successfully migrated. All tests are passing.',
    author: mockUsers[1],
    createdAt: '2024-01-14T16:45:00Z',
    ticketId: '3'
  },
  {
    id: '7',
    content: 'Great work! I\'ve verified the migration on the staging environment. Everything looks good.',
    author: mockUsers[0],
    createdAt: '2024-01-14T17:30:00Z',
    ticketId: '3'
  }
];

export const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Login page not working correctly',
    description: 'Users are unable to log in using their credentials. The form seems to accept the input but returns an error message saying "Invalid credentials" even with correct credentials.',
    status: 'in-progress',
    priority: 'high',
    type: 'bug',
    assignee: mockUsers[0],
    reporter: mockUsers[1],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T14:25:00Z',
    comments: mockComments.filter(comment => comment.ticketId === '1')
  },
  {
    id: '2',
    title: 'Add dark mode support',
    description: 'Implement dark mode functionality across the entire application. Users should be able to toggle between light and dark themes, and the preference should be saved.',
    status: 'open',
    priority: 'medium',
    type: 'feature',
    assignee: mockUsers[3],
    reporter: mockUsers[2],
    createdAt: '2024-01-16T08:30:00Z',
    updatedAt: '2024-01-16T09:30:00Z',
    comments: mockComments.filter(comment => comment.ticketId === '2')
  },
  {
    id: '3',
    title: 'Database migration for user profiles',
    description: 'Migrate existing user profile data to the new schema. This includes updating field names and data types to match the new requirements.',
    status: 'resolved',
    priority: 'medium',
    type: 'task',
    assignee: mockUsers[1],
    reporter: mockUsers[0],
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T17:30:00Z',
    comments: mockComments.filter(comment => comment.ticketId === '3')
  },
  {
    id: '4',
    title: 'Improve application performance',
    description: 'The application is loading slowly, especially on mobile devices. We need to optimize the bundle size and implement lazy loading for better performance.',
    status: 'open',
    priority: 'high',
    type: 'improvement',
    reporter: mockUsers[3],
    createdAt: '2024-01-17T11:00:00Z',
    updatedAt: '2024-01-17T11:00:00Z',
    comments: []
  },
  {
    id: '5',
    title: 'Navigation menu broken on mobile',
    description: 'The hamburger menu is not working properly on mobile devices. When tapped, it doesn\'t expand to show the navigation options.',
    status: 'open',
    priority: 'critical',
    type: 'bug',
    assignee: mockUsers[2],
    reporter: mockUsers[1],
    createdAt: '2024-01-17T14:20:00Z',
    updatedAt: '2024-01-17T14:20:00Z',
    comments: []
  }
];

// Helper functions
export const getTicketById = (id: string): Ticket | undefined => {
  return mockTickets.find(ticket => ticket.id === id);
};

export const getCommentsByTicketId = (ticketId: string): Comment[] => {
  return mockComments.filter(comment => comment.ticketId === ticketId);
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};