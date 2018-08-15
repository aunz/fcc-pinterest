import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

export default class Header extends PureComponent {
  static propTypes = {
    loggedIn: PropTypes.bool
  }
  render() {
    const { loggedIn } = this.props
    const linkClass = 'white decoration-none m1 '
    return (
      <div className="flex h3 bg-color1 white justify-center">
        <Link
          to="/"
          className={linkClass + 'icon-home'}
        />
        <Link
          to={'/' + loggedIn ? 'user' : 'login'}
          className={linkClass + 'icon-user'}
        />
        {loggedIn && (
          <Fragment>
            <Link to="/addBook" className={linkClass + 'icon-plus'} />
            <Link to="/myBook" className={linkClass + 'icon-book'} />
            <Link to="/myRequest" className={linkClass + 'icon-comment'} />
          </Fragment>
        )}
      </div>
    )
  }
}
