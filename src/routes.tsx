import React from "react"
import { Switch, Route, BrowserRouter as Router } from "react-router-dom"

import App from "./App"
import Home from "./pages/Home"
import Pool from "./pages/Pool"
import SwapUSD from "./pages/SwapUSD"
import SwapBTC from "./pages/SwapBTC"
import PoolUSD from "./pages/PoolUSD"
import PoolBTC from "./pages/PoolBTC"
import DepositUSD from "./pages/DepositUSD"
import DepositBTC from "./pages/DepositBTC"

export const Routes = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/home" component={Home} />
      <Route path="/swap/btc" component={SwapBTC} />
      <Route path="/swap/usd" component={SwapUSD} />
      <Route exact path="/pool" component={Pool} />
      <Route exact path="/pool/btc" component={PoolBTC} />
      <Route exact path="/pool/usd" component={PoolUSD} />
      <Route exact path="/pool/btc/deposit" component={DepositBTC} />
      <Route exact path="/pool/usd/deposit" component={DepositUSD} />
    </Switch>
  </Router>
)
