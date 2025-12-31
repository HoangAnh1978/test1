import { NextResponse } from 'next/server';
import { mockComments, mockUsers, getTicketById } from '../../../../../lib/mockData';
import { CreateCommentRequest, Comment } from '../../../../../types/ticket';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = getTicketById(id);
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    const comments = mockComments
      .filter(comment => comment.ticketId === id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = getTicketById(id);
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    const body: CreateCommentRequest = await request.json();
    
    if (!body.content || !body.authorId) {
      return NextResponse.json(
        { error: 'Content and author ID are required' },
        { status: 400 }
      );
    }
    
    const author = mockUsers.find(user => user.id === body.authorId);
    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }
    
    const newComment: Comment = {
      id: (mockComments.length + 1).toString(),
      content: body.content,
      author,
      createdAt: new Date().toISOString(),
      ticketId: id
    };
    
    // In a real app, this would save to a database
    mockComments.push(newComment);
    ticket.comments.push(newComment);
    ticket.updatedAt = new Date().toISOString();
    
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}