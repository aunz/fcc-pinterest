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
  delToken,
  createPin,
  getPins,
  delPin,
} from './dbFunctions'

const s = { skip: true } // eslint-disable-line

test('create users', async t => {
  const r = new Array(10).fill(0).map((_, i) => {
    i++
    return createUserWithEmail({
      name: 'U' + i,
      email: 'u' + i + '@test.com',
      pw: '123' + i
    })
  })

  await Promise.all(r)

  t.end()
})

test('test users', s, async t => {
  let r = db.prepare('select * from "user" order by rowid').all()
  t.ok(r[0].id > 10000 && r[1].id >= r[0].id + 10 && r[9].id >= r[8].id + 10 && r[9].id >= r[0].id + 90, `id starts with 10000 and jumps 10 each: ${r[0].id} ~ ${r[9].id}`)

  updateUser(r[0].id, { name: null, token: '123', email: 'u0b@test.com' })
  r = getAndUpdateUserFromToken('123')

  t.ok(r.email === 'u0b@test.com' && r.name === null, 'can get user from token')

  r = db.prepare('select * from "user" where id = ?').get(r.id)
  t.ok(r.token_ts !== null && r.token_ts_exp === r.token_ts + 7776000, 'token_ts and exp are set')

  t.equal(delToken('123'), 1, 'can delete token')
  r = db.prepare('select * from "user" where id = ?').get(r.id)
  t.ok(r.token === null && r.token_ts === null && r.token_ts_exp === null, 'token and ts can be deleted')

  r = await Promise.all([
    getUserWithEmailPW('u2@test.com', '1232'),
    getUserWithEmailPW('u10@test.com', '12310'),
  ])

  t.equal(r[0].token.length + ' ' + r[1].token.length, '28 28', 'has token string of len 28')
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

test('create pins', async t => {
  const uids = db.prepare('select id from "user"').pluck().all()
  new Array(10).fill(0).map((_, i) => {
    return createPin({
      uid: uids[i],
      title: Math.random() > 0.5 ? 'title' + i : null,
      url: 'url' + i + '.com'
    })
  })
  t.end()
})

test('test pins', async t => {
  const uids = db.prepare('select id from "user"').pluck().all()

  let r = db.prepare('select * from pin order by rowid').all()
  t.ok(r[0].id > 10000 && r[1].id >= r[0].id + 10 && r[9].id >= r[8].id + 10 && r[9].id >= r[0].id + 90, `id starts with 10000 and jumps 10 each: ${r[0].id} ~ ${r[9].id}`)

  t.throws(() => {
    createPin({ uid: uids[0] })
  }, /NOT NULL constraint/i, 'url can not be null')

  t.throws(() => {
    createPin({ uid: uids[0], url: '1111com' })
  }, /CHECK constraint/i, 'url is invalid')

  t.throws(() => {
    createPin({ url: 'url1.com' })
  }, /NOT NULL constraint/i, 'uid is required')

  t.throws(() => {
    createPin({ uid: 1, url: 'url1.com' })
  }, /FOREIGN KEY constraint/i, 'uid foreign key')

  t.throws(() => {
    db.prepare('delete from "user" where id = ?').run(uids[0])
  }, /FOREIGN KEY constraint/i, 'cannot delete uid due to foreign key constraint')

  r = getPins()
  t.ok(
    r.length === 10 &&
    r[0].id > r[1].id &&
    r[1].id > r[2].id &&
    r[2].id > r[8].id &&
    r[8].id > r[9].id &&
    Object.keys(r[0]).join(' ') === 'id uid ts title url',
    'can retrieve pins'
  )

  createPin({ uid: uids[0], url: 'u1.com' })
  createPin({ uid: uids[0], url: 'u2.com' })
  createPin({ uid: uids[0], url: 'u3.com' })

  r = getPins(uids[0])
  t.ok(r.length === 4, 'can get pins by uid')

  t.equal(
    [
      delPin(r[0].id, 100),
      delPin(r[0].id, r[0].uid),
      delPin(r[1].id, r[1].uid),
      delPin(r[2].id, r[2].uid),
    ].join(' '),
    '0 1 1 1',
    'can only del pins with correct uid'
  )

  r = getPins(uids[0])
  t.ok(r.length === 1 && r[0].title === 'title0', 'can gel pins, now user 0 has only 1 pin')

  r = getPins()
  t.ok(r.length === 10, 'can del pins, now there are back to 10 total pins')
  // console.log(r)

  t.end()
})
