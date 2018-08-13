import { randomBytes } from 'crypto'

import isEmail from 'validator/lib/isEmail'
import normalizeEmail from 'validator/lib/normalizeEmail'

import {
  errInput,
  errAuth,
} from '~/server/errors'

import {
  createUserWithEmail,
  createUserWithGH,
  getUserWithEmailPW,
  updateUser,
  getAndUpdateUserFromToken,
  delToken,
  createPin,
  getPins,
  delPin,
} from '~/server/db/dbFunctions'

import authWithGitHub from '~/server/OAuth'

const { GH_CLIENT_ID } = process.env

export default {
  Query: {
    pins(_, { uid }) { return getPins(uid) },
    GHclientId() { return GH_CLIENT_ID },
  },
  Mutation: {
    createUserWithEmail(_, { name, email, pw }) {
      if (!isEmail(email)) throw errInput('Email is invalid')
      if (pw.length < 3) throw errInput('Password too weak')
      return createUserWithEmail({ name, email: normalizeEmail(email), pw }).then(async id => {
        const token = (await randomBytes(21)).toString('base64') // a random token to be sent to client
        updateUser(id, { token })
        return {
          id,
          name,
          email,
          token,
        }
      }).catch(e => {
        if (/unique.*email/i.test(e.message)) throw errInput('Email has been registered')
        throw e
      })
    },
    loginWith(_, { provider, email, code }) {
      if (provider === 'email') return getUserWithEmailPW(email, code)
      if (provider === 'gh') return authWithGitHub(code).then(async ({ id: gh, name: gh_name }) => {
        const id = createUserWithGH({ gh, gh_name })
        const token = (await randomBytes(21)).toString('base64') // a random token to be sent to client
        updateUser(id, { token })
        return {
          id,
          gh,
          gh_name,
          token
        }
      })
      if (provider === 'token') return getAndUpdateUserFromToken(code)
      throw errInput('Provider is invalid')
    },
    logout(_, { token }) { return delToken(token) },
    createPin(_, { title, url, token }) { return createPin({ uid: getUid(token), title, url }) },
    delPin(_, { id, token }) { return delPin(id, getUid(token)) },
  },
}

function getUid(token) {
  const user = getAndUpdateUserFromToken(token)
  if (!user || !user.id) throw errAuth()
  return user.id
}
