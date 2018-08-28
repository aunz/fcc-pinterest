import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation } from 'react-apollo'
import Masonry from 'react-masonry-component'

import {
  PINS,
} from '~/client/apolloClient'

import {
  Loading,
  LoadingFull,
  ErrorMessage,
  inputClass,
  buttonClass,
  buttonClassBase,
} from './common'

export default class Home extends PureComponent {
  render() {
    return (
      <Query query={PINS}>
        {({ data, loading }) => {
          if (loading) return LoadingFull
          const pins = (data.pins || []).map((pin, i) => (
            <Pin
              key={pin.id}
              {...pin}
              i={i}
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
    const { title, url } = this.props
    return <div className="m1" style={{ width: '15rem' }}>
      <img
        src={url}
        className="mb1 block col-12 rounded1"
        onError={onError}
      />
      <span>{this.props.i} {title}</span>
    </div>
  }
}

function onError(e) {
  e.currentTarget.src = require('./imageNotFound.jpg')
}
