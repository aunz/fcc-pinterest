import { randomBytes, createHash } from 'crypto'
import bcrypt from 'bcrypt'
import db from './sqlite'

const userInfo = 'id, ts, name, gh_name, gh, email'

export function createUserWithEmail({ name, email, pw }) {
  return bcrypt.hash(pw, 10)
    .then(hash => createEntity('user', {
      name: (name && name.trim()) || null,
      email,
      pw: hash,
    }))
}

export function createUserWithGH({ gh, gh_name }) {
  const id = db.prepare(`select id from "user" where gh = ?`).pluck().get(gh)
  return id || createEntity('user', { gh, gh_name, })
}

export function getUserWithId(id) {
  return db.prepare(`select ${userInfo} from "user" where id = ?`).get(id)
}

export function getUserWithEmailPW(email, pw) {
  const user = db.prepare(`select ${userInfo}, pw from "user" where email = ?`).get(email)
  if (!user) return Promise.resolve(null)
  return bcrypt.compare(pw, user.pw).then(async res => {
    if (!res) return null
    const bytes = await randomBytes(21)
    const token = bytes.toString('base64')
    updateUser(user.id, { token })
    user.pw = null
    user.token = token
    return user
  })
}

export function updateUser(id, object) {
  if ('token' in object) {
    if (!object.token) { // object.token == undefined, null, 0, ''
      object.token = null
      object.token_ts = null
      object.token_ts_exp = null
    } else {
      const digest = digestToken(object.token)
      object.token = digest.token
      object.token_ts = digest.token_ts
      if (!object.token_ts_exp) object.token_ts_exp = digest.token_ts_exp
    }
  }
  const keys = Object.keys(object)
  if (!keys.length) return 0
  const conds = keys.map(key => `(${key} != $${key} or ${key} is null or $${key} is null)`).join(' or ')

  const sets = keys.map(key => `${key} = $${key}`)
  const stmt = `update "user" set ${sets} where id = ? and (${conds})`
  return db.prepare(stmt).run(id, object).changes
}

export function getAndUpdateUserFromToken(token) { // like findAndModify from mongo
  // get user from the given token
  // if token not found, return undefined
  // if found, check token_ts and exp, if expired, delete the token and return undefined
  // if found and ts conditions met, create new token_ts_exp and return the user

  if (!token) return undefined
  const digest = digestToken(token)
  const user = db.prepare(`select ${userInfo}, token_ts, token_ts_exp from "user" where token = ?`).get(digest.token)
  if (!user) return undefined

  if (user.token_ts_exp < digest.token_ts || user.token_ts + 31536000 < digest.token_ts) {
    updateUser(user.id, { token: null })
    return undefined
  }

  updateUser(user.id, { token_ts_exp: digest.token_ts_exp })
  return user
}

export function delToken(token) {
  if (!token) return undefined
  const digest = digestToken(token)
  return db.prepare('update "user" set token = null, token_ts = null, token_ts_exp = null where token = ?').run(digest.token).changes
}

export function getUser(uid) {
  return db.prepare('select id, name, gh_name from "user" where id = ?').get(uid)
}

export function createPin({ uid, url, title, description }) {
  return createEntity('pin', {
    uid,
    url,
    title: (title && title.trim()) || null,
    description: (description && description.trim()) || null,
  })
}

export function getPins(uid) {
  const where = 'where del is null' + (uid ? ' and uid = ?' : '')
  const stmt = db.prepare(`select id, uid, ts, title, url from pin ${where} order by rowid desc`)
  return uid ? stmt.all(uid) : stmt.all()
}

export function delPin(id, uid) {
  return db.prepare('update pin set del = $now where id = $id and uid = $uid').run({ now: ~~(Date.now() / 1000), id, uid }).changes
}

function createEntity(table, object) {
  // return id String, or throw error
  const keys = Object.keys(object)
  const cols = keys.length === 0 ? '' : ', ' + keys
  const values = keys.length === 0 ? '' : ', ' + keys.map(d => '$' + d)

  const stmt = `
    with cte as (select coalesce((select id from "${table}" order by rowid desc limit 1), 10000)
      + abs(random() % 10) + 10 as id)
    insert into "${table}" (id ${cols})
      values ((select id from cte) ${values})
  `
  const { lastInsertROWID } = db.prepare(stmt).run(object)
  return db.prepare(`select id from "${table}" where rowid = ?`).pluck().get(lastInsertROWID)
}

function digestToken(token) {
  const ts = ~~(Date.now() / 1000)
  return {
    token: createHash('md5').update(token).digest(), // token is stored as hash
    token_ts: ts,
    token_ts_exp: ts + 7776000, // extend 90 more days
  }
}
