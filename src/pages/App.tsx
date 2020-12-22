import "../styles/global.scss"

import React, { ReactElement, Suspense, useEffect } from "react"
import { Route, Switch } from "react-router-dom"

import { AppDispatch } from "../state"
import DepositBTC from "./DepositBTC"
import Risk from "./Risk"
import SwapBTC from "./SwapBTC"
import ToastsProvider from "../providers/ToastsProvider"
import Web3ReactManager from "../components/Web3ReactManager"
import WithdrawBTC from "./WithdrawBTC"
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
            <Route exact path="/" component={SwapBTC} />
            <Route exact path="/deposit" component={DepositBTC} />
            <Route exact path="/withdraw" component={WithdrawBTC} />
            <Route exact path="/risk" component={Risk} />
          </Switch>
        </ToastsProvider>
      </Web3ReactManager>
    </Suspense>
  )
}
