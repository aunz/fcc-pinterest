import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'

// import isEmail from 'validator/lib/isEmail'

// import {
  
// } from '~/client/apolloClient'

// import {
//   buttonClass,
//   buttonFlatClass,
//   inputClass,
//   EL,
// } from './common'

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
      <div className='flex flex-column mx-auto' style={{ maxWidth: '40rem' }}>
        {user ? <Logout user={user} /> : <Login />}
      </div>
    )
  }
}

class Login extends PureComponent {
  render() {
    return <Fragment>
      <h3 className='center'>Login</h3>
    </Fragment>
  }
}
class Logout extends PureComponent {
  render() {
    return null
  }
}
