import { NextResponse } from 'next/server';
import { getTicketById, updateTicketWithHistory } from '../../../../lib/mockData';

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
    
    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Use userId from body or default to '1' (current user)
    const userId = body.userId || '1';
    
    const updatedTicket = updateTicketWithHistory(id, userId, {
      status: body.status,
      priority: body.priority,
      observerIds: body.observerIds,
      title: body.title,
      description: body.description,
      details: body.details,
    });
    
    if (!updatedTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedTicket);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}