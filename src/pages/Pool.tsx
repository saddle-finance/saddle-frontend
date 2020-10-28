import "./Pool.scss"

import React, { ReactElement } from "react"

import AssetButton from "../components/AssetButton"
import TopMenu from "../components/TopMenu"
import btcIcon from "../assets/icons/icon_btc.svg"
import usdIcon from "../assets/icons/icon_usd.svg"
import { useTranslation } from "react-i18next"

function Pool(): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="poolpage">
      <TopMenu activeTab={"pool"} />
      <div className="content">
        <h3>{t("whichAssetPoolDoYouWantToChoose")}</h3>
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
