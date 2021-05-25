import "./PoolOverview.scss"

import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement } from "react"
import { formatBNToPercentString, formatBNToString } from "../utils"
import Button from "./Button"
import { Link } from "react-router-dom"
import { TOKENS_MAP } from "../constants"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { commify } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

interface Props {
  poolRoute: string
  poolData: PoolDataType
  userShareData: UserShareType | null
}

function PoolOverview({
  poolData,
  poolRoute,
  userShareData,
}: Props): ReactElement | null {
  const { t } = useTranslation()
  const formattedData = {
    name: poolData.name,
    reserve: `$${commify(formatBNToString(poolData.reserve, 18, 2))}`,
    aprs: {
      keep: formatBNToPercentString(poolData.aprs.keep, 18),
      sharedStake: formatBNToPercentString(poolData.aprs.sharedStake, 18),
    },
    userBalanceUSD: `$${commify(
      formatBNToString(userShareData?.usdBalance || Zero, 18, 2),
    )}`,
    tokens: poolData.tokens.map((coin) => {
      const token = TOKENS_MAP[coin.symbol]
      return {
        symbol: token.symbol,
        name: token.name,
        icon: token.icon,
        value: formatBNToString(coin.value, token.decimals, 4),
      }
    }),
  }

  return (
    <div className="poolOverview">
      <div className="left">
        <h4 className="title">{formattedData.name}</h4>
        <div className="balance">
          <span>Balance: </span>
          <span>$2000.11</span>
        </div>
        <div className="tokens">
          <span style={{ marginRight: "8px" }}>[</span>
          {formattedData.tokens.map((token) => (
            <div className="token" key={token.symbol}>
              <img alt="icon" src={token.icon} />
              <span>{token.name}</span>
            </div>
          ))}
          <span style={{ marginLeft: "-8px" }}>]</span>
        </div>
      </div>

      <div className="right">
        <div className="poolInfo">
          {poolData?.aprs.keep.gt(Zero) && (
            <div className="margin Apr">
              <span className="label">KEEP APR</span>
              <span
                className={
                  classNames({ plus: formattedData.aprs.keep }) +
                  classNames({ minus: !formattedData.aprs.keep })
                }
              >
                {formattedData.aprs.keep}
              </span>
            </div>
          )}
          {poolData?.aprs.sharedStake.gt(Zero) && (
            <div className="margin Apr">
              <span className="label">SGT APR</span>
              <span
                className={
                  classNames({ plus: formattedData.aprs.sharedStake }) +
                  classNames({ minus: !formattedData.aprs.sharedStake })
                }
              >
                {formattedData.aprs.sharedStake}
              </span>
            </div>
          )}
          <div className="volume">
            <span className="label">{t("currencyReserves")}</span>
            <span>{formattedData.reserve}</span>
          </div>
        </div>
        <div className="buttons">
          <Link to={`${poolRoute}/withdraw`}>
            <Button kind="secondary" size="large">
              {t("withdraw")}
            </Button>
          </Link>
          <Link to={`${poolRoute}/deposit`}>
            <Button kind="primary" size="large">
              {t("deposit")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PoolOverview
