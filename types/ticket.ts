export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  ticketId: string;
  attachments: Attachment[];
}

export type RouteAttribute = 'rong' | 'giao' | 'nhan' | 'giao-nhan' | 've-bai';

export interface RouteAddress {
  id: string;
  address: string;
  attribute: RouteAttribute;
}

export interface TicketDetails {
  content: string;
  executor?: User;
  customer: string;
  startDate: string;
  endDate: string;
  cost: number;
  additionalCost: number;
  notes?: string;
  route?: RouteAddress[];
}

export interface Activity {
  id: string;
  ticketId: string;
  userId: string;
  user: User;
  action: 'created' | 'updated' | 'status_changed' | 'priority_changed' | 'assignee_changed' | 'observer_added' | 'observer_removed';
  field?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  details: TicketDetails;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'bug' | 'feature' | 'task' | 'improvement';
  assignee?: User;
  reporter: User;
  observers: User[];
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  authorId: string;
  attachments?: Attachment[];
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  details?: Partial<TicketDetails>;
  status?: Ticket['status'];
  priority?: Ticket['priority'];
  assigneeId?: string;
  observerIds?: string[];
}