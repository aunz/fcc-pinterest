import ApolloClient, { gql } from 'apollo-boost'
import { get, set, del } from 'idb-keyval'

const loggedInUser = '{ id ts name email gh gh_name token }'
export const LOCAL_USER = gql`query { localUser @client ${loggedInUser} }`

const __CREATE_USER = 'mutation createUserWithEmail($name: String, $email: String!, $pw: String!) { createUserWithEmail(name: $name, email: $email, pw: $pw) '
export const CREATE_USER = gql`${__CREATE_USER} @client }`

const __LOG_IN = 'mutation loginWith($provider: provider!, $email: String!, $code: String!) { loginWith(provider: $provider, email: $email, code: $code) '
export const LOG_IN = gql`${__LOG_IN} @client }`

export const LOG_OUT = gql`mutation { logout @client }`

export const CREATE_PIN = gql`mutation createPin($url: String!, $token: String!, $title: String, $description: String) { createPin(url: $url, token: $token, title: $title, description: $description) }`
export const DEL_PIN = gql`mutation delPin($id: Int!, $token: String!) { delPin(id: $id, token: $token) }`
export const PINS = gql`query pins($uid: Int) { pins(uid: $uid) { id ts uid url title description } }`
export const GH_CLIENT_ID = gql`query { GHclientId }`

const client = new ApolloClient({
  clientState: {
    defaults: {
    },
    typeDefs: ``,
    resolvers: {
      Query: {
        localUser(_, args, { cache }) {
          return get('localUser')
            .catch(() => null) // when idb is not supported
            .then(user => {
              if (!user) return null
              if (!user.token) return null
              return cache.__client.mutate({
                mutation: gql`${__LOG_IN} ${loggedInUser} }`,
                variables: {
                  provider: 'token',
                  email: '',
                  code: user.token,
                },
                fetchPolicy: 'no-cache',
              }).then(({ data: { loginWith } }) => {
                if (!loginWith) {
                  del('localUser').catch(() => {})
                  return null
                }
                loginWith.token = user.token
                return loginWith
              })
            })
        },
      },
      Mutation: {
        createUserWithEmail(_, variables, { cache }) {
          return cache.__client.mutate({
            mutation: gql`${__CREATE_USER} ${loggedInUser} }`,
            variables,
            fetchPolicy: 'no-cache',
          }).then(({ data: { createUserWithEmail: user } }) => {
            user.name = variables.name
            user.email = variables.email
            cache.writeQuery({
              query: LOCAL_USER,
              data: { localUser: user }
            })
            set('localUser', user).catch(() => null)
            return user
          })
        },
        loginWith(_, variables, { cache }) {
          return cache.__client.mutate({
            mutation: gql`${__LOG_IN} ${loggedInUser} }`,
            variables,
            fetchPolicy: 'no-cache',
          }).then(({ data: { loginWith: user } }) => {
            if (!user) throw new Error('Unauthorized')
            cache.writeQuery({
              query: LOCAL_USER,
              data: { localUser: user }
            })
            set('localUser', user).catch(() => null)
            return user
          })
        },
        logout(_, variables, { cache }) {
          del('localUser').catch(() => {})
          cache.__client.mutate({
            mutation: gql`mutation logout($token: String!) { logout(token: $token) }`,
            variables: {
              token: cache.readQuery({ query: LOCAL_USER }).localUser.token
            },
          })
          setTimeout(window.location.reload.bind(window.location), 99)
        }
      }
    }
  },
  cacheRedirects: {
    Query: {
    }
  },
})
client.cache.__client = client // a hack so it is possible to access client within cache

export default client
