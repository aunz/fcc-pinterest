import test from 'tape'
import { graphql } from 'graphql'

import server from './index'
import db from '~/server/db/sqlite'

db.exec(require('~/server/db/createTable/createTable.sql'))

// graphql(schema, query)

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})

const s = { skip: true } // eslint-disable-line

test('Init data', async t => {
  t.end()
})
