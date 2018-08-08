import test from 'tape'
import db from '../sqlite'
import './createTable'

const s = { skip: true } // eslint-disable-line

test('init', t => {
  // create users
  db.prepare('insert into "user" (id, email, pw) values (?, ?, ?)').run(1, 'e1', 'p')
  db.prepare('insert into "user" (id, email, pw) values (?, ?, ?)').run(2, 'e2', 'p')
  db.prepare('insert into "user" (id, email, pw) values (?, ?, ?)').run(3, 'e3', 'p')
  db.prepare('insert into "user" (id, email, pw) values (?, ?, ?)').run(4, 'e4', 'p')
  db.prepare('insert into "user" (id, email, pw) values (?, ?, ?)').run(5, 'e5', 'p')
  db.prepare('insert into "user" (id, email, pw) values (?, ?, ?)').run(6, 'e6', 'p')

  t.end()
})
