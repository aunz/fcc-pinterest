import React, { Component, Fragment } from 'react'
import { Switch, Route, Redirect, withRouter } from 'react-router'
import { Query } from 'react-apollo'

import './styles/index.css'

import { LOCAL_USER } from './apolloClient'

import Header from './components/Header'

class App extends Component {
  render() {
    return (
      <Query query={LOCAL_USER}>
        {() => {
          return <Fragment>
            <Header />
          </Fragment>
        }}
      </Query>
    )
  }
}

export default withRouter(App)
