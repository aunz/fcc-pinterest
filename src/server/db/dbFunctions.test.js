import test from 'tape'
import './createTable/createTable'
import db from './sqlite'
import {
  createUserWithEmail,
  createUserWithGH,
  getUserWithEmailPW,
  getUserWithId,
  updateUser,
  getAndUpdateUserFromToken,
  deleteToken,
  createPin,

} from './dbFunctions'

const s = { skip: true } // eslint-disable-line

test('Create users', async t => {
  let r = new Array(10).fill(0).map((_, i) => {
    i++
    return createUserWithEmail({
      name: 'U' + i,
      email: 'u' + i + '@test.com',
      pw: '123' + i
    })
  })

  await Promise.all(r)

  r = db.prepare('select * from "user" order by rowid').all()
  t.ok(r[0].id > 10000 && r[1].id >= r[0].id + 10 && r[9].id >= r[8].id + 10 && r[9].id >= r[0].id + 90, `id starts with 10000 and jumps 10 each: ${r[0].id} ~ ${r[9].id}`)

  updateUser(r[0].id, { name: null, token: '123', email: 'u0b@test.com' })
  r = getAndUpdateUserFromToken('123')

  t.ok(r.email === 'u0b@test.com' && r.name === null, 'can get user from token')

  r = await Promise.all([
    getUserWithEmailPW('u2@test.com', '1232'),
    getUserWithEmailPW('u10@test.com', '12310'),
  ])

  t.equal(r[0].token.length, 28, 'has token string of len 28')
  t.equal(
    r.map(el => el.id).join(' '),
    [
      db.prepare('select id from "user" where email = ?').pluck().get('u2@test.com'),
      db.prepare('select id from "user" where email = ?').pluck().get('u10@test.com')
    ].join(' '),
    'can get uid from email and pw'
  )

  r = await createUserWithEmail({ name: '', email: 'u1@test', pw: '123' }).catch(e => e)
  t.ok(/SqliteError: CHECK constraint failed/i.test(r), 'email check constraint')

  r = await createUserWithEmail({ name: '', email: '', pw: '123' }).catch(e => e)
  t.ok(/SqliteError: CHECK constraint failed/i.test(r), 'email check constraint')

  r = await createUserWithEmail({ name: '', email: 'U1@test.com', pw: '123' }).catch(e => e)
  t.ok(/UNIQUE constraint/i.test(r), 'email unique constraint')

  r = await createUserWithEmail({ name: '', email: 'U1@test.com' }).catch(e => e)
  t.ok(/salt/i.test(r), 'need password')

  r = createUserWithGH({ gh: 123, gh_name: 'gh1' })
  r = getUserWithId(r)
  t.deepEqual(r, { id: r.id, name: null, gh_name: 'gh1', gh: 123, email: null }, 'can create user by github')

  t.end()
})
