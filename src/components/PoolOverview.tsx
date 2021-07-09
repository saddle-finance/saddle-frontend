import "./PoolOverview.scss"

import { POOLS_MAP, PoolTypes, TOKENS_MAP } from "../constants"
import { Partners, PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement } from "react"
import {
  formatBNToPercentString,
  formatBNToShortString,
  formatBNToString,
} from "../utils"

import Button from "./Button"
import { Link } from "react-router-dom"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { useTranslation } from "react-i18next"

interface Props {
  poolRoute: string
  poolData: PoolDataType
  userShareData: UserShareType | null
  outdated?: boolean
  onMigrate?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function PoolOverview({
  poolData,
  poolRoute,
  userShareData,
  outdated,
  onMigrate,
}: Props): ReactElement | null {
  const { t } = useTranslation()
  const { type: poolType } = POOLS_MAP[poolData.name]
  const formattedDecimals = poolType === PoolTypes.USD ? 2 : 4
  const formattedData = {
    name: poolData.name,
    reserve: poolData.reserve
      ? formatBNToShortString(poolData.reserve, 18)
      : "-",
    aprs: Object.keys(poolData.aprs).reduce((acc, key) => {
      const apr = poolData.aprs[key as Partners]?.apr
      return apr
        ? {
            ...acc,
            [key]: formatBNToPercentString(apr, 18),
          }
        : acc
    }, {} as Partial<Record<Partners, string>>),
    apy: poolData.apy ? `${formatBNToPercentString(poolData.apy, 18, 2)}` : "-",
    volume: poolData.volume
      ? `$${formatBNToShortString(poolData.volume, 18)}`
      : "-",
    userBalanceUSD: formatBNToShortString(
      userShareData?.usdBalance || Zero,
      18,
    ),
    tokens: poolData.tokens.map((coin) => {
      const token = TOKENS_MAP[coin.symbol]
      return {
        symbol: token.symbol,
        name: token.name,
        icon: token.icon,
        value: formatBNToString(coin.value, token.decimals, formattedDecimals),
      }
    }),
  }
  const hasShare = !!userShareData?.usdBalance.gt("0")

  return (
    <div className={classNames("poolOverview", { outdated: outdated })}>
      <div className="left">
        <div className="titleAndTag">
          <h4 className="title">{formattedData.name}</h4>
          {outdated && <Tag>OUTDATED</Tag>}
        </div>
        {hasShare && (
          <div className="balance">
            <span>{t("balance")}: </span>
            <span>{`$${formattedData.userBalanceUSD}`}</span>
          </div>
        )}
        <div className="tokens">
          <span style={{ marginRight: "8px" }}>[</span>
          {formattedData.tokens.map(({ symbol, icon }) => (
            <div className="token" key={symbol}>
              <img alt="icon" src={icon} />
              <span>{symbol}</span>
            </div>
          ))}
          <span style={{ marginLeft: "-8px" }}>]</span>
        </div>
      </div>

      <div className="right">
        <div className="poolInfo">
          {formattedData.apy && (
            <div className="margin">
              <span className="label">{`${t("apy")}`}</span>
              <span>{formattedData.apy}</span>
            </div>
          )}
          {Object.keys(poolData.aprs).map((key) => {
            const symbol = poolData.aprs[key as Partners]?.symbol as string
            return poolData.aprs[key as Partners]?.apr.gt(Zero) ? (
              <div className="margin Apr" key={symbol}>
                <span className="label">{symbol} APR</span>
                <span className="plus">
                  {formattedData.aprs[key as Partners] as string}
                </span>
              </div>
            ) : null
          })}
          <div className="margin">
            <span className="label">{t("currencyReserves")}</span>
            <span>{`$${formattedData.reserve}`}</span>
          </div>
          {formattedData.volume && (
            <div>
              <span className="label">{`${t("24HrVolume")}`}</span>
              <span>{formattedData.volume}</span>
            </div>
          )}
        </div>
        <div className="buttons">
          <Link to={`${poolRoute}/withdraw`}>
            <Button kind="secondary" size="large" disabled={!hasShare}>
              {t("withdraw")}
            </Button>
          </Link>
          {outdated && onMigrate ? (
            <Button kind="temporary" onClick={onMigrate}>
              {t("migrate")}
            </Button>
          ) : (
            <Link to={`${poolRoute}/deposit`}>
              <Button kind="primary" size="large">
                {t("deposit")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function Tag(props: { children?: React.ReactNode }) {
  return <span className="tag" {...props} />
}
