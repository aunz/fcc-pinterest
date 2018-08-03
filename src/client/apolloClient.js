import ApolloClient, { gql } from 'apollo-boost'

const client = new ApolloClient({
  clientState: {
    defaults: {
    },
    typeDefs: ``,
    resolvers: {
      Query: {
      },
      Mutation: {
      }
    }
  },
  cacheRedirects: {
    Query: {
    }
  },
})

export default client
