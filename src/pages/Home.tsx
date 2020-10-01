import "./Home.scss"

import React, { ReactElement } from "react"

import AssetButton from "../components/AssetButton"
import TopMenu from "../components/TopMenu"
import btcIcon from "../assets/icons/icon_btc.svg"
import usdIcon from "../assets/icons/icon_usd.svg"

function Home(): ReactElement {
  return (
    <div className="homepage">
      <TopMenu activeTab={"swap"} />
      <div className="content">
        <h3>Choose Asset</h3>
        <div className="button_group">
          <div className="button_usd">
            <AssetButton title="USD" to="/swap/usd" icon={usdIcon} />
          </div>
          <div className="button_btc">
            <AssetButton title="BTC" to="/swap/btc" icon={btcIcon} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
