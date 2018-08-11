import { stringify } from 'querystring'
import fetch from 'node-fetch'

import 'dotenv/config'
import { errOAuth } from '~/server/errors'

if (!process.env.GH_CLIENT_ID || !process.env.GH_CLIENT_SECRET) throw new Error('Github Client ID & Secret are required')

const urlCode = 'https://github.com/login/oauth/access_token?' + stringify({
  client_id: process.env.GH_CLIENT_ID,
  client_secret: process.env.GH_CLIENT_SECRET,
}) + '&code='

const urlToken = 'https://api.github.com/user?access_token='

export default async function authWithGitHub(code) {
  if (process.env.NODE_ENV === 'development' && /^test/i.test(code)) return { id: code, gh_name: 'gh_name' + code }

  const access_token_response = await fetch(urlCode + code, {
    method: 'post',
    headers: { Accept: 'application/json' },
  }).then(body => body.json()) // the body.status === 200 even there is an error in the authorization code
    .catch(e => e)

  if (access_token_response instanceof Error) throw errOAuth('GitHub')

  if (access_token_response.error) {
    if (process.env.NODE_ENV === 'development') console.log(access_token_response.error)
    throw errOAuth('GitHub: cannot retrieve access token', access_token_response.error)
  }

  const resource_response = await fetch(urlToken + access_token_response.access_token)
  if (!resource_response.ok) throw errOAuth('GitHub: access token invalid')

  const user = await resource_response.json()
  if (!user.id) throw errOAuth('GitHub: cannot retrieve user id') // something wrong

  return user
}
