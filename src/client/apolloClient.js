import ApolloClient, { gql } from 'apollo-boost'
import { get, set, del } from 'idb-keyval'

const loggedInUser = '{ id ts name email gh gh_name token }'
export const LOCAL_USER = gql`query { localUser @client ${loggedInUser} }`
export const CREATE_USER = gql`mutation createUserWithEmail($name: String, $email: String!, $pw: String!) {
  createUserWithEmail(name: $name, email: $email, pw: $pw) ${loggedInUser}
}`
export const LOG_IN = gql`mutation loginWith($provider: provider!, $email: String!, $code: String!) {
  loginWith(provider: $provider, email: $email, code: $code) ${loggedInUser}
}`
export const LOG_OUT = gql`mutation logout ($token: String!) { logout(token: $token) }`

export const CREATE_PIN = gql`mutation createPin($title: String, $url: String!, $token: String!) { createPin(title: $title, url: $url, token: $token) }`
export const DEL_PIN = gql`mutation delPin($id: Int!, $token: String!) { delPin(id: $id, token: $token) }`
export const PINS = gql`query pins($uid: Int) { pins(uid: $uid) { id ts uid title url } }`
export const GH_CLIENT_ID = gql`query { GHclientId }`

const client = new ApolloClient({
  clientState: {
    defaults: {
    },
    typeDefs: `
    `,
    resolvers: {
      Query: {
        localUser() {
          return get('localUser')
        },
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
client.cache.__client = client // so can access client within cache

export default client
