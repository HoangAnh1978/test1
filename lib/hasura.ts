import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// Hasura configuration
const HASURA_HTTP_URL = process.env.NEXT_PUBLIC_HASURA_HTTP_URL || 'http://localhost:8080/v1/graphql';
const HASURA_WS_URL = process.env.NEXT_PUBLIC_HASURA_WS_URL || 'ws://localhost:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET || 'myadminsecretkey';

// HTTP Link
const httpLink = createHttpLink({
  uri: HASURA_HTTP_URL,
});

// WebSocket Link for subscriptions
const wsLink = typeof window !== 'undefined' ? new GraphQLWsLink(
  createClient({
    url: HASURA_WS_URL,
    connectionParams: {
      headers: {
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
    },
  })
) : null;

// Auth link to add headers
const authLink = setContext((_, { headers }) => {
  // Get auth token from localStorage or wherever you store it
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  return {
    headers: {
      ...headers,
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      ...(token && { authorization: `Bearer ${token}` }),
    }
  };
});

// Split link between HTTP and WebSocket
const splitLink = typeof window !== 'undefined' && wsLink ? split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
) : authLink.concat(httpLink);

// Apollo Client instance
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// Helper function to execute GraphQL operations
export const executeGraphQL = async (query: string, variables?: Record<string, unknown>) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
  };

  // Add auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(HASURA_HTTP_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL Error');
    }
    
    return result.data;
  } catch (error) {
    console.error('GraphQL execution error:', error);
    throw error;
  }
};