import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Query, Mutation } from 'react-apollo'
import Masonry from 'react-masonry-component'

import {
  PINS,
  USER,
  LOCAL_USER,
  DEL_PIN,
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
    user: PropTypes.shape({
      id: PropTypes.number
    })
  }
  render() {
    const oriId = this.props.match.params.id
    if (oriId && Number.isNaN(+oriId)) return <div className="m3 h3 center">The user id <span className="red italic bold">{oriId}</span> is incorrect</div>
    const uid = ~~oriId
    return (
      <Query query={PINS} variables={{ uid }}>
        {({ data, loading }) => {
          if (loading) return LoadingFull
          if (!data.pins || !data.pins.length) return <div className="m3 h3 center">The user <i>{uid}</i> has not created any pin</div>
          const ownerMode = this.props.user && this.props.user.id === uid // when true, allow Pin to be deleted
          const pins = data.pins.map((pin, i) => (
            <Pin
              key={pin.id}
              {...pin}
              ownerMode={ownerMode}
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
    ownerMode: PropTypes.bool,
  }
  state = {
    prompt: false
  }
  togglePrompt = () => {
    this.setState({ prompt: !this.state.prompt })
  }
  render() {
    const { title, url, id, uid, ownerMode } = this.props
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
            const className = buttonClassBase + ' border-none '
            const { prompt } = this.state
            if (ownerMode) return <Fragment>
              <button
                className={className + ' ml-auto  icon-trash-empty align-left'}
                onClick={this.togglePrompt}
              />
              {prompt && <Mutation mutation={DEL_PIN} >
                {(mutate, { loading, error, client }) => {
                  const style = { fontFamily: 'fontello' }
                  return <div className="absolute flex flex-column justify-center items-center center trbl0 bg-fff-o">
                    <span>Delete the pin?</span>
                    {loading ? <Loading /> : <div>
                      <button
                        className={className + 'mr2'}
                        onClick={() => {
                          const user = client.readQuery({ query: LOCAL_USER }).localUser
                          mutate({ variables: { token: user.token, id }, fetchPolicy: 'no-cache' })
                            .then(({ data: { delPin } }) => {
                              if (delPin) {
                                // update the client data where uid is set
                                const options = { query: PINS, variables: { uid } }
                                options.data = {
                                  pins: client.readQuery(options).pins.filter(pin => pin.id !== id)
                                }
                                client.writeQuery(options)

                                // upddate all the pins
                                options.variables = {}
                                try { // try here as the pins without uid may have not been fetched
                                  options.data = {
                                    pins: client.readQuery(options).pins.filter(pin => pin.id !== id)
                                  }
                                  client.writeQuery(options)
                                } catch (e) {}
                              }
                            })
                        }}
                        style={style}
                      >
                        &#xe806;
                      </button>
                      <button className={className} onClick={this.togglePrompt} style={style}>&#xe807;</button>
                    </div>}
                    {error && <ErrorMessage error="Cannot delete the pin" />}
                  </div>
                }}
              </Mutation>}
            </Fragment>
            return <span className="silver">
              by <Link className="italic text-decoration-none " to={'/u/' + uid} >{name}</Link>
            </span>
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
