import { NextResponse } from 'next/server';
import { mockComments, mockUsers, getTicketById, addComment } from '../../../../../lib/mockData';
import { CreateCommentRequest, Comment, Attachment } from '../../../../../types/ticket';

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
    
    const body = await request.json();
    const attachments: Attachment[] = body.attachments || [];
    const content = body.content || '';
    
    // Cho phep gui comment chi voi attachments (khong can content)
    if (!content.trim() && attachments.length === 0) {
      return NextResponse.json(
        { error: 'Content or attachments are required' },
        { status: 400 }
      );
    }
    
    if (!body.authorId) {
      return NextResponse.json(
        { error: 'Author ID is required' },
        { status: 400 }
      );
    }
    
    const newComment = addComment(id, content, body.authorId, attachments);
    
    if (!newComment) {
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}