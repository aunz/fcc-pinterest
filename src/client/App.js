import React, { Component, Fragment } from 'react'
import { Switch, Route, Redirect, withRouter } from 'react-router'
import { Query } from 'react-apollo'

import './styles/index.css'

import { LOCAL_USER } from './apolloClient'

import Header from './components/Header'
import Pins from './components/Home'
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
              <Route exact path="/" component={Pins} />
              <Route path="/user" render={() => loading ? LoadingFull : <User loggedIn={loggedIn} />} />
              <Route exact path="/u/:id" render={route => <Pins {...route} user={user} />} />
              {loggedIn && <Route path="/addPin" render={() => <AddPin token={user.token} />} />}
            </Switch>
          </Fragment>
        }}
      </Query>
    )
  }
}

export default withRouter(App)
