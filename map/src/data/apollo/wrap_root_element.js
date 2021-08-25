import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from './client';

/**
 * Wrap an element with ApolloProvider
 */
export const wrapRootElementWithApolloProvider = ({ element }) => (
  <ApolloProvider client={client}>{element}</ApolloProvider>
);
