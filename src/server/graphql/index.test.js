import test from 'tape'
import { graphql } from 'graphql'

import { schema } from './index'
import db from '~/server/db/sqlite'

db.exec(require('~/server/db/createTable/createTable.sql'))

// graphql(schema, query)

const s = { skip: true } // eslint-disable-line

test('Init data', async t => {
  t.end()
})
