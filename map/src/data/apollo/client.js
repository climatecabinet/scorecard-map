import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { fetchWithAccessToken } from '../realm/auth';
import { REALM_GRAPHQL_ENDPOINT } from '../realm/constants';

export const client = new ApolloClient({
  link: new HttpLink({
    uri: REALM_GRAPHQL_ENDPOINT,
    fetch: fetchWithAccessToken,
  }),
  cache: new InMemoryCache(),
});
