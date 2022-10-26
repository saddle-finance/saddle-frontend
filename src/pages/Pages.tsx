import React, { lazy } from "react"
import { Redirect, Route, Switch } from "react-router-dom"

import { ChainId } from "../constants"
import CoinbasePayTest from "./CoinbasePayTest"
import { useActiveWeb3React } from "../hooks"

const CreatePool = lazy(() => import("./CreatePool"))
const Deposit = lazy(() => import("./Deposit"))
const Farm = lazy(() => import("./Farm/Farm"))
const Pools = lazy(() =>
  import("./Pools").then(({ Pools }) => ({ default: Pools })),
)
const Risk = lazy(() =>
  import("./Risk").then(({ Risk }) => ({ default: Risk })),
)
const Swap = lazy(() =>
  import("./Swap").then(({ Swap }) => ({ default: Swap })),
)
const VeSDL = lazy(() =>
  import("./VeSDL").then(({ VeSDL }) => ({ default: VeSDL })),
)
const VestingClaim = lazy(() => import("./VestingClaim"))
const Withdraw = lazy(() => import("./Withdraw"))

export default function Pages() {
  const { chainId } = useActiveWeb3React()

  return (
    <Switch>
      <Route exact path="/" component={Swap} />
      <Route exact path="/pools" component={Pools} />
      <Route exact path={`/pools/:poolName/deposit`} component={Deposit} />
      <Route exact path={`/pools/:poolName/withdraw`} component={Withdraw} />
      <Redirect from="/pools/:route/:action" to="/pools" />
      <Route exact path="/pools/create">
        {chainId && [ChainId.MAINNET, ChainId.HARDHAT].includes(chainId) ? (
          <CreatePool />
        ) : (
          <Redirect to="/pools" />
        )}
      </Route>
      <Route exact path="/risk" component={Risk} />
      <Route exact path="/vesting-claim" component={VestingClaim} />
      <Route exact path="/farm" component={Farm} />
      <Route exact path="/vesdl" component={VeSDL} />
      <Route exact path="/coinbase-pay-test" component={CoinbasePayTest} />
    </Switch>
  )
}
