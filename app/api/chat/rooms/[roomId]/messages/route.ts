import { NextResponse } from 'next/server';
import { executeGraphQL } from '@/lib/hasura';
import { SendMessageRequest } from '@/types/chat';

// Get messages for a chat room
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const query = `
      query GetChatMessages($roomId: uuid!, $limit: Int!, $offset: Int!) {
        chat_messages(
          where: {room_id: {_eq: $roomId}}
          order_by: {created_at: desc}
          limit: $limit
          offset: $offset
        ) {
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
    `;

    const data = await executeGraphQL(query, { roomId, limit, offset });
    
    // Reverse to get chronological order
    const messages = data.chat_messages.reverse();
    
    return NextResponse.json(messages);

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// Send a new message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body: SendMessageRequest = await request.json();

    if (!body.content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Get user ID from header or session (simplified for demo)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const mutation = `
      mutation SendChatMessage($input: chat_messages_insert_input!) {
        insert_chat_messages_one(object: $input) {
          id
          content
          message_type
          created_at
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
    `;

    const input = {
      room_id: roomId,
      user_id: userId,
      content: body.content,
      message_type: body.message_type || 'text',
      ...(body.reply_to_id && { reply_to_id: body.reply_to_id }),
    };

    const data = await executeGraphQL(mutation, { input });
    
    // Update room's updated_at timestamp
    const updateRoomMutation = `
      mutation UpdateRoomTimestamp($roomId: uuid!) {
        update_chat_rooms_by_pk(
          pk_columns: {id: $roomId}
          _set: {updated_at: "now()"}
        ) {
          id
          updated_at
        }
      }
    `;
    
    await executeGraphQL(updateRoomMutation, { roomId });

    return NextResponse.json(data.insert_chat_messages_one, { status: 201 });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}