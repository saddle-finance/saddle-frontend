import "./DepositPage.scss"

import { ALETH_POOL_NAME, VETH2_POOL_NAME, isMetaPool } from "../constants"
import { Button, Center } from "@chakra-ui/react"
import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useState } from "react"
import { Trans, useTranslation } from "react-i18next"

import AdvancedOptions from "./AdvancedOptions"
import CheckboxInput from "./CheckboxInput"
import ConfirmTransaction from "./ConfirmTransaction"
import { DepositTransaction } from "../interfaces/transactions"
import LPStakingBanner from "./LPStakingBanner"
import Modal from "./Modal"
import MyShareCard from "./MyShareCard"
import PoolInfoCard from "./PoolInfoCard"
import ReviewDeposit from "./ReviewDeposit"
import TokenInput from "./TokenInput"
import TopMenu from "./TopMenu"
import { Zero } from "@ethersproject/constants"
import { formatBNToPercentString } from "../utils"
import { logEvent } from "../utils/googleAnalytics"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  title: string
  onConfirmTransaction: () => Promise<void>
  onChangeTokenInputValue: (tokenSymbol: string, value: string) => void
  onToggleDepositWrapped: () => void
  shouldDepositWrapped: boolean
  tokens: Array<{
    symbol: string
    name: string
    icon: string
    max: string
    inputValue: string
  }>
  exceedsWallet: boolean
  selected?: { [key: string]: any }
  poolData: PoolDataType | null
  myShareData: UserShareType | null
  transactionData: DepositTransaction
}

/* eslint-enable @typescript-eslint/no-explicit-any */
const DepositPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const {
    tokens,
    exceedsWallet,
    poolData,
    myShareData,
    transactionData,
    shouldDepositWrapped,
    onChangeTokenInputValue,
    onConfirmTransaction,
    onToggleDepositWrapped,
  } = props

  const [currentModal, setCurrentModal] = useState<string | null>(null)

  const validDepositAmount = transactionData.to.totalAmount.gt(0)
  const shouldDisplayWrappedOption = isMetaPool(poolData?.name)

  return (
    <div className="deposit">
      <TopMenu activeTab={"deposit"} />
      {poolData?.aprs?.keep?.apr.gt(Zero) &&
        myShareData?.lpTokenBalance.gt(0) && (
          <LPStakingBanner
            stakingLink={"https://dashboard.keep.network/liquidity"}
          />
        )}
      {poolData?.name === VETH2_POOL_NAME &&
        myShareData?.lpTokenBalance.gt(0) && (
          <LPStakingBanner stakingLink={"https://www.sharedstake.org/earn"} />
        )}
      {poolData?.name === ALETH_POOL_NAME &&
        myShareData?.lpTokenBalance.gt(0) && (
          <LPStakingBanner stakingLink={"https://app.alchemix.fi/farms"} />
        )}

      <div className="content">
        <div className="left">
          <div className="form">
            <h3>{t("addLiquidity")}</h3>
            {exceedsWallet ? (
              <div className="error">{t("depositBalanceExceeded")}</div>
            ) : null}
            {poolData?.isPaused && poolData?.name === VETH2_POOL_NAME ? (
              <div className="error">
                <Trans i18nKey="sgtPoolPaused" t={t}>
                  This pool is paused, please see{" "}
                  <a
                    href="https://medium.com/immunefi/sharedstake-insider-exploit-postmortem-17fa93d5c90e"
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "underline" }}
                  >
                    this postmortem
                  </a>{" "}
                  for more information.
                </Trans>
              </div>
            ) : null}
            {tokens.map((token, index) => (
              <div key={index}>
                <TokenInput
                  {...token}
                  disabled={poolData?.isPaused}
                  onChange={(value): void =>
                    onChangeTokenInputValue(token.symbol, value)
                  }
                />
                {index === tokens.length - 1 ? (
                  ""
                ) : (
                  <div className="formSpace"></div>
                )}
              </div>
            ))}
            {shouldDisplayWrappedOption && (
              <div className="wrappedDeposit">
                <CheckboxInput
                  onChange={onToggleDepositWrapped}
                  checked={shouldDepositWrapped}
                />
                <span>{t("depositWrapped")}</span>
              </div>
            )}
            <div className={"transactionInfoContainer"}>
              <div className="transactionInfo">
                {poolData?.aprs?.keep?.apr.gt(Zero) && (
                  <div className="transactionInfoItem">
                    <a
                      href="https://docs.saddle.finance/faq#what-are-saddles-liquidity-provider-rewards"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{`KEEP APR:`}</span>
                    </a>{" "}
                    <span className="value">
                      {formatBNToPercentString(poolData.aprs.keep.apr, 18)}
                    </span>
                  </div>
                )}
                {poolData?.aprs?.sharedStake?.apr.gt(Zero) && (
                  <div className="transactionInfoItem">
                    <a
                      href="https://docs.saddle.finance/faq#what-are-saddles-liquidity-provider-rewards"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{`SGT APR:`}</span>
                    </a>{" "}
                    <span className="value">
                      {formatBNToPercentString(
                        poolData.aprs.sharedStake.apr,
                        18,
                      )}
                    </span>
                  </div>
                )}
                <div className="transactionInfoItem">
                  {transactionData.priceImpact.gte(0) ? (
                    <span className="bonus">{`${t("bonus")}: `}</span>
                  ) : (
                    <span className="slippage">{t("priceImpact")}</span>
                  )}
                  <span
                    className={
                      "value " +
                      (transactionData.priceImpact.gte(0)
                        ? "bonus"
                        : "slippage")
                    }
                  >
                    {" "}
                    {formatBNToPercentString(
                      transactionData.priceImpact,
                      18,
                      4,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <AdvancedOptions />
          <Center width="100%" py={6}>
            <Button
              variant="primary"
              size="lg"
              width="240px"
              onClick={(): void => {
                setCurrentModal("review")
              }}
              disabled={!validDepositAmount || poolData?.isPaused}
            >
              {t("deposit")}
            </Button>
          </Center>
        </div>
        <div className="infoPanels">
          <MyShareCard data={myShareData} />
          <div
            style={{
              display: myShareData ? "block" : "none",
            }}
            className="divider"
          ></div>{" "}
          <PoolInfoCard data={poolData} />
        </div>
        <Modal
          isOpen={!!currentModal}
          onClose={(): void => setCurrentModal(null)}
        >
          {currentModal === "review" ? (
            <ReviewDeposit
              transactionData={transactionData}
              onConfirm={async (): Promise<void> => {
                setCurrentModal("confirm")
                logEvent(
                  "deposit",
                  (poolData && { pool: poolData?.name }) || {},
                )
                await onConfirmTransaction?.()
                setCurrentModal(null)
              }}
              onClose={(): void => setCurrentModal(null)}
            />
          ) : null}
          {currentModal === "confirm" ? <ConfirmTransaction /> : null}
        </Modal>
      </div>
    </div>
  )
}

export default DepositPage
