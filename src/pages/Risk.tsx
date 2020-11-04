import "./Risk.scss"

import React, { ReactElement } from "react"

import TopMenu from "../components/TopMenu"
import { useTranslation } from "react-i18next"

function Risk(): ReactElement {
  const { t } = useTranslation()

  return (
    <div className="riskpage">
      <TopMenu activeTab={t("risk")} />
      <div className="content">
        <p>
          Providing liquidity to Saddle is highly risky. Before making a
          deposit, we highly recommend reading the code and understanding the
          risks involved with being a Liquidity Provider (LP).
        </p>
        <h3>Audits</h3>
        <p>
          The Saddle smart contracts were audited by Certik and Quantstamp.
          <br />
          <br />
          Please keep in mind that security audits don’t completely eliminate
          risks. Do not supply assets that you cannot afford to Saddle as a
          liquidity provider. <br />
          <br />
          Using Saddle as an exchange user should be significantly less risky
          but keep in mind there are still risks.
        </p>
        <h3>Admin keys</h3>
        <p>
          Saddle launched with a n-m multisig. The signers are A, B, C, D, E,
          and F. This multisig has capabilities to pause new deposits and trades
          in case of technical emergencies. Users will always be able to
          withdraw their funds regardless of new deposits being paused. Once a
          &lt;x&gt; months period is over the multisig will lose
          capabilities to pause.
        </p>
        <h3>Permanent loss of a peg</h3>
        <p>
          If one of the stablecoins in the pool significantly depegs below
          $1.00, it&apos;ll effectively mean that pool liquidity providers will
          hold nearly all of that asset.{" "}
          <b>
            This means that if one of the assets in the pool fails those that
            deposited other assets will be wiped out as well.
          </b>
        </p>
      </div>
    </div>
  )
}

export default Risk
