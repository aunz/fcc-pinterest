import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Query, Mutation } from 'react-apollo'
import Masonry from 'react-masonry-component'

import {
  PINS,
  USER,
} from '~/client/apolloClient'

import {
  Loading,
  LoadingFull,
  ErrorMessage,
  inputClass,
  buttonClass,
  buttonClassBase,
} from './common'

export default class Pins extends PureComponent {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string,
      }).isRequired,
    }).isRequired,
  }
  render() {
    const oriId = this.props.match.params.id
    const uid = +oriId
    if (Number.isNaN(uid)) return <div className="m3 h3 center">The user id <span className="red italic bold">{oriId}</span> is incorrect</div>
    return (
      <Query query={PINS} variables={{ uid }}>
        {({ data, loading }) => {
          if (loading) return LoadingFull
          if (!data.pins || !data.pins.length) return <div className="m3 h3 center">The user <i>{uid}</i> has not created any pin</div>
          const pins = data.pins.map((pin, i) => (
            <Pin
              key={pin.id}
              {...pin}
            />
          ))
          return <Masonry>
            {pins}
          </Masonry>
        }}
      </Query>
    )
  }
}

class Pin extends PureComponent {
  static propTypes = {
    id: PropTypes.number.isRequired,
    uid: PropTypes.number.isRequired,
    title: PropTypes.string,
    url: PropTypes.string.isRequired,
    style: PropTypes.object,
  }

  render() {
    const { title, url, uid } = this.props
    return <div className="flex flex-column m1 mb2" style={{ width: '15rem' }}>
      <img
        src={url}
        className="mb1 col-12 rounded1"
        onError={onError}
      />
      <span>{title}</span>
      <Query query={USER} variables={{ id: uid }}>
        {({ data }) => {
          if (data && data.user) {
            const name = data.user.name || data.user.gh_name || 'Mysterion'
            return (
              <span>
                <span className="silver">by </span>
                <Link
                  className="italic text-decoration-none "
                  to={'/u/' + uid}
                >
                  {name}
                </Link>
              </span>
            )
          }
          return null
        }}
      </Query>
    </div>
  }
}

function onError(e) {
  e.currentTarget.src = require('./imageNotFound.jpg')
}
