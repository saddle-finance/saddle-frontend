import React, { lazy } from "react"
import { Redirect, Route, Switch } from "react-router-dom"
import CoinbasePayTest from "./CoinbasePayTest"

const CreatePool = lazy(() => import("./CreatePool"))
const Deposit = lazy(() => import("./Deposit"))
const Farm = lazy(() => import("./Farm/Farm"))
const Pools = lazy(() => import("./Pools"))
const Risk = lazy(() => import("./Risk"))
const Swap = lazy(() => import("./Swap"))
const VeSDL = lazy(() => import("./VeSDL"))
const VestingClaim = lazy(() => import("./VestingClaim"))
const Withdraw = lazy(() => import("./Withdraw"))

export default function Pages() {
  return (
    <Switch>
      <Route exact path="/" component={Swap} />
      <Route exact path="/pools" component={Pools} />
      <Route exact path={`/pools/:poolName/deposit`} component={Deposit} />
      <Route exact path={`/pools/:poolName/withdraw`} component={Withdraw} />
      <Redirect from="/pools/:route/:action" to="/pools" />
      <Route exact path="/pools/create" component={CreatePool} />
      <Route exact path="/risk" component={Risk} />
      <Route exact path="/vesting-claim" component={VestingClaim} />
      <Route exact path="/farm" component={Farm} />
      <Route exact path="/vesdl" component={VeSDL} />
      <Route exact path="/coinbase-pay-test" component={CoinbasePayTest} />
    </Switch>
  )
}
