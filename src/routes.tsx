import React from "react"
import { Switch, Route, BrowserRouter as Router } from "react-router-dom"

import App from "./App"
import Home from "./pages/Home"
import Pool from "./pages/Pool"
import SwapUSD from "./pages/SwapUSD"
import SwapBTC from "./pages/SwapBTC"

export const Routes = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/home" component={Home} />
      <Route path="/swap/btc" component={SwapBTC} />
      <Route path="/swap/usd" component={SwapUSD} />
      <Route path="/pool" component={Pool} />
    </Switch>
  </Router>
)
