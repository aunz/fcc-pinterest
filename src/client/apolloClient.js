import ApolloClient, { gql } from 'apollo-boost'
import { get, set, del } from 'idb-keyval'

const loggedInUser = '{ id ts name email gh gh_name token }'
export const LOCAL_USER = gql`query { localUser @client ${loggedInUser} }`

const __CREATE_USER = 'mutation createUserWithEmail($name: String, $email: String!, $pw: String!) { createUserWithEmail(name: $name, email: $email, pw: $pw) '
export const CREATE_USER = gql`${__CREATE_USER} @client }`

const __LOG_IN = 'mutation loginWith($provider: provider!, $email: String!, $code: String!) { loginWith(provider: $provider, email: $email, code: $code) '
export const LOG_IN = gql`${__LOG_IN} @client }`

const __LOG_OUT = 'mutation logout ($token: String!) { logout(token: $token) '
export const LOG_OUT = gql`${__LOG_OUT} @client }`

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
        localUser(_, { cache }) {
          return get('localUser')
            .catch(() => null) // when idb is not supported
            .then(user => {
              if (!user) return null
              if (!user.token) return null
              return cache.__client.mutate({
                mutation: gql`${__LOG_IN} ${loggedInUser}`,
                variables: {
                  provider: 'token',
                  email: '',
                  code: user.token,
                }
              }).then(({ loginWith }) => {
                if (!loginWith) {
                  del('localUser').catch(() => {})
                  return null
                }
                return loginWith
              }).catch(() => {})
            })

        },
      },
      Mutation: {
        createUserWithEmail(_, variables, { cache }) {
          return cache.__client.mutate({
            mutation: gql`${__CREATE_USER} ${loggedInUser} }`,
            variables,
          }).then(({ user }) => {
            cache.writeQuery({
              query: LOCAL_USER,
              data: { localUser: user }
            })
            return set('localUser', user).catch(() => null)
          })
        },
        loginWith(_, variables, { cache }) {
          return cache.__client.mutate({
            mutation: gql`${__LOG_IN} ${loggedInUser} }`,
            variables,
          }).then(({ user }) => {
            cache.writeQuery({
              query: LOCAL_USER,
              data: { localUser: user }
            })
            return set('localUser', user).catch(() => null)
          })
        },
        logout(_, variables, { cache }) {
          del('localUser').catch(() => {})
          cache.__client.mutate({
            mutation: gql`${__LOG_OUT} }`,
            variables,
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
client.cache.__client = client // so can access client within cache

export default client
