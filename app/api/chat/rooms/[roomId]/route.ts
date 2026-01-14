import { NextResponse } from 'next/server';
import { executeGraphQL } from '@/lib/hasura';

// Get chat room by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;

    const query = `
      query GetChatRoom($roomId: uuid!) {
        chat_rooms_by_pk(id: $roomId) {
          id
          name
          description
          room_type
          is_private
          created_at
          updated_at
          created_by
          participants {
            user_id
            joined_at
            role
            user {
              id
              name
              email
              avatar
            }
          }
          messages(order_by: {created_at: asc}, limit: 100) {
            id
            content
            message_type
            created_at
            updated_at
            edited_at
            user {
              id
              name
              email
              avatar
            }
            reply_to {
              id
              content
              user {
                id
                name
                avatar
              }
            }
          }
        }
      }
    `;

    const data = await executeGraphQL(query, { roomId });
    
    if (!data.chat_rooms_by_pk) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data.chat_rooms_by_pk);

  } catch (error) {
    console.error('Error fetching chat room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat room' },
      { status: 500 }
    );
  }
}

// Update chat room
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();

    const mutation = `
      mutation UpdateChatRoom($roomId: uuid!, $input: chat_rooms_set_input!) {
        update_chat_rooms_by_pk(
          pk_columns: {id: $roomId}
          _set: $input
        ) {
          id
          name
          description
          room_type
          is_private
          updated_at
        }
      }
    `;

    const input = {
      ...(body.name && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.room_type && { room_type: body.room_type }),
      ...(body.is_private !== undefined && { is_private: body.is_private }),
      updated_at: new Date().toISOString(),
    };

    const data = await executeGraphQL(mutation, { roomId, input });
    
    if (!data.update_chat_rooms_by_pk) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data.update_chat_rooms_by_pk);

  } catch (error) {
    console.error('Error updating chat room:', error);
    return NextResponse.json(
      { error: 'Failed to update chat room' },
      { status: 500 }
    );
  }
}

// Delete chat room
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;

    const mutation = `
      mutation DeleteChatRoom($roomId: uuid!) {
        delete_chat_rooms_by_pk(id: $roomId) {
          id
        }
      }
    `;

    const data = await executeGraphQL(mutation, { roomId });
    
    if (!data.delete_chat_rooms_by_pk) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting chat room:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat room' },
      { status: 500 }
    );
  }
}