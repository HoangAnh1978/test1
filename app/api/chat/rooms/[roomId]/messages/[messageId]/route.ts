import { NextResponse } from 'next/server';
import { executeGraphQL } from '@/lib/hasura';
import { UpdateMessageRequest } from '@/types/chat';

interface ChatRoomParticipant {
  role: string;
}

interface MessageRoom {
  id: string;
  participants: ChatRoomParticipant[];
}

interface MessageData {
  id: string;
  user_id: string;
  room: MessageRoom;
}

// Update a message
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ roomId: string; messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const body: UpdateMessageRequest = await request.json();

    if (!body.content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Get user ID from header (simplified for demo)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Check if user owns the message
    const checkQuery = `
      query CheckMessageOwner($messageId: uuid!, $userId: uuid!) {
        chat_messages_by_pk(id: $messageId) {
          id
          user_id
        }
      }
    `;

    const checkData = await executeGraphQL(checkQuery, { messageId, userId });
    
    if (!checkData.chat_messages_by_pk) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (checkData.chat_messages_by_pk.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this message' },
        { status: 403 }
      );
    }

    const mutation = `
      mutation UpdateChatMessage($messageId: uuid!, $content: String!, $editedAt: timestamptz!) {
        update_chat_messages_by_pk(
          pk_columns: {id: $messageId}
          _set: {content: $content, edited_at: $editedAt}
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
        }
      }
    `;

    const editedAt = new Date().toISOString();
    const data = await executeGraphQL(mutation, { 
      messageId, 
      content: body.content, 
      editedAt 
    });

    return NextResponse.json(data.update_chat_messages_by_pk);

  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

// Delete a message
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ roomId: string; messageId: string }> }
) {
  try {
    const { messageId } = await params;

    // Get user ID from header (simplified for demo)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Check if user owns the message or is room admin
    const checkQuery = `
      query CheckMessagePermissions($messageId: uuid!, $userId: uuid!) {
        chat_messages_by_pk(id: $messageId) {
          id
          user_id
          room {
            id
            participants(where: {user_id: {_eq: $userId}}) {
              role
            }
          }
        }
      }
    `;

    const checkData = await executeGraphQL(checkQuery, { messageId, userId });
    
    if (!checkData.chat_messages_by_pk) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    const message = checkData.chat_messages_by_pk as MessageData;
    const isOwner = message.user_id === userId;
    const isAdmin = message.room.participants.some((p: ChatRoomParticipant) => 
      p.role === 'admin' || p.role === 'moderator'
    );

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this message' },
        { status: 403 }
      );
    }

    const mutation = `
      mutation DeleteChatMessage($messageId: uuid!) {
        delete_chat_messages_by_pk(id: $messageId) {
          id
        }
      }
    `;

    await executeGraphQL(mutation, { messageId });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}