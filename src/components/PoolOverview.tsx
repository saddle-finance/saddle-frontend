import "./PoolOverview.scss"

import React, { ReactElement } from "react"

import { Link } from "react-router-dom"
import classNames from "classnames"
import { useTranslation } from "react-i18next"

interface Props {
  to: string
  data: {
    title: string
    tokens: Array<{ name: string; icon: string }>
    APY: number
    saddAPY: string
    volume: number
  }
}

function PoolOverview({ data, to }: Props): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="poolOverview">
      <Link to={to}>
        <div className="table">
          <h4 className="title">{data.title}</h4>
          <div className="left">
            <span style={{ marginRight: "8px" }}>[</span>
            {data.tokens.map((token, index) => (
              <div className="token" key={index}>
                <img alt="icon" src={token.icon} />
                <span>{token.name}</span>
              </div>
            ))}
            <span style={{ marginLeft: "-8px" }}>]</span>
          </div>

          <div className="right">
            <div className="Apy">
              <span className="label">{t("apy")}</span>
              <span
                className={
                  classNames({ plus: data.APY }) +
                  classNames({ minus: !data.APY })
                }
              >
                {data.APY}
              </span>
            </div>
            <div className="saddApy">
              <span className="label">SADL</span>
              <span>{data.saddAPY}</span>
            </div>
            <div className="volume">
              <span className="label">{t("volume")}</span>
              <span>${data.volume}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default PoolOverview
