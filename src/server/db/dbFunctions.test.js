import test from 'tape'
import './createTable/createTable'
import db from './sqlite'
import {
  createUser, getUserWithPW, updateUser, getAndUpdateUserFromToken,
  
} from './dbFunctions'

const s = { skip: true } // eslint-disable-line

test('Create users', async t => {
  
  t.end()
})


