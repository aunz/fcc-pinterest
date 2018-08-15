import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

export default class Header extends PureComponent {
  static propTypes = {
    loggedIn: PropTypes.bool
  }
  render() {
    const linkClass = ' m1 text-decoration-none white '
    return (
      <div className='flex h3 bg-color1 white justify-center'>
        <Link
          to='/'
          className={linkClass + 'icon-home'}
        />
        <Link
          to='user'
          className={linkClass + 'icon-user'}
        />
      </div>
    )
  }
}
