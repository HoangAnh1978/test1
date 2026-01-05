'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Ticket, Comment, Attachment, User, Activity, TicketDetails } from '../types/ticket';

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
};

const typeIcons: Record<string, string> = { bug: 'B', feature: 'F', task: 'T', improvement: 'I' };
const statusOptions: Ticket['status'][] = ['open', 'in-progress', 'resolved', 'closed'];
const priorityOptions: Ticket['priority'][] = ['low', 'medium', 'high', 'critical'];

type TabType = 'all' | 'comments' | 'history';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const isImageFile = (mimeType: string): boolean => mimeType.startsWith('image/');

const getFileIcon = (mimeType: string): string => {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('word')) return 'DOC';
  if (mimeType.includes('excel')) return 'XLS';
  if (mimeType.includes('zip')) return 'ZIP';
  if (mimeType.includes('text')) return 'TXT';
  return 'FILE';
};

const getActivityDescription = (activity: Activity): string => {
  switch (activity.action) {
    case 'created':
      return 'da tao ticket';
    case 'status_changed':
      return `da doi trang thai tu "${activity.oldValue}" sang "${activity.newValue}"`;
    case 'priority_changed':
      return `da doi do uu tien tu "${activity.oldValue}" sang "${activity.newValue}"`;
    case 'assignee_changed':
      return `da doi nguoi phu trach tu "${activity.oldValue || 'Chua phan cong'}" sang "${activity.newValue}"`;
    case 'observer_added':
      return `da them nguoi giam sat: ${activity.newValue}`;
    case 'observer_removed':
      return `da xoa nguoi giam sat: ${activity.oldValue}`;
    case 'updated':
      return `da cap nhat ${activity.field}`;
    default:
      return 'da thuc hien thay doi';
  }
};

const getActivityIcon = (action: Activity['action']): React.ReactElement => {
  switch (action) {
    case 'created':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
    case 'status_changed':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'priority_changed':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>;
    case 'observer_added':
    case 'observer_removed':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
    default:
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
  }
};

// Editable Field Component
const EditableField = ({ 
  label, 
  value, 
  onSave, 
  type = 'text',
  multiline = false,
  className = '',
  disabled = false
}: { 
  label: string; 
  value: string; 
  onSave: (value: string) => void;
  type?: 'text' | 'date' | 'number';
  multiline?: boolean;
  className?: string;
  disabled?: boolean;
}) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (editing && !disabled) {
    return (
      <div className={className}>
        <div className="text-xs text-gray-500 uppercase mb-1">{label}</div>
        <div className="flex gap-2">
          {multiline ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-2 py-1 text-sm border rounded-lg dark:bg-gray-800 dark:text-white resize-none"
              rows={3}
              autoFocus
            />
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-2 py-1 text-sm border rounded-lg dark:bg-gray-800 dark:text-white"
              autoFocus
            />
          )}
          <div className="flex flex-col gap-1">
            <button type="button" onClick={handleSave} className="p-1 text-green-600 hover:bg-green-100 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </button>
            <button type="button" onClick={handleCancel} className="p-1 text-red-600 hover:bg-red-100 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${disabled ? '' : 'group cursor-pointer'} ${className}`} onClick={() => !disabled && setEditing(true)}>
      <div className="text-xs text-gray-500 uppercase mb-1 flex items-center gap-1">
        {label}
        {!disabled && <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
      </div>
      <p className={`text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg ${disabled ? 'opacity-75' : 'hover:bg-gray-100 dark:hover:bg-gray-800'} transition-colors`}>{value || <span className="text-gray-400">{disabled ? 'Khong co' : 'Click de nhap'}</span>}</p>
    </div>
  );
};

interface TicketDetailProps {
  ticketId: string;
}

export default function TicketDetail({ ticketId }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingObservers, setEditingObservers] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingExecutor, setEditingExecutor] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTicket();
    fetchComments();
    fetchActivities();
    fetchUsers();
  }, [ticketId]);

  useEffect(() => {
    if (ticket) {
      setEditTitle(ticket.title);
      setEditDescription(ticket.description);
    }
  }, [ticket]);

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (!response.ok) throw new Error('Failed to fetch ticket');
      setTicket(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      setComments(await response.json());
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/activities`);
      if (response.ok) setActivities(await response.json());
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) setAllUsers(await response.json());
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const updateTicket = async (updates: Record<string, unknown>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, userId: '1' })
      });
      if (!res.ok) throw new Error('Failed to update ticket');
      const updated = await res.json();
      setTicket(updated);
      fetchActivities();
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = (status: Ticket['status']) => {
    updateTicket({ status });
    setEditingStatus(false);
  };

  const handlePriorityChange = (priority: Ticket['priority']) => {
    updateTicket({ priority });
    setEditingPriority(false);
  };

  const handleObserverToggle = (userId: string) => {
    if (!ticket) return;
    const currentIds = ticket.observers?.map(o => o.id) || [];
    const newIds = currentIds.includes(userId) 
      ? currentIds.filter(id => id !== userId) 
      : [...currentIds, userId];
    updateTicket({ observerIds: newIds });
  };

  const handleTitleSave = () => {
    if (editTitle.trim() && editTitle !== ticket?.title) {
      updateTicket({ title: editTitle.trim() });
    }
    setEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    if (editDescription !== ticket?.description) {
      updateTicket({ description: editDescription });
    }
    setEditingDescription(false);
  };

  const handleDetailsSave = (field: keyof TicketDetails, value: string | number) => {
    if (!ticket?.details) return;
    updateTicket({ details: { [field]: value } });
  };

  const handleExecutorChange = (userId: string | null) => {
    updateTicket({ details: { executorId: userId } });
    setEditingExecutor(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append('files', file));
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setAttachments(prev => [...prev, ...data.files]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), authorId: '1', attachments })
      });
      if (!res.ok) throw new Error('Failed to add comment');
      const newComment = await res.json();
      setComments(prev => [...prev, newComment]);
      setContent('');
      setAttachments([]);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const parseCurrency = (value: string) => parseInt(value.replace(/[^0-9]/g, '')) || 0;

  const getAllItems = () => {
    const commentItems = comments.map(c => ({ type: 'comment' as const, data: c, date: new Date(c.createdAt) }));
    const activityItems = activities.map(a => ({ type: 'activity' as const, data: a, date: new Date(a.createdAt) }));
    return [...commentItems, ...activityItems].sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (error || !ticket) return <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-700">Error: {error || 'Ticket not found'}</p><Link href="/tickets" className="text-blue-600 mt-2 inline-block">Back to tickets</Link></div>;

  const renderComment = (comment: Comment) => (
    <div key={comment.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {comment.author.avatar ? <img src={comment.author.avatar} alt="" className="w-10 h-10 rounded-full" /> : <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-medium">{comment.author.name.charAt(0)}</div>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1"><span className="font-medium text-gray-900 dark:text-white">{comment.author.name}</span><span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span></div>
          {comment.content && <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="mt-3"><div className="text-xs font-medium text-gray-500 uppercase mb-2">Attachments</div>
              <div className="flex flex-wrap gap-2">
                {comment.attachments.map((att) => (
                  <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="group">
                    {isImageFile(att.mimeType) ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500"><img src={att.url} alt="" className="w-full h-full object-cover" /></div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200"><span className="text-xs font-bold px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">{getFileIcon(att.mimeType)}</span><div><div className="text-sm font-medium truncate max-w-[120px]">{att.originalName}</div><div className="text-xs text-gray-500">{formatFileSize(att.size)}</div></div></div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderActivity = (activity: Activity) => (
    <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
        {getActivityIcon(activity.action)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">
          <span className="font-medium text-gray-900 dark:text-white">{activity.user.name}</span>
          <span className="text-gray-600 dark:text-gray-400"> {getActivityDescription(activity)}</span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{formatDate(activity.createdAt)}</div>
      </div>
    </div>
  );

  const isClosed = ticket?.status === 'closed';

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Closed Banner */}
      {isClosed && (
        <div className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm text-gray-600 dark:text-gray-300">Ticket da dong. Khong the chinh sua hoac them binh luan.</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/tickets" className="hover:text-gray-700">Tickets</Link><span>/</span><span className="text-gray-900 dark:text-white">#{ticket.id}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 flex-1">
            <span className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-sm font-bold">{typeIcons[ticket.type]}</span>
            {editingTitle && !isClosed ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') { setEditTitle(ticket.title); setEditingTitle(false); } }}
                  className="flex-1 text-2xl font-bold px-2 py-1 border rounded-lg dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
                <button type="button" onClick={handleTitleSave} className="p-2 text-green-600 hover:bg-green-100 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button>
                <button type="button" onClick={() => { setEditTitle(ticket.title); setEditingTitle(false); }} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            ) : (
              <h1 
                className={`text-2xl font-bold text-gray-900 dark:text-white px-2 py-1 rounded-lg -mx-2 flex items-center gap-2 ${isClosed ? '' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 group'}`}
                onClick={() => !isClosed && setEditingTitle(true)}
              >
                {ticket.title}
                {!isClosed && <svg className="w-4 h-4 opacity-0 group-hover:opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
              </h1>
            )}
          </div>
          <div className="flex gap-2">
            {/* Status Dropdown - Always allow changing status (to reopen) */}
            <div className="relative">
              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingStatus(!editingStatus); setEditingPriority(false); setEditingObservers(false); }} disabled={updating} className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[ticket.status]} hover:ring-2 hover:ring-blue-400 cursor-pointer transition-all ${updating ? 'opacity-50' : ''}`}>{ticket.status.replace('-', ' ')}</button>
              {editingStatus && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[140px]">
                  {statusOptions.map((s) => (<button type="button" key={s} onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStatusChange(s); }} className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${ticket.status === s ? 'bg-gray-100 dark:bg-gray-700 font-semibold' : ''}`}><span className={`inline-block px-2 py-0.5 rounded-full text-xs ${statusColors[s]}`}>{s.replace('-', ' ')}</span></button>))}
                </div>
              )}
            </div>

            {/* Priority Dropdown - Disabled when closed */}
            <div className="relative">
              <button type="button" onClick={(e) => { if (isClosed) return; e.preventDefault(); e.stopPropagation(); setEditingPriority(!editingPriority); setEditingStatus(false); setEditingObservers(false); }} disabled={updating || isClosed} className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[ticket.priority]} ${isClosed ? 'cursor-not-allowed opacity-75' : 'hover:ring-2 hover:ring-blue-400 cursor-pointer'} transition-all ${updating ? 'opacity-50' : ''}`}>{ticket.priority}</button>
              {editingPriority && !isClosed && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[120px]">
                  {priorityOptions.map((p) => (<button type="button" key={p} onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePriorityChange(p); }} className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${ticket.priority === p ? 'bg-gray-100 dark:bg-gray-700 font-semibold' : ''}`}><span className={`inline-block px-2 py-0.5 rounded-full text-xs ${priorityColors[p]}`}>{p}</span></button>))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div><label className="block text-sm font-medium text-gray-500 mb-1">Reporter</label><div className="flex items-center gap-2">{ticket.reporter.avatar && <img src={ticket.reporter.avatar} alt="" className="w-6 h-6 rounded-full" />}<span className="font-medium">{ticket.reporter.name}</span></div></div>
          <div><label className="block text-sm font-medium text-gray-500 mb-1">Assignee</label><div className="flex items-center gap-2">{ticket.assignee ? (<>{ticket.assignee.avatar && <img src={ticket.assignee.avatar} alt="" className="w-6 h-6 rounded-full" />}<span className="font-medium">{ticket.assignee.name}</span></>) : (<span className="text-gray-400">Chua phan cong</span>)}</div></div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-500 mb-1">Observers</label>
            <button type="button" onClick={(e) => { if (isClosed) return; e.preventDefault(); e.stopPropagation(); setEditingObservers(!editingObservers); setEditingStatus(false); setEditingPriority(false); }} disabled={isClosed} className={`flex items-center gap-2 rounded-lg px-2 py-1 -ml-2 transition-colors ${isClosed ? 'cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              {ticket.observers && ticket.observers.length > 0 ? (<><div className="flex -space-x-2">{ticket.observers.slice(0, 3).map((o) => (<img key={o.id} src={o.avatar} alt={o.name} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800" title={o.name} />))}{ticket.observers.length > 3 && (<span className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-800">+{ticket.observers.length - 3}</span>)}</div><span className="text-sm text-gray-600 dark:text-gray-300">{ticket.observers.length}</span></>) : (<span className="text-sm text-gray-400">{isClosed ? 'Khong co' : '+ Them'}</span>)}
              {!isClosed && <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
            </button>
            {editingObservers && !isClosed && (
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[280px] max-h-[300px] overflow-y-auto">
                <div className="p-3 border-b border-gray-200 dark:border-gray-600"><span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quan ly nguoi giam sat</span></div>
                <div className="p-2">
                  {allUsers.map((user) => {
                    const isObserver = ticket.observers?.some(o => o.id === user.id) || false;
                    return (<button type="button" key={user.id} onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleObserverToggle(user.id); }} disabled={updating} className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 ${updating ? 'opacity-50' : ''}`}><input type="checkbox" checked={isObserver} readOnly className="w-4 h-4 rounded border-gray-300 pointer-events-none" />{user.avatar && <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />}<div className="flex-1 min-w-0"><div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div><div className="text-xs text-gray-500">{user.email}</div></div></button>);
                  })}
                </div>
                <div className="p-2 border-t border-gray-200 dark:border-gray-600"><button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingObservers(false); }} className="w-full py-2 text-center text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium">Xong</button></div>
              </div>
            )}
          </div>
        </div>

        {/* Editable Description */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
            Description
            {!isClosed && <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
          </label>
          {editingDescription && !isClosed ? (
            <div className="space-y-2">
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                rows={4}
                autoFocus
              />
              <div className="flex gap-2">
                <button type="button" onClick={handleDescriptionSave} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Luu</button>
                <button type="button" onClick={() => { setEditDescription(ticket.description); setEditingDescription(false); }} className="px-3 py-1 text-gray-600 text-sm hover:bg-gray-100 rounded-lg">Huy</button>
              </div>
            </div>
          ) : (
            <p 
              className={`text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg ${isClosed ? 'opacity-75' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors`}
              onClick={() => !isClosed && setEditingDescription(true)}
            >
              {ticket.description || <span className="text-gray-400">{isClosed ? 'Khong co mo ta' : 'Click de them mo ta'}</span>}
            </p>
          )}
        </div>

        {/* Editable Details Section */}
        {ticket.details && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-500 mb-3 flex items-center gap-1">
              Chi tiet cong viec
              {!isClosed && <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Content - Editable */}
              <EditableField
                label="Noi dung"
                value={ticket.details.content}
                onSave={(value) => handleDetailsSave('content', value)}
                multiline
                className="md:col-span-2 lg:col-span-3"
                disabled={isClosed}
              />

              {/* Executor - Dropdown */}
              <div className="relative">
                <div className="text-xs text-gray-500 uppercase mb-1">Nguoi thuc hien</div>
                <button
                  type="button"
                  onClick={() => !isClosed && setEditingExecutor(!editingExecutor)}
                  disabled={isClosed}
                  className={`flex items-center gap-2 w-full p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg transition-colors ${isClosed ? 'cursor-not-allowed opacity-75' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {ticket.details.executor ? (
                    <><img src={ticket.details.executor.avatar} alt="" className="w-5 h-5 rounded-full" /><span className="text-sm">{ticket.details.executor.name}</span></>
                  ) : (
                    <span className="text-sm text-gray-400">Chua phan cong</span>
                  )}
                  {!isClosed && <svg className="w-3 h-3 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
                </button>
                {editingExecutor && !isClosed && (
                  <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[200px] max-h-[250px] overflow-y-auto">
                    <button type="button" onClick={() => handleExecutorChange(null)} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">Chua phan cong</button>
                    {allUsers.map((user) => (
                      <button type="button" key={user.id} onClick={() => handleExecutorChange(user.id)} className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${ticket.details?.executor?.id === user.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                        {user.avatar && <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" />}
                        <span>{user.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer - Editable */}
              <EditableField label="Khach hang" value={ticket.details.customer} onSave={(value) => handleDetailsSave('customer', value)} disabled={isClosed} />

              {/* Date Range */}
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Thoi gian</div>
                <div className={`flex items-center gap-1 text-sm bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg ${isClosed ? 'opacity-75' : ''}`}>
                  <input type="date" value={ticket.details.startDate} onChange={(e) => handleDetailsSave('startDate', e.target.value)} disabled={isClosed} className={`bg-transparent text-green-600 border-none p-0 text-sm ${isClosed ? 'cursor-not-allowed' : ''}`} />
                  <span className="text-gray-400">-</span>
                  <input type="date" value={ticket.details.endDate} onChange={(e) => handleDetailsSave('endDate', e.target.value)} disabled={isClosed} className={`bg-transparent text-red-600 border-none p-0 text-sm ${isClosed ? 'cursor-not-allowed' : ''}`} />
                </div>
              </div>

              {/* Cost - Editable */}
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Chi phi</div>
                <input
                  type="number"
                  value={ticket.details.cost}
                  onChange={(e) => handleDetailsSave('cost', parseInt(e.target.value) || 0)}
                  disabled={isClosed}
                  className={`w-full text-sm font-medium text-blue-600 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border-none ${isClosed ? 'cursor-not-allowed opacity-75' : ''}`}
                />
              </div>

              {/* Additional Cost - Editable */}
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Phat sinh</div>
                <input
                  type="number"
                  value={ticket.details.additionalCost}
                  onChange={(e) => handleDetailsSave('additionalCost', parseInt(e.target.value) || 0)}
                  disabled={isClosed}
                  className={`w-full text-sm font-medium bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border-none ${ticket.details.additionalCost > 0 ? 'text-orange-600' : 'text-gray-400'} ${isClosed ? 'cursor-not-allowed opacity-75' : ''}`}
                />
              </div>

              {/* Total - Read only */}
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Tong cong</div>
                <span className="text-sm font-bold text-green-600 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg block">{formatCurrency(ticket.details.cost + ticket.details.additionalCost)}</span>
              </div>

              {/* Notes - Editable */}
              <EditableField
                label="Ghi chu"
                value={ticket.details.notes || ''}
                onSave={(value) => handleDetailsSave('notes', value)}
                multiline
                className="md:col-span-2 lg:col-span-3"
                disabled={isClosed}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"><span>Created: {formatDate(ticket.createdAt)}</span><span>Updated: {formatDate(ticket.updatedAt)}</span></div>
      </div>

      {/* Comments & History Section with Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
          <button type="button" onClick={() => setActiveTab('all')} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Tat ca ({comments.length + activities.length})</button>
          <button type="button" onClick={() => setActiveTab('comments')} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'comments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Binh luan ({comments.length})</button>
          <button type="button" onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Lich su ({activities.length})</button>
        </div>

        <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
          {activeTab === 'all' && (getAllItems().length > 0 ? getAllItems().map(item => item.type === 'comment' ? renderComment(item.data as Comment) : renderActivity(item.data as Activity)) : <p className="text-center py-4 text-gray-500">Chua co hoat dong nao.</p>)}
          {activeTab === 'comments' && (comments.length > 0 ? comments.map(renderComment) : <p className="text-center py-4 text-gray-500">Chua co binh luan nao.</p>)}
          {activeTab === 'history' && (activities.length > 0 ? activities.map(renderActivity) : <p className="text-center py-4 text-gray-500">Chua co lich su thay doi.</p>)}
        </div>

        {/* Comment Form - Hidden or disabled when closed */}
        {isClosed ? (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
            <svg className="w-6 h-6 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm">Ticket da dong. Khong the them binh luan moi.</p>
            <p className="text-xs mt-1">Thay doi trang thai de mo lai ticket.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Viet binh luan..." rows={3} className="w-full px-3 py-2 border rounded-lg mb-3 dark:bg-gray-800 dark:text-white resize-none" />
            {attachments.length > 0 && (
              <div className="mb-3"><div className="text-xs font-medium text-gray-500 uppercase mb-2">File dinh kem</div>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att) => (
                    <div key={att.id} className="relative group">
                      {isImageFile(att.mimeType) ? <div className="w-16 h-16 rounded-lg overflow-hidden border"><img src={att.url} alt="" className="w-full h-full object-cover" /></div> : <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-sm"><span className="font-bold">{getFileIcon(att.mimeType)}</span><span className="truncate max-w-[80px]">{att.originalName}</span></div>}
                      <button type="button" onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100">x</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" onChange={handleFileSelect} className="hidden" id="file-upload-detail" />
                <label htmlFor="file-upload-detail" className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  <span>{uploading ? 'Dang tai...' : 'Dinh kem'}</span>
                </label>
              </div>
              <button type="submit" disabled={submitting || (!content.trim() && attachments.length === 0)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                <span>{submitting ? 'Dang gui...' : 'Gui'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}