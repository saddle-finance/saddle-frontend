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
        <h3 className="title">Risk</h3>
        <p data-testid="risk-intro">
          {t("riskIntro")}{" "}
          <a href="https://github.com/saddle-finance/saddle-contract">
            {t("riskIntro2")}
          </a>{" "}
          {t("riskIntro3")}
        </p>
        <h3>{t("audits")}</h3>
        <p data-testid="risk-audits">
          {t("riskAudits")}{" "}
          <a href="https://github.com/saddle-finance/saddle-audits">
            {t("riskAudits2")}
          </a>
          {"."}
          <br />
          <br />
          {t("riskAudits3")}
          <br />
          <br />
          {t("riskAudits4")}
        </p>
        <h3>{t("adminKeys")}</h3>
        <p data-testid="risk-adminkeys">{t("riskAdminKeys")}</p>
        <h3>{t("lossOfPeg")}</h3>
        <p data-testid="risk-lossofpeg">{t("riskLossOfPeg")}</p>
        <h3>{t("unnecessaryApprovalAskQ")}</h3>
        <p>
          {t("unnecessaryApprovalAskA")} <br />
          <br />
          <a href="https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729">
            ERC: Token standard · Issue #20 · ethereum/EIPs
          </a>
        </p>
      </div>
    </div>
  )
}

export default Risk
