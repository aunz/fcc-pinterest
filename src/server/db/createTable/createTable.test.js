import test from 'tape'
import db from '../sqlite'
import './createTable'

const s = { skip: true } // eslint-disable-line

test('init', t => {
  // create user
  db.prepare('insert into "user" (id) values (?)').run(1)
  db.prepare('insert into "user" (id, email) values (?, ?)').run(2, 't@test.com')
  db.prepare('insert into "user" (id, gh) values (?, ?)').run(3, 123)
  db.prepare('insert into "user" (id, gh_name) values (?, ?)').run(4, 'gh1')

  // create pin
  db.prepare('insert into pin (id, uid, title, url) values (?, ?, ?, ?)').run(1, 1, '', 'url1')
  db.prepare('insert into pin (id, uid, title, url) values (?, ?, ?, ?)').run(2, 1, null, 'url2')
  db.prepare('insert into pin (id, uid, title, url) values (?, ?, ?, ?)').run(3, 2, '', 'url3')
  db.prepare('insert into pin (id, uid, title, url) values (?, ?, ?, ?)').run(4, 2, null, 'url4')
  db.prepare('insert into pin (id, uid, title, url) values (?, ?, ?, ?)').run(5, 3, '', 'url5')
  db.prepare('insert into pin (id, uid, title, url) values (?, ?, ?, ?)').run(6, 3, null, 'url6')

  t.end()
})

test('constrain', t => {
  t.throw(() => {
    db.prepare('insert into "user" (id, email) values (?, ?)').run(100, 'T@Test.COM')
  }, /unique/i, 'email has to be unique')

  t.throw(() => {
    db.prepare('insert into "user" (id, email) values (?, ?)').run(100, '   t@t  ')
  }, /unique/i, 'email has to match email regexp')

  t.throw(() => {
    db.prepare('insert into "user" (id, email) values (?, ?)').run(100, '   t.t.com  ')
  }, /unique/i, 'email has to match email regexp')

  t.throw(() => {
    db.prepare('insert into "user" (id, gh) values (?, ?, ?)').run(100, 123)
  }, /unique/i, 'gh id has to be unique')

  t.throw(() => {
    db.prepare('insert into "user" (id, gh_name) values (?, ?, ?)').run(100, '  GH1  ')
  }, /unique/i, 'gh_name has to be unique')

  t.throw(() => {
    db.prepare('insert into "user" (id, gh_name) values (?, ?)').run(100, '  gh ')
  }, /unique/i, 'gh_name is not long enough')

  t.throw(() => {
    db.prepare('insert into pin (id, url) values (?, ?)').run(100, 'u1')
  }, /unique/i, 'uid is required for pin')

  t.throw(() => {
    db.prepare('insert into pin (id, uid) values (?, ?)').run(100, 100)
  }, /unique/i, 'uid needs to references "user"')

  t.throw(() => {
    db.prepare('insert into pin (id, uid) values (?, ?)').run(100, 1)
  }, /unique/i, 'url cannot be null')
  t.end()
})
