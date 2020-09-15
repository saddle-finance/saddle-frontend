import React from "react"
import { Switch, Route, BrowserRouter as Router } from "react-router-dom"

import Home from "./pages/Home"
import Pool from "./pages/Pool"

export const Routes = () => (
  <Router>
    <Switch>
      <Route path="/">
        <Home />
      </Route>
      <Route path="/pool">
        <Pool />
      </Route>
    </Switch>
  </Router>
)
