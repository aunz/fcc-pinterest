import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'

import isEmail from 'validator/lib/isEmail'

import {
  CREATE_USER, LOG_IN,
} from '~/client/apolloClient'

import {
  Loading,
  ErrorMessage,
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
      <div className="flex flex-column mx-auto center" style={{ maxWidth: '20rem' }}>
        {user ? <Logout user={user} /> : <Fragment><Login /><Signup /></Fragment>}
      </div>
    )
  }
}

class Login extends PureComponent {
  render() {
    return <Mutation mutation={LOG_IN}>
      {(mutate, { loading }) => {
        return <Fragment>
          <LoginWithGH />
          <span className="m2 bold silver ">OR</span>
          <LoginWithEmail mutate={mutate} loading={loading} />
          <hr className="mt3" style={{ width: '100%' }} />
        </Fragment>
      }}
    </Mutation>
  }
}

class LoginWithGH extends PureComponent {
  render() {
    return (
      <a
        className="mt3 flex p1 border border-silver rounded items-center justify-center pointer text-decoration-none"
        href="https://github.com/login/oauth/authorize?"
      >
        {Octocat} Login with GitHub
      </a>
    )
  }
}

const inputClass = require('./common').inputClass + ' border border-silver'
const buttonClass = require('./common').buttonClass + ' mt1 border '
const borderRadius = '6px'

class LoginWithEmail extends PureComponent {
  static propTypes = {
    mutate: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
  }
  state = {
    email: '1@test.com',
    password: '123',
    error: null,
    errorMessage: '',
  }
  onInput = e => {
    const { name, value } = e.currentTarget
    this.setState({
      [name]: value,
      error: null,
      errorMessage: '',
    })
  }
  onSubmit = e => {
    e.preventDefault()
    const { email, password } = this.state
    this.setState({ error: null, errorMessage: '' })
    this.props.mutate({
      variables: {
        provider: 'email',
        email,
        code: password
      }
    }).catch(error => {
      const errorMessage = /unauthorize/i.test(error.message)
        ? 'Email or password incorrect'
        : 'Something went wrong'
      this.setState({ error, errorMessage })
    })
  }
  render() {
    const { email, password, error, errorMessage } = this.state
    const { loading } = this.props
    return (
      <form className="flex flex-column " onSubmit={this.onSubmit}>
        <input
          className={inputClass}
          style={{ borderRadius: `${borderRadius} ${borderRadius} 0 0` }}
          placeholder="email"
          name="email"
          onInput={this.onInput}
        />
        <input
          className={inputClass}
          style={{ borderTop: 'none', borderRadius: `0 0 ${borderRadius} ${borderRadius}` }}
          type="password"
          placeholder="password"
          name="password"
          onInput={this.onInput}
        />
        {loading
          ? <Loading className={buttonClass + ' border-white'} />
          : <input
            className={buttonClass + ' border-silver ' + (error ? 'shake' : '')}
            type="submit"
            disabled={error || password.trim().length < 3 || !isEmail(email)}
            value="Login"
          />
        }
        {errorMessage && <ErrorMessage error={errorMessage} />}
      </form>
    )
  }
}

class Signup extends PureComponent {
  state = {
    name: '',
    email: '1@test.com',
    password1: '123',
    password2: '123',
    error: null,
    errorMessage: '',
  }
  onInput = e => {
    const { name, value } = e.currentTarget
    this.setState({
      [name]: value,
      error: null,
      errorMessage: '',
    })
  }
  onSubmit = e => {
    e.preventDefault()
    const { name, email, password1: pw } = this.state
    this.mutate({
      variables: { name, email, pw }
    }).catch(error => {
      const errorMessage = /register/i.test(error.message)
        ? 'The email has been registered'
        : 'Something went wrong'
      this.setState({ error, errorMessage })
    })
  }
  render() {
    const { email, password1, password2, error, errorMessage } = this.state
    const passwordMismatched = password1 !== password2 || password1.length < 3
    return <form className="flex flex-column " onSubmit={this.onSubmit}>
      <small className="silver italic">Don't have an account? </small>
      <h3 className="mt1">Sign up</h3>
      <input
        className={inputClass}
        style={{ borderRadius: `${borderRadius} ${borderRadius} 0 0`, }}
        placeholder="name"
        type="text"
        name="name"
        onInput={this.onInput}
      />
      <input
        className={inputClass}
        style={{ borderTop: 'none' }}
        placeholder="email"
        type="email"
        name="email"
        onInput={this.onInput}
      />
      <input
        className={inputClass}
        style={{ borderTop: 'none', borderRadius: 0 }}
        type="password"
        placeholder="password"
        name="password1"
        onInput={this.onInput}
      />
      <input
        className={inputClass}
        style={{ borderTop: 'none', borderRadius: `0 0 ${borderRadius} ${borderRadius}`, }}
        type="password"
        placeholder="re-enter password"
        name="password2"
        onInput={this.onInput}
      />
      <Mutation
        mutation={CREATE_USER}
      >
        {(mutate, { loading }) => {
          if (loading) return <Loading className={buttonClass + ' border-white'} />
          return <Fragment>
            <input
              className={buttonClass + ' border-silver ' + (error ? 'shake' : '')}
              type="submit"
              disabled={error || passwordMismatched || !isEmail(email)}
              value="Sign up"
              onClick={() => { this.mutate = mutate }} // pass the mutate to onSubmit
            />
            {errorMessage && <ErrorMessage error={errorMessage} />}
          </Fragment>
        }}
      </Mutation>
      {password2.length > 2 && passwordMismatched && <ErrorMessage error={'Passwords do not match'} />}
    </form>
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
