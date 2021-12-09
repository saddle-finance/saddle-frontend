import "./WithdrawPage.scss"

import { Button, Center } from "@chakra-ui/react"
import Modal, { ModalProps } from "../components/Modal/Modal"
import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement } from "react"

import AdvancedOptions from "./AdvancedOptions"
import { AppState } from "../state"
import { BigNumber } from "@ethersproject/bignumber"
import ConfirmTransaction from "./ConfirmTransaction"
import MyFarm from "./MyFarm"
import MyShareCard from "./MyShareCard"
import PoolInfoCard from "./PoolInfoCard"
import { PoolName } from "../constants"
import RadioButton from "./RadioButton"
import ReviewWithdraw from "./ReviewWithdraw"
import TokenInput from "./TokenInput"
import TopMenu from "./TopMenu"
import { WithdrawFormState } from "../hooks/useWithdrawFormState"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { formatBNToPercentString } from "../utils"
import { logEvent } from "../utils/googleAnalytics"
import useModal from "../hooks/useModal"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import useWithdrawFormState from "../hooks/useWithdrawFormState"

export interface ReviewWithdrawData {
  withdraw: {
    name: string
    value: string
    icon: string
  }[]
  rates: {
    name: string
    value: string
    rate: string
  }[]
  slippage: string
  priceImpact: BigNumber
  txnGasCost: {
    amount: BigNumber
    valueUSD: BigNumber | null // amount * ethPriceUSD
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  title: PoolName
  tokensData: Array<{
    symbol: string
    name: string
    icon: string
    inputValue: string
  }>
  reviewData: ReviewWithdrawData
  selected?: { [key: string]: any }
  poolData: PoolDataType | null
  myShareData: UserShareType | null
  formStateData: WithdrawFormState
  onFormChange: (action: any) => void
  onConfirmTransaction: () => Promise<void>
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const WithdrawPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const {
    title,
    tokensData,
    poolData,
    myShareData,
    onFormChange,
    formStateData,
    reviewData,
    onConfirmTransaction,
  } = props

  const noShare = !myShareData || myShareData.lpTokenBalance.eq(Zero)
  const [withdrawFormState, updateWithdrawFormState] = useWithdrawFormState(
    title,
  )

  const [openConfirmModal, confirmClose] = useModal(<ConfirmTransaction />)
  const onConfirm = async (): Promise<void> => {
    openConfirmModal()
    logEvent("withdraw", (poolData && { pool: poolData?.name }) || {})
    await onConfirmTransaction?.()
    confirmClose()
  }
  console.log("withdraw form state ==>", withdrawFormState)

  const [openModal] = useModal(
    <ReviewModal reviewData={reviewData} onConfirm={onConfirm} />,
  )

  return (
    <div className={"withdraw " + classNames({ noShare: noShare })}>
      <TopMenu activeTab={"withdraw"} />
      <div className="content">
        <div className="left">
          <div className="form">
            <h3>{t("withdraw")}</h3>
            <div className="percentage">
              <span>{`${t("withdrawPercentage")} (%):`}</span>
              <input
                placeholder="100"
                onChange={(e: React.FormEvent<HTMLInputElement>): void =>
                  updateWithdrawFormState({
                    fieldName: "percentage",
                    value: e.currentTarget.value,
                  })
                }
                onFocus={(e: React.ChangeEvent<HTMLInputElement>): void =>
                  e.target.select()
                }
                value={formStateData.percentage ? formStateData.percentage : ""}
              />
              {formStateData.error && (
                <div className="error">{formStateData.error.message}</div>
              )}
            </div>
            <div className="horizontalDisplay">
              <RadioButton
                checked={formStateData.withdrawType === "ALL"}
                onChange={(): void =>
                  onFormChange({
                    fieldName: "withdrawType",
                    value: "ALL",
                  })
                }
                label="Combo"
              />
              {tokensData.map((t) => {
                return (
                  <RadioButton
                    key={t.symbol}
                    checked={formStateData.withdrawType === t.symbol}
                    onChange={(): void =>
                      onFormChange({
                        fieldName: "withdrawType",
                        value: t.symbol,
                      })
                    }
                    disabled={poolData?.isPaused}
                    label={t.name}
                  />
                )
              })}
            </div>
            {tokensData.map((token, index) => (
              <div key={index}>
                <TokenInput
                  {...token}
                  // inputValue={parseFloat(token.inputValue).toFixed(5)}
                  onChange={(value): void =>
                    onFormChange({
                      fieldName: "tokenInputs",
                      value: value,
                      tokenSymbol: token.symbol,
                    })
                  }
                  disabled={poolData?.isPaused}
                />
                {index === tokensData.length - 1 ? (
                  ""
                ) : (
                  <div className="formSpace"></div>
                )}
              </div>
            ))}
            <div className={"transactionInfoContainer"}>
              <div className="transactionInfo">
                <div className="transactionInfoItem">
                  {reviewData.priceImpact.gte(0) ? (
                    <span className="bonus">{t("bonus")}: </span>
                  ) : (
                    <span className="slippage">{t("priceImpact")}</span>
                  )}
                  <span
                    className={
                      "value " +
                      (reviewData.priceImpact.gte(0) ? "bonus" : "slippage")
                    }
                  >
                    {formatBNToPercentString(reviewData.priceImpact, 18, 4)}
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
              disabled={
                noShare ||
                !!formStateData.error ||
                formStateData.lpTokenAmountToSpend.isZero()
              }
              onClick={openModal}
            >
              {t("withdraw")}
            </Button>
          </Center>
        </div>

        <div>
          {poolData && (
            <MyFarm
              lpWalletBalance={myShareData?.lpTokenBalance || Zero}
              poolName={poolData.name}
            />
          )}
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
        </div>
      </div>
    </div>
  )
}

export default WithdrawPage

interface ReviewModalProps {
  reviewData: ReviewWithdrawData
  onConfirm: () => Promise<void>
}
const ReviewModal = ({
  onConfirm,
  reviewData,
  onClose,
}: ReviewModalProps & ModalProps) => {
  const { gasPriceSelected } = useSelector((state: AppState) => state.user)
  return (
    <Modal>
      <ReviewWithdraw
        data={reviewData}
        gas={gasPriceSelected}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    </Modal>
  )
}
