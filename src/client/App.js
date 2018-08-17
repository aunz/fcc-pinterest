import React, { Component, Fragment } from 'react'
import { Switch, Route, Redirect, withRouter } from 'react-router'
import { Query } from 'react-apollo'

import './styles/index.css'

import { LOCAL_USER } from './apolloClient'

import Header from './components/Header'
import User from './components/User'
import { Loading } from './components/common'

class App extends Component {
  render() {
    return (
      <Query query={LOCAL_USER}>
        {({ data, loading }) => {
          const user = data && data.localUser
          return <Fragment>
            <Header loggedIn={!!user} />
            <Switch>
              <Route path="/user" render={() => <User user={user} />} />
            </Switch>
            {loading && <div className="fixed h1" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}><Loading /></div>}
          </Fragment>
        }}
      </Query>
    )
  }
}

export default withRouter(App)
