import test from 'tape'
import { graphql } from 'graphql'

import db from '~/server/db/sqlite'

db.exec(require('~/server/db/createTable/createTable.sql'))
const { schema } = require('./index').default

const s = { skip: true } // eslint-disable-line

const f = '{ id name email gh gh_name token }'

test('init user', async t => {
  const { data: r } = await graphql(schema, `mutation {
    u1: createUserWithEmail(name: "u1", email: "1@test.com", pw: "123") ${f}
    u2: createUserWithEmail(name: "u2", email: "2@test.com", pw: "123") ${f}
    u3: createUserWithEmail(name: "u3", email: "3@test.com", pw: "123") ${f}
  }`)

  t.equal(Object.keys(r.u1).join(' '), f.replace(/{|}/g, '').trim(), 'all keys returned')
  t.ok(r.u1.id > 10000 && r.u1.id < r.u2.id && r.u2.id < r.u3.id, 'uids are set')
  t.equal(r.u1.name + r.u1.email + ' ' + r.u2.name + r.u2.email + ' ' + r.u3.name + r.u3.email, 'u11@test.com u22@test.com u33@test.com', 'names are set')
  t.ok(r.u1.token.length === 28, 'token is a string of length 28')

  t.end()
})

test('login/out', async t => {
  let r = (await graphql(schema, `mutation { loginWith(provider: email, email: "1@test.com", code: "123") ${f} }`)).data.loginWith
  t.equal(Object.keys(r).join(' ') + r.name + r.email + ' ' + r.token.length, f.replace(/{|}/g, '').trim() + 'u11@test.com 28', 'can login with email')

  r = (await graphql(schema, `mutation { loginWith(provider: token, email: "", code: "${r.token}") ${f} }`)).data.loginWith
  t.equal(Object.keys(r).join(' ') + r.name + r.email + ' ' + r.token, f.replace(/{|}/g, '').trim() + 'u11@test.com null', 'can login with token')

  r = (await graphql(schema, `mutation { logout(token: "${(await graphql(schema, `mutation { loginWith(provider: email, email: "1@test.com", code: "123") ${f} }`)).data.loginWith.token}") }`)).data.logout
  t.equal(r, 1, 'can logout from client')

  r = db.prepare('select * from "user" where email = ?').get('1@test.com')
  t.ok(r.token === null && r.token_ts === null, 'can logout from server')

  r = (await graphql(schema, `mutation { loginWith(provider: email, email: "1@test.com", code: "") ${f} }`))
  t.equal(r.data.loginWith, null, 'cannot login with wrong password')

  r = (await graphql(schema, `mutation { loginWith(provider: email, email: "1@testcom", code: "") ${f} }`))
  t.equal(r.data.loginWith, null, 'cannot login with wrong email')

  r = (await graphql(schema, `mutation { loginWith(provider: Email, email: "1@testcom", code: "") ${f} }`))
  t.ok(r.errors.length > 0, 'cannot login with wrong type: only email, gh or token allowed')

  r = (await graphql(schema, `mutation { loginWith(provider: token, email: "", code: "111") ${f} }`))
  t.equal(r.data.loginWith, null, 'cannot login with wrong token')

  r = await graphql(schema, `mutation { createUserWithEmail(name: "u2", email: "1@test.com", pw: "123") ${f} }`)
  t.ok(/email.*registered/i.test(r.errors[0].message))
  console.log(r)

  t.end()
})


// test('create pins', async t => {
//   let r = (await graphql(schema, `mutation { loginWith(provider: email, email: "1@test.com", code: "123") ${f} }`)).data.loginWith
//   r = await graphql(schema, `mutation { createPin() }`)

// })