import { ApolloServer } from 'apollo-server-express'
import typeDefs from './typeDefs.gql'
import resolvers from './resolvers'

export default new ApolloServer({
  typeDefs,
  resolvers,
  context({ req, res }) { return { req, res } },
})
