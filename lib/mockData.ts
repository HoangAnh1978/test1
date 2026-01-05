import { Ticket, User, Comment, TicketDetails, Attachment, Activity } from '../types/ticket';

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
    ticketId: '1',
    attachments: [
      {
        id: 'att1',
        filename: 'screenshot-error.png',
        originalName: 'screenshot-error.png',
        mimeType: 'image/png',
        size: 245000,
        url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
        createdAt: '2024-01-15T10:30:00Z'
      }
    ]
  },
  {
    id: '2',
    content: 'Thanks for the report. I\'ll investigate this issue and provide an update soon.',
    author: mockUsers[0],
    createdAt: '2024-01-15T11:15:00Z',
    ticketId: '1',
    attachments: []
  },
  {
    id: '3',
    content: 'I\'ve identified the root cause. The problem is in the token validation logic. Working on a fix.',
    author: mockUsers[0],
    createdAt: '2024-01-15T14:20:00Z',
    updatedAt: '2024-01-15T14:25:00Z',
    ticketId: '1',
    attachments: [
      {
        id: 'att2',
        filename: 'debug-log.txt',
        originalName: 'debug-log.txt',
        mimeType: 'text/plain',
        size: 12500,
        url: '/uploads/debug-log.txt',
        createdAt: '2024-01-15T14:20:00Z'
      }
    ]
  },
  {
    id: '4',
    content: 'This would be a great addition to improve user experience. I suggest we implement this in the next sprint.',
    author: mockUsers[2],
    createdAt: '2024-01-16T09:00:00Z',
    ticketId: '2',
    attachments: []
  },
  {
    id: '5',
    content: 'Agreed! I can start working on the wireframes and user flow this week.',
    author: mockUsers[3],
    createdAt: '2024-01-16T09:30:00Z',
    ticketId: '2',
    attachments: [
      {
        id: 'att3',
        filename: 'wireframe-v1.pdf',
        originalName: 'wireframe-v1.pdf',
        mimeType: 'application/pdf',
        size: 1250000,
        url: '/uploads/wireframe-v1.pdf',
        createdAt: '2024-01-16T09:30:00Z'
      }
    ]
  },
  {
    id: '6',
    content: 'The data has been successfully migrated. All tests are passing.',
    author: mockUsers[1],
    createdAt: '2024-01-14T16:45:00Z',
    ticketId: '3',
    attachments: []
  },
  {
    id: '7',
    content: 'Great work! I\'ve verified the migration on the staging environment. Everything looks good.',
    author: mockUsers[0],
    createdAt: '2024-01-14T17:30:00Z',
    ticketId: '3',
    attachments: []
  }
];

// Activities/History
export const mockActivities: Activity[] = [
  {
    id: 'act1',
    ticketId: '1',
    userId: '1',
    user: mockUsers[0],
    action: 'created',
    createdAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 'act2',
    ticketId: '1',
    userId: '1',
    user: mockUsers[0],
    action: 'status_changed',
    field: 'status',
    oldValue: 'open',
    newValue: 'in-progress',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'act3',
    ticketId: '1',
    userId: '2',
    user: mockUsers[1],
    action: 'priority_changed',
    field: 'priority',
    oldValue: 'medium',
    newValue: 'high',
    createdAt: '2024-01-15T11:00:00Z'
  },
  {
    id: 'act4',
    ticketId: '1',
    userId: '1',
    user: mockUsers[0],
    action: 'observer_added',
    field: 'observers',
    newValue: 'Bob Johnson',
    createdAt: '2024-01-15T12:00:00Z'
  },
  {
    id: 'act5',
    ticketId: '2',
    userId: '2',
    user: mockUsers[1],
    action: 'created',
    createdAt: '2024-01-16T08:30:00Z'
  },
  {
    id: 'act6',
    ticketId: '5',
    userId: '1',
    user: mockUsers[0],
    action: 'created',
    createdAt: '2024-01-17T14:20:00Z'
  }
];

let activityIdCounter = 7;

export const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Login page not working correctly',
    description: 'Users are unable to log in using their credentials.',
    details: {
      content: 'The form seems to accept the input but returns an error message saying "Invalid credentials" even with correct credentials. Need to investigate the authentication flow and token validation.',
      executor: mockUsers[0],
      customer: 'ABC Company',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      cost: 5000000,
      additionalCost: 500000,
      notes: 'Urgent fix required for production'
    },
    status: 'in-progress',
    priority: 'high',
    type: 'bug',
    assignee: mockUsers[0],
    reporter: mockUsers[1],
    observers: [mockUsers[2], mockUsers[3]],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T14:25:00Z',
    comments: mockComments.filter(comment => comment.ticketId === '1')
  },
  {
    id: '2',
    title: 'Add dark mode support',
    description: 'Implement dark mode functionality across the entire application.',
    details: {
      content: 'Users should be able to toggle between light and dark themes, and the preference should be saved to local storage and user profile.',
      executor: mockUsers[3],
      customer: 'Internal Project',
      startDate: '2024-01-16',
      endDate: '2024-01-30',
      cost: 8000000,
      additionalCost: 0,
      notes: 'Include all UI components and pages'
    },
    status: 'open',
    priority: 'medium',
    type: 'feature',
    assignee: mockUsers[3],
    reporter: mockUsers[2],
    observers: [mockUsers[0]],
    createdAt: '2024-01-16T08:30:00Z',
    updatedAt: '2024-01-16T09:30:00Z',
    comments: mockComments.filter(comment => comment.ticketId === '2')
  },
  {
    id: '3',
    title: 'Database migration for user profiles',
    description: 'Migrate existing user profile data to the new schema.',
    details: {
      content: 'This includes updating field names and data types to match the new requirements. Backup data before migration.',
      executor: mockUsers[1],
      customer: 'XYZ Corporation',
      startDate: '2024-01-14',
      endDate: '2024-01-14',
      cost: 3000000,
      additionalCost: 200000,
      notes: 'Completed successfully'
    },
    status: 'resolved',
    priority: 'medium',
    type: 'task',
    assignee: mockUsers[1],
    reporter: mockUsers[0],
    observers: [],
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T17:30:00Z',
    comments: mockComments.filter(comment => comment.ticketId === '3')
  },
  {
    id: '4',
    title: 'Improve application performance',
    description: 'The application is loading slowly, especially on mobile devices.',
    details: {
      content: 'We need to optimize the bundle size and implement lazy loading for better performance. Also consider implementing caching strategies.',
      customer: 'DEF Enterprise',
      startDate: '2024-01-17',
      endDate: '2024-02-01',
      cost: 12000000,
      additionalCost: 1500000,
      notes: 'Performance audit required first'
    },
    status: 'open',
    priority: 'high',
    type: 'improvement',
    reporter: mockUsers[3],
    observers: [mockUsers[0], mockUsers[1]],
    createdAt: '2024-01-17T11:00:00Z',
    updatedAt: '2024-01-17T11:00:00Z',
    comments: []
  },
  {
    id: '5',
    title: 'Navigation menu broken on mobile',
    description: 'The hamburger menu is not working properly on mobile devices.',
    details: {
      content: 'When tapped, it doesn\'t expand to show the navigation options. Issue occurs on both iOS and Android devices.',
      executor: mockUsers[2],
      customer: 'GHI Solutions',
      startDate: '2024-01-17',
      endDate: '2024-01-18',
      cost: 2000000,
      additionalCost: 0,
      notes: 'Critical mobile issue'
    },
    status: 'open',
    priority: 'critical',
    type: 'bug',
    assignee: mockUsers[2],
    reporter: mockUsers[1],
    observers: [],
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

export const getAllUsers = (): User[] => {
  return mockUsers;
};

export const updateTicket = (id: string, updates: { 
  status?: Ticket['status']; 
  priority?: Ticket['priority'];
  observerIds?: string[];
  title?: string;
  description?: string;
  details?: Partial<TicketDetails> & { executorId?: string };
}): Ticket | undefined => {
  const ticketIndex = mockTickets.findIndex(ticket => ticket.id === id);
  if (ticketIndex === -1) {
    return undefined;
  }
  
  if (updates.status) {
    mockTickets[ticketIndex].status = updates.status;
  }
  if (updates.priority) {
    mockTickets[ticketIndex].priority = updates.priority;
  }
  if (updates.observerIds !== undefined) {
    mockTickets[ticketIndex].observers = updates.observerIds
      .map(id => mockUsers.find(u => u.id === id))
      .filter((u): u is User => u !== undefined);
  }
  if (updates.title) {
    mockTickets[ticketIndex].title = updates.title;
  }
  if (updates.description) {
    mockTickets[ticketIndex].description = updates.description;
  }
  if (updates.details) {
    const currentDetails = mockTickets[ticketIndex].details;
    const { executorId, ...detailUpdates } = updates.details;
    
    mockTickets[ticketIndex].details = {
      ...currentDetails,
      ...detailUpdates,
      executor: executorId ? mockUsers.find(u => u.id === executorId) : currentDetails.executor,
    };
  }
  mockTickets[ticketIndex].updatedAt = new Date().toISOString();
  
  return mockTickets[ticketIndex];
};

let commentIdCounter = 8;

export const addComment = (ticketId: string, content: string, authorId: string, attachments: Attachment[] = []): Comment | undefined => {
  const author = mockUsers.find(u => u.id === authorId);
  if (!author) return undefined;
  
  const ticketIndex = mockTickets.findIndex(t => t.id === ticketId);
  if (ticketIndex === -1) return undefined;
  
  const newComment: Comment = {
    id: String(commentIdCounter++),
    content,
    author,
    createdAt: new Date().toISOString(),
    ticketId,
    attachments
  };
  
  mockComments.push(newComment);
  mockTickets[ticketIndex].comments.push(newComment);
  mockTickets[ticketIndex].updatedAt = new Date().toISOString();
  
  return newComment;
};

export const getActivitiesByTicketId = (ticketId: string): Activity[] => {
  return mockActivities
    .filter(activity => activity.ticketId === ticketId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addActivity = (
  ticketId: string,
  userId: string,
  action: Activity['action'],
  field?: string,
  oldValue?: string,
  newValue?: string
): Activity | undefined => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return undefined;

  const newActivity: Activity = {
    id: `act${activityIdCounter++}`,
    ticketId,
    userId,
    user,
    action,
    field,
    oldValue,
    newValue,
    createdAt: new Date().toISOString()
  };

  mockActivities.push(newActivity);
  return newActivity;
};

export const updateTicketWithHistory = (
  id: string,
  userId: string,
  updates: { 
    status?: Ticket['status']; 
    priority?: Ticket['priority'];
    observerIds?: string[];
    title?: string;
    description?: string;
    details?: Partial<TicketDetails> & { executorId?: string };
  }
): Ticket | undefined => {
  const ticketIndex = mockTickets.findIndex(ticket => ticket.id === id);
  if (ticketIndex === -1) return undefined;
  
  const ticket = mockTickets[ticketIndex];

  // Log status change
  if (updates.status && updates.status !== ticket.status) {
    addActivity(id, userId, 'status_changed', 'status', ticket.status, updates.status);
    mockTickets[ticketIndex].status = updates.status;
  }

  // Log priority change
  if (updates.priority && updates.priority !== ticket.priority) {
    addActivity(id, userId, 'priority_changed', 'priority', ticket.priority, updates.priority);
    mockTickets[ticketIndex].priority = updates.priority;
  }

  // Log observer changes
  if (updates.observerIds !== undefined) {
    const currentIds = ticket.observers?.map(o => o.id) || [];
    const addedIds = updates.observerIds.filter(id => !currentIds.includes(id));
    const removedIds = currentIds.filter(id => !updates.observerIds!.includes(id));

    addedIds.forEach(obsId => {
      const obsUser = mockUsers.find(u => u.id === obsId);
      if (obsUser) {
        addActivity(id, userId, 'observer_added', 'observers', undefined, obsUser.name);
      }
    });

    removedIds.forEach(obsId => {
      const obsUser = mockUsers.find(u => u.id === obsId);
      if (obsUser) {
        addActivity(id, userId, 'observer_removed', 'observers', obsUser.name, undefined);
      }
    });

    mockTickets[ticketIndex].observers = updates.observerIds
      .map(id => mockUsers.find(u => u.id === id))
      .filter((u): u is User => u !== undefined);
  }

  // Log title change
  if (updates.title && updates.title !== ticket.title) {
    addActivity(id, userId, 'updated', 'title', ticket.title, updates.title);
    mockTickets[ticketIndex].title = updates.title;
  }

  // Log description change
  if (updates.description && updates.description !== ticket.description) {
    addActivity(id, userId, 'updated', 'description', ticket.description, updates.description);
    mockTickets[ticketIndex].description = updates.description;
  }

  if (updates.details) {
    const currentDetails = mockTickets[ticketIndex].details;
    const { executorId, ...detailUpdates } = updates.details;
    
    mockTickets[ticketIndex].details = {
      ...currentDetails,
      ...detailUpdates,
      executor: executorId ? mockUsers.find(u => u.id === executorId) : currentDetails.executor,
    };
  }

  mockTickets[ticketIndex].updatedAt = new Date().toISOString();
  
  return mockTickets[ticketIndex];
};