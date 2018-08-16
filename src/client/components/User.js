import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'

import isEmail from 'validator/lib/isEmail'

// import {
// } from '~/client/apolloClient'

import {
} from './common'

export const userPropTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
    email: PropTypes.string,
    gh: PropTypes.number,
    gh_name: PropTypes.string,
    token: PropTypes.string.isRequired,
  })
}

export default class User extends PureComponent {
  static propTypes = userPropTypes
  render() {
    const { user } = this.props
    return (
      <div className="flex flex-column mx-auto" style={{ maxWidth: '40rem' }}>
        {user ? <Logout user={user} /> : <Fragment><Login /><Signup /></Fragment>}
      </div>
    )
  }
}

class Login extends PureComponent {
  render() {
    return <Fragment>
      <h3 className="center">Login</h3>
      <a
        className="flex self-center p1 border rounded items-center pointer text-decoration-none"
        href="https://github.com/login/oauth/authorize?"
      >
        {Octocat} Login with GitHub
      </a>
      <span className="silver">OR</span>
    </Fragment>
  }
}
class Signup extends PureComponent {
  render() {
    return <Fragment>
      <h3 className="center">Sign up</h3>
    </Fragment>
  }
}
class Logout extends PureComponent {
  render() {
    return null
  }
}

const Octocat = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Github"
    role="img"
    viewBox="0 0 512 512"
    width="32"
    height="32"
  >
    <rect
      width="512"
      height="512"
      rx="15%"
      fill="#fff"
    />
    <path
      fill="#000"
      d="M335 499c14 0 12 17 12 17H165s-2-17 12-17c13 0 16-6 16-12l-1-50c-71 16-86-28-86-28-12-30-28-37-28-37-24-16 1-16 1-16 26 2 40 26 40 26 22 39 59 28 74 22 2-17 9-28 16-35-57-6-116-28-116-126 0-28 10-51 26-69-3-6-11-32 3-67 0 0 21-7 70 26 42-12 86-12 128 0 49-33 70-26 70-26 14 35 6 61 3 67 16 18 26 41 26 69 0 98-60 120-117 126 10 8 18 24 18 48l-1 70c0 6 3 12 16 12z"
    />
  </svg>
)
