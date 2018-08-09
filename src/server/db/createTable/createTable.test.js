import test from 'tape'
import db from '../sqlite'
import './createTable'

const s = { skip: true } // eslint-disable-line

test('init', t => {
  // create user
  db.prepare('insert into "user" (id, email, pw) values (?, ?, ?)').run(1, 'e1', 'p')
  db.prepare('insert into "user" (id, email, pw) values (?, ?, ?)').run(2, 'e2', 'p')
  db.prepare('insert into "user" (id, email, pw) values (?, ?, ?)').run(3, 'e3', 'p')
  db.prepare('insert into "user" (id, email, pw) values (?, ?, ?)').run(4, 'e4', 'p')
  db.prepare('insert into "user" (id, email, pw) values (?, ?, ?)').run(5, 'e5', 'p')
  db.prepare('insert into "user" (id, email, pw) values (?, ?, ?)').run(6, 'e6', 'p')

  // create pin
  db.prepare('insert into pin (id, uid, name, url) values (?, ?, ?, ?)').run(1, 1, '', 'url1')
  db.prepare('insert into pin (id, uid, name, url) values (?, ?, ?, ?)').run(2, 1, null, 'url2')
  db.prepare('insert into pin (id, uid, name, url) values (?, ?, ?, ?)').run(3, 2, '', 'url3')
  db.prepare('insert into pin (id, uid, name, url) values (?, ?, ?, ?)').run(4, 2, null, 'url4')
  db.prepare('insert into pin (id, uid, name, url) values (?, ?, ?, ?)').run(5, 3, '', 'url5')
  db.prepare('insert into pin (id, uid, name, url) values (?, ?, ?, ?)').run(6, 3, null, 'url6')

  t.end()
})
