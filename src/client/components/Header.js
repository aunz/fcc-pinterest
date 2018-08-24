import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

export default class Header extends PureComponent {
  static propTypes = {
    loggedIn: PropTypes.bool,
  }
  render() {
    const linkClass = ' m1 text-decoration-none white outline-none '
    return (
      <div className="flex h3 bg-color1 white justify-center">
        <Link
          to="/"
          className={linkClass + 'icon-home'}
        />
        {this.props.loggedIn && (
          <Link
            to="/addPin"
            className={linkClass + 'icon-plus '}
          />
        )}
        <Link
          to="user"
          className={linkClass + 'icon-user'}
        />
      </div>
    )
  }
}
