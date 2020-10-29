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
        <p>
          Liquidity pools, in essence, are pools of tokens that are locked in a
          smart contract. They are used to facilitate trading by providing
          liquidity and are extensively used by some of the decentralized
          exchanges a.k.a DEXes.
          <br />
          <br />
          When liquidity is supplied to a pool, the liquidity provider (LP)
          receives special tokens called LP tokens in proportion to how much
          liquidity they supplied to the pool. When a trade is facilitated by
          the pool a 0.3% feis proportionally distributed amongst all the LP
          token holders. If the liquidity provider wants to get their underlying
          liquidity back, plus any accrued fees, they must burn their LP tokens.
        </p>
      </div>
    </div>
  )
}

export default Pool
