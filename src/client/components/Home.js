import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation } from 'react-apollo'

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
    return <Query query={PINS}>
      {({ data, loading }) => {
        if (loading) return LoadingFull
        // return null
        return (data.pins || []).map(pin => (
          <Pin
            key={pin.id}
            {...pin}
          />
        ))
      }}
    </Query>
  }
}

class Pin extends PureComponent {
  static propTypes = {
    id: PropTypes.number.isRequired,
    uid: PropTypes.number.isRequired,
    title: PropTypes.string,
    url: PropTypes.string.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
  }

  render() {
    const { title, url, style } = this.props
    return <div className="m1">
      <img
        src={url}
        className="mb1 block col-12 rounded1"
        style={style}
        onError={e => { e.currentTarget.src = require('./imageNotFound.jpg') }}
      />
      <span>{title}</span>
    </div>
  }
}
