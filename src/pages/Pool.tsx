import "./Pool.scss"

import * as React from "react"

import AssetButton from "../components/AssetButton"
import TopMenu from "../components/TopMenu"
import btcIcon from "../assets/icons/icon_btc.svg"
import usdIcon from "../assets/icons/icon_usd.svg"

function Pool() {
  return (
    <div className="poolpage">
      <TopMenu activeTab={"pool"} />
      <div className="content">
        <h3>Choose Asset</h3>
        <div className="button_group">
          <div className="button_usd">
            <AssetButton title="USD" to="/pool/usd" icon={usdIcon} />
          </div>
          <div className="button_btc">
            <AssetButton title="BTC" to="/pool/btc" icon={btcIcon} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pool
