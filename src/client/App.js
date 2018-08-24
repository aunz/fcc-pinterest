import React, { Component, Fragment } from 'react'
import { Switch, Route, Redirect, withRouter } from 'react-router'
import { Query } from 'react-apollo'

import './styles/index.css'

import { LOCAL_USER } from './apolloClient'

import Header from './components/Header'
import Home from './components/Home'
import User from './components/User'
import AddPin from './components/AddPin'
import { LoadingFull } from './components/common'

class App extends Component {
  render() {
    return (
      <Query query={LOCAL_USER}>
        {({ data, loading }) => {
          const user = data && data.localUser
          const loggedIn = !!user
          return <Fragment>
            <Header loggedIn={loggedIn} />
            <Switch>
              <Route exact path="/" render={() => <Home />} />
              <Route path="/user" render={() => loading ? LoadingFull : <User loggedIn={loggedIn} />} />
              {loggedIn && <Route path="/addPin" render={() => <AddPin token={user.token} />} />}
            </Switch>
          </Fragment>
        }}
      </Query>
    )
  }
}

export default withRouter(App)
