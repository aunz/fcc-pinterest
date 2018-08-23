import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'

export default class Header extends PureComponent {
  render() {
    const linkClass = ' m1 text-decoration-none white outline-none '
    return (
      <div className="flex h3 bg-color1 white justify-center">
        <Link
          to="/"
          className={linkClass + 'icon-home'}
        />
        <Link
          to="user"
          className={linkClass + 'icon-user'}
        />
      </div>
    )
  }
}
