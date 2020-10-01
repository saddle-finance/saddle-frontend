import "./Pool.scss"

import * as React from "react"

import AssetButton from "../components/AssetButton"
import TopMenu from "../components/TopMenu"

function Pool() {
  return (
    <div className="poolpage">
      <TopMenu activeTab={"pool"} />
      <div className="content">
        <h3>Choose Asset</h3>
        <div className="button_group">
          <div className="button_usd">
            <AssetButton
              title="USD"
              to="/pool/usd"
              icon={require("../assets/icons/icon_usd.svg")}
            />
          </div>
          <div className="button_btc">
            <AssetButton
              title="BTC"
              to="/pool/btc"
              icon={require("../assets/icons/icon_btc.svg")}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pool
