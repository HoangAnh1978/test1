export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  ticketId: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'bug' | 'feature' | 'task' | 'improvement';
  assignee?: User;
  reporter: User;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  authorId: string;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: Ticket['status'];
  priority?: Ticket['priority'];
  assigneeId?: string;
}