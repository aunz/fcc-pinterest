import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import { Redirect } from 'react-router'

import isURL from 'validator/lib/isURL'

import {
  CREATE_PIN,
} from '~/client/apolloClient'

import {
  Loading,
  ErrorMessage,
  inputClass,
  buttonClass,
  buttonClassBase,
} from './common'

const minWidth = '20rem'

export default class AddPin extends PureComponent {
  static propTypes = { token: PropTypes.string.isRequired }
  state = {
    title: '',
    url: '', // http://127.0.0.1:3000/tmp/1.jpg
    imageError: false,
  }
  onChange = e => {
    const { name, value } = e.currentTarget
    let { imageError } = this.state
    if (name === 'url') {
      if (!isURL(value)) return
      imageError = false
    }
    this.setState({ [name]: value, imageError })
  }
  onError = () => {
    this.setState({
      url: require('./imageNotFound.jpg'),
      imageError: true,
    })
  }
  render() {
    const { title, url, imageError } = this.state
    return <div className="flex flex-column items-center">
      <h3>Add a pin</h3>
      <input
        className={inputClass}
        placeholder="url"
        style={{ minWidth }}
        name="url"
        onChange={this.onChange}
      />
      <input
        className={inputClass}
        placeholder="title (optional)"
        style={{ minWidth, borderTop: 'none' }}
        name="title"
        onChange={this.onChange}
      />
      {url && (
        <div className="my2 p1 flex flex-column items-center" style={{ maxWidth: '100vw' }} >
          <img
            src={url}
            style={{ maxWidth: '100%' }}
            onError={this.onError}
          />
          <i className="mt1">{title}</i>
        </div>
      )}
      <Mutation mutation={CREATE_PIN} key={url}>
        {(mutate, { loading, error }) => {
          if (loading) return <Loading className={buttonClassBase} />
          return <Fragment>
            <button
              className={buttonClass + ' bold border-color1d'}
              disabled={imageError || !url || error}
              onClick={() => {
                mutate({
                  variables: { title, url, token: this.props.token },
                  fetchPolicy: 'no-cache'
                })
              }}
            >
              Pin it
            </button>
            {error && <ErrorMessage error={'Something went wrong!'} />}
          </Fragment>
        }}
      </Mutation>
    </div>
  }
}
