import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import { Redirect } from 'react-router'

import isURL from 'validator/lib/isURL'

import {
  CREATE_PIN,
  PINS,
  LOCAL_USER,
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
  state = {
    url: '', // http://127.0.0.1:3000/tmp/1.jpg
    title: '',
    description: '',
    imageError: false,
  }
  componentWillUnmount() { this.unmounted = true }
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
    const { url, title, description, imageError, submitted } = this.state
    if (submitted) return <Redirect to="/" />
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
        style={{ minWidth, borderTop: 'none', }}
        name="title"
        onChange={this.onChange}
      />
      <input
        className={inputClass}
        placeholder="desription (optional)"
        style={{ minWidth, borderTop: 'none' }}
        name="desription"
        onChange={this.onChange}
      />
      <div className="my2 p1 flex flex-column items-center" style={{ maxWidth: '100vw' }} >
        {url && <Fragment>
          <img
            src={url}
            style={{ maxWidth: '100%' }}
            onError={this.onError}
          />
          <i className="mt1">{title}</i>
        </Fragment>}
      </div>
      <Mutation mutation={CREATE_PIN} key={url}>
        {(mutate, { loading, error, client }) => {
          if (loading) return <Loading className={buttonClassBase} />
          return <Fragment>
            <button
              className={buttonClass + ' bold border-color1d'}
              disabled={imageError || !url || error}
              onClick={() => {
                const user = client.readQuery({ query: LOCAL_USER }).localUser
                mutate({
                  variables: { url, title, description, token: user.token },
                  fetchPolicy: 'no-cache'
                }).then(({ data }) => {
                  const uid = user.id
                  const pin = {
                    id: data.createPin,
                    ts: ~~(Date.now() / 1000),
                    uid,
                    url,
                    title,
                    description,
                    __typename: 'pin'
                  }
                  try {
                    const pins = client.readQuery({ query: PINS }).pins
                    pins.unshift(pin)
                    client.writeQuery({
                      query: PINS,
                      data: { pins }
                    })
                  } catch (e) {}
                  try {
                    const pins = client.readQuery({ query: PINS, variables: { uid } }).pins
                    pins.unshift(pin)
                    client.writeQuery({
                      query: PINS,
                      variables: { uid },
                      data: { pins }
                    })
                  } catch (e) {}
                  this.unmounted || this.setState({ submitted: true })
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
