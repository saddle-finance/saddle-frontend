import React, { ReactElement, Suspense, useEffect } from "react"
import { Route, Switch } from "react-router-dom"

import { AppDispatch } from "../state"
import DepositBTC from "./DepositBTC"
import DepositUSD from "./DepositUSD"
import Home from "./Home"
import Pool from "./Pool"
import PoolBTC from "./PoolBTC"
import PoolUSD from "./PoolUSD"
import Risk from "./Risk"
import SwapBTC from "./SwapBTC"
import SwapUSD from "./SwapUSD"
import ToastsProvider from "../providers/ToastsProvider"
import Web3ReactManager from "../components/Web3ReactManager"
import WithdrawUSD from "./WithdrawUSD"
import fetchGasPrices from "../utils/updateGasPrices"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
import { useDispatch } from "react-redux"

export default function App(): ReactElement {
  const dispatch = useDispatch<AppDispatch>()

  // TODO: figure out how frequently we want to update gas prices and where
  useEffect(() => {
    fetchGasPrices(dispatch)
    fetchTokenPricesUSD(dispatch)
  }, [dispatch])

  return (
    <Suspense fallback={null}>
      <Web3ReactManager>
        <ToastsProvider>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/swap/btc" component={SwapBTC} />
            <Route exact path="/swap/usd" component={SwapUSD} />
            <Route exact path="/pool" component={Pool} />
            <Route exact path="/pool/btc" component={PoolBTC} />
            <Route exact path="/pool/usd" component={PoolUSD} />
            <Route exact path="/pool/btc/deposit" component={DepositBTC} />
            <Route exact path="/pool/usd/deposit" component={DepositUSD} />
            <Route exact path="/pool/usd/withdraw" component={WithdrawUSD} />
            <Route exact path="/risk" component={Risk} />
          </Switch>
        </ToastsProvider>
      </Web3ReactManager>
    </Suspense>
  )
}
