import { NextResponse } from 'next/server';
import { mockTickets } from '../../../lib/mockData';

export async function GET() {
  try {
    // Sort tickets by creation date (newest first)
    const sortedTickets = [...mockTickets].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json(sortedTickets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}