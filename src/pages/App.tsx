import React from "react"
import { Switch, Route } from "react-router-dom"

import Web3ReactManager from "../components/Web3ReactManager"

import Home from "./Home"
import Pool from "./Pool"
import PoolUSD from "./PoolUSD"
import PoolBTC from "./PoolBTC"
import SwapUSD from "./SwapUSD"
import SwapBTC from "./SwapBTC"
import DepositUSD from "./DepositUSD"
import DepositBTC from "./DepositBTC"

export default function App() {
  return (
    <Web3ReactManager>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/swap/btc" component={SwapBTC} />
        <Route exact path="/swap/usd" component={SwapUSD} />
        <Route exact path="/pool" component={Pool} />
        <Route exact path="/pool/btc" component={PoolBTC} />
        <Route exact path="/pool/usd" component={PoolUSD} />
        <Route exact path="/pool/btc/deposit" component={DepositBTC} />
        <Route exact path="/pool/usd/deposit" component={DepositUSD} />
      </Switch>
    </Web3ReactManager>
  )
}
