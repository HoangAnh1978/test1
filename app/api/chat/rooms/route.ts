import { NextResponse } from 'next/server';
import { executeGraphQL } from '@/lib/hasura';
import { 
  CreateChatRoomRequest, 
  SendMessageRequest, 
  JoinRoomRequest 
} from '@/types/chat';

// Get all chat rooms
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const query = `
      query GetChatRooms($userId: uuid!) {
        chat_rooms(
          where: {
            participants: {user_id: {_eq: $userId}}
          }
          order_by: {updated_at: desc}
        ) {
          id
          name
          description
          room_type
          is_private
          created_at
          updated_at
          participant_count
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
          last_message: messages(limit: 1, order_by: {created_at: desc}) {
            id
            content
            created_at
            user {
              id
              name
              avatar
            }
          }
        }
      }
    `;

    const data = await executeGraphQL(query, { userId });
    return NextResponse.json(data.chat_rooms);

  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat rooms' },
      { status: 500 }
    );
  }
}

// Create a new chat room
export async function POST(request: Request) {
  try {
    const body: CreateChatRoomRequest = await request.json();

    if (!body.name || !body.created_by) {
      return NextResponse.json(
        { error: 'Name and created_by are required' },
        { status: 400 }
      );
    }

    const mutation = `
      mutation CreateChatRoom($input: chat_rooms_insert_input!) {
        insert_chat_rooms_one(object: $input) {
          id
          name
          description
          room_type
          is_private
          created_at
          updated_at
          created_by
        }
      }
    `;

    const input = {
      name: body.name,
      description: body.description,
      room_type: body.room_type || 'group',
      is_private: body.is_private || false,
      created_by: body.created_by,
    };

    const data = await executeGraphQL(mutation, { input });
    const newRoom = data.insert_chat_rooms_one;

    // Auto-join the creator to the room
    const joinMutation = `
      mutation JoinChatRoom($input: chat_room_participants_insert_input!) {
        insert_chat_room_participants_one(object: $input) {
          room_id
          user_id
          joined_at
          role
        }
      }
    `;

    const joinInput = {
      room_id: newRoom.id,
      user_id: body.created_by,
      role: 'admin',
    };

    await executeGraphQL(joinMutation, { input: joinInput });

    return NextResponse.json(newRoom, { status: 201 });

  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json(
      { error: 'Failed to create chat room' },
      { status: 500 }
    );
  }
}