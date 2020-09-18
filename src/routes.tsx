import React from "react"
import { Switch, Route, BrowserRouter as Router } from "react-router-dom"

import App from "./App"
import Home from "./pages/Home"
import Pool from "./pages/Pool"

export const Routes = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/home" component={Home} />
      <Route path="/swap/btc" component={App} />
      <Route path="/swap/usd" component={App} />
      <Route path="/pool" component={Pool} />
    </Switch>
  </Router>
)
