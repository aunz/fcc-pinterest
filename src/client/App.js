import React, { Component, Fragment } from 'react'
import { Switch, Route, Redirect, withRouter } from 'react-router'
import { Query } from 'react-apollo'

import './styles/index.css'

import { LOCAL_USER } from './apolloClient'

import Header from './components/Header'
import User from './components/User'

class App extends Component {
  render() {
    return (
      <Query query={LOCAL_USER}>
        {({ data }) => {
          const user = data && data.localUser
          return <Fragment>
            <Header loggedIn={!!user} />
            <Switch>
              <Route path='/user' render={() => <User user={user} />} />
            </Switch>
          </Fragment>
        }}
      </Query>
    )
  }
}

export default withRouter(App)
