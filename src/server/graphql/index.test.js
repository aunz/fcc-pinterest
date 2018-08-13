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

test('login/out', s, async t => {
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
  t.ok(/email.*registered/i.test(r.errors[0].message), 'cannot create a new user with the same email')

  r = await graphql(schema, `mutation { createUserWithEmail(name: "u2", email: "1@test.co.m", pw: "123") ${f} }`)
  t.ok(/email.*invalid/i.test(r.errors[0].message), 'cannot create a new user with an invalid email')

  r = await graphql(schema, `mutation { createUserWithEmail(name: "u2", email: "11@test.com", pw: "") ${f} }`)
  t.ok(/password/i.test(r.errors[0].message), 'cannot create a weak password')

  r = (await graphql(schema, `mutation { logout(token: "") }`)).data.logout
  t.ok(r === null, 'nothing happen when logout without a token')

  console.log(r)
  t.end()
})

const p = '{ id ts uid title url }'
test('create pins', async t => {
  const u = (await graphql(schema, `mutation { loginWith(provider: email, email: "1@test.com", code: "123") ${f} }`)).data.loginWith
  await graphql(schema, `mutation {
    p1: createPin(title: "t1", url: "url1.com", token: "${u.token}")
    p2: createPin(title: "t2", url: "url2.com", token: "${u.token}")
    p3: createPin(title: "t3", url: "url3.com", token: "${u.token}")
  }`)

  const r = (await graphql(schema, `query { pins ${p} }`)).data.pins
  t.equal(Object.keys(r[0]).join(' '), p.replace(/{|}/g, '').trim(), 'can get pins')

  t.end()
})

test('pins', async t => {
  const u = (await graphql(schema, `mutation { loginWith(provider: email, email: "1@test.com", code: "123") ${f} }`)).data.loginWith

  let r = await graphql(schema, `mutation { createPin(title: "t1", url: "url1com", token: "${u.token}") }`)
  t.ok(/url/.test(r.errors[0].message), 'cannot create pin with an invalid url')

  r = await graphql(schema, `mutation { createPin(title: "t1", url: "url1.com", token: "123") }`)
  t.ok(/unauthori/i.test(r.errors[0].message), 'cannot create pin without a valid token')

  r = (await graphql(schema, `mutation { createPin(url: "url1.com", token: "${u.token}") }`)).data.createPin
  t.ok(r > 10000, 'can create pin without a title')

  t.ok(/unauthori/i.test(
    (await graphql(schema, `mutation { delPin(id: ${r}, token: "") }`)).errors[0].message
  ), 'cannot del pin without a valid token')

  t.equal(
    (await graphql(schema, `mutation { delPin(id: ${r}, token: "${u.token}") }`)).data.delPin,
    1,
    'can del pin with a valid token'
  )

  r = db.prepare('select * from pin order by rowid ').all()
  t.ok(r.length === 4 && r[0].del === null && r[1].del === null && r[2].del === null && r[3].del !== null, 'db reflects the del')

  r = (await graphql(schema, `query { pins ${p} }`)).data.pins
  t.ok(r.length === 3, 'now only 3 pins')

  await graphql(schema, `mutation { createPin(title: "t2", url: "url2.com", token: "${
    (await graphql(schema, `mutation { loginWith(provider: email, email: "2@test.com", code: "123") ${f} }`)).data.loginWith.token
  }") }`)

  r = (await graphql(schema, `query { pins ${p} }`)).data.pins
  t.ok(r.length === 4, 'now have 4 pins')

  r = (await graphql(schema, `query { pins(uid: ${u.id}) ${p} }`)).data.pins
  t.ok(r.length === 3 && r.every(({ uid }) => uid === u.id), 'can get pins by uid')

  console.log(r)
  t.end()
})
