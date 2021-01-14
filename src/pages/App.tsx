import "../styles/global.scss"

import React, { ReactElement, Suspense, useCallback } from "react"
import { Route, Switch } from "react-router-dom"

import { AppDispatch } from "../state"
import { BLOCK_TIME } from "../constants"
import DepositBTC from "./DepositBTC"
import Risk from "./Risk"
import SwapBTC from "./SwapBTC"
import ToastsProvider from "../providers/ToastsProvider"
import Web3ReactManager from "../components/Web3ReactManager"
import WithdrawBTC from "./WithdrawBTC"
import fetchGasPrices from "../utils/updateGasPrices"
import fetchTokenPricesUSD from "../utils/updateTokenPrices"
import { useDispatch } from "react-redux"
import usePoller from "../hooks/usePoller"

export default function App(): ReactElement {
  const dispatch = useDispatch<AppDispatch>()

  const fetchAndUpdateGasPrice = useCallback(() => {
    fetchGasPrices(dispatch)
  }, [dispatch])
  const fetchAndUpdateTokensPrice = useCallback(() => {
    fetchTokenPricesUSD(dispatch)
  }, [dispatch])
  usePoller(fetchAndUpdateGasPrice, BLOCK_TIME)
  usePoller(fetchAndUpdateTokensPrice, BLOCK_TIME * 3)

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
