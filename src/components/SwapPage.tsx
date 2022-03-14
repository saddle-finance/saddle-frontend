import "./SwapPage.scss"

import { Box, Button, Container, Dialog } from "@mui/material"
import React, { ReactElement, useMemo, useState } from "react"
import { SWAP_TYPES, getIsVirtualSwap } from "../constants"
import { formatBNToPercentString, formatBNToString } from "../utils"

import AdvancedOptions from "./AdvancedOptions"
import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import ConfirmTransaction from "./ConfirmTransaction"
import { ReactComponent as InfoIcon } from "../assets/icons/info.svg"
import { PendingSwap } from "../hooks/usePendingSwapData"
import PendingSwapModal from "./PendingSwapModal"
import ReviewSwap from "./ReviewSwap"
import { Slippages } from "../state/user"
import SwapInput from "./SwapInput"
import type { TokenOption } from "../pages/Swap"
import { Zero } from "@ethersproject/constants"
import classNames from "classnames"
import { commify } from "../utils"
import { formatUnits } from "@ethersproject/units"
import { isHighPriceImpact } from "../utils/priceImpact"
import { logEvent } from "../utils/googleAnalytics"
import { useActiveWeb3React } from "../hooks"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  tokenOptions: {
    from: TokenOption[]
    to: TokenOption[]
  }
  exchangeRateInfo: {
    pair: string
    exchangeRate: BigNumber
    priceImpact: BigNumber
    route: string[]
  }
  txnGasCost: {
    amount: BigNumber
    valueUSD: BigNumber | null // amount * ethPriceUSD
  }
  error: string | null
  swapType: SWAP_TYPES
  fromState: { symbol: string; value: string; valueUSD: BigNumber }
  toState: { symbol: string; value: string; valueUSD: BigNumber }
  pendingSwaps: PendingSwap[]
  onChangeFromToken: (tokenSymbol: string) => void
  onChangeFromAmount: (amount: string) => void
  onChangeToToken: (tokenSymbol: string) => void
  onConfirmTransaction: () => Promise<void>
  onClickReverseExchangeDirection: () => void
}

const SwapPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()
  const {
    tokenOptions,
    exchangeRateInfo,
    txnGasCost,
    error,
    fromState,
    toState,
    pendingSwaps,
    swapType,
    onChangeFromToken,
    onChangeFromAmount,
    onChangeToToken,
    onConfirmTransaction,
    onClickReverseExchangeDirection,
  } = props

  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const [activePendingSwap, setActivePendingSwap] = useState<string | null>(
    null,
  )
  const { slippageCustom, slippageSelected } = useSelector(
    (state: AppState) => state.user,
  )

  const fromToken = useMemo(() => {
    return tokenOptions.from.find(({ symbol }) => symbol === fromState.symbol)
  }, [tokenOptions.from, fromState.symbol])

  const formattedPriceImpact = commify(
    formatBNToPercentString(exchangeRateInfo.priceImpact, 18),
  )
  const formattedExchangeRate = commify(
    formatBNToString(exchangeRateInfo.exchangeRate, 18, 6),
  )
  const formattedRoute = exchangeRateInfo.route.join(" > ")
  const formattedBalance = commify(
    formatBNToString(fromToken?.amount || Zero, fromToken?.decimals || 0, 6),
  )
  const isVirtualSwap = getIsVirtualSwap(swapType)
  const isHighSlippage =
    slippageSelected === Slippages.OneTenth ||
    (slippageSelected === Slippages.Custom &&
      parseFloat(slippageCustom?.valueRaw || "0") < 0.5)

  return (
    <Container>
      <div className="swapPage">
        <div className="content">
          <div className="swapForm">
            <div className="row">
              <h3 className="swapTitle">{t("from")}</h3>
              <div className="balanceContainer">
                <span>{t("balance")}:</span>
                &nbsp;
                <a
                  onClick={() => {
                    if (fromToken == null) return
                    const amtStr = formatBNToString(
                      fromToken.amount,
                      fromToken.decimals || 0,
                    )
                    onChangeFromAmount(amtStr)
                  }}
                >
                  {formattedBalance}
                </a>
              </div>
            </div>
            <div className="row">
              <SwapInput
                tokens={tokenOptions.from.filter(
                  ({ symbol }) => symbol !== toState.symbol,
                )}
                onSelect={onChangeFromToken}
                onChangeAmount={onChangeFromAmount}
                selected={fromState.symbol}
                inputValue={fromState.value}
                inputValueUSD={fromState.valueUSD}
                isSwapFrom={true}
              />
            </div>
            <div style={{ height: "48px" }}></div>
            <div className="row">
              <h3 className="swapTitle">{t("to")}</h3>
            </div>
            <div className="row">
              <SwapInput
                tokens={tokenOptions.to.filter(
                  ({ symbol }) => symbol !== fromState.symbol,
                )}
                onSelect={onChangeToToken}
                selected={toState.symbol}
                inputValue={toState.value}
                inputValueUSD={toState.valueUSD}
                isSwapFrom={false}
              />
            </div>
            <div style={{ height: "24px" }}></div>
            {fromState.symbol && toState.symbol && (
              <div className="row">
                <div>
                  <span>{t("rate")}</span>
                  &nbsp;
                  <span>{exchangeRateInfo.pair}</span>
                  &nbsp;
                  <button
                    className="exchange"
                    onClick={onClickReverseExchangeDirection}
                  >
                    <svg
                      width="24"
                      height="20"
                      viewBox="0 0 24 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.4011 12.4196C17.4011 13.7551 16.5999 13.8505 16.4472 13.8505H6.62679L9.14986 11.3274L8.47736 10.6501L5.13869 13.9888C5.04986 14.0782 5 14.1991 5 14.3251C5 14.4511 5.04986 14.572 5.13869 14.6613L8.47736 18L9.14986 17.3275L6.62679 14.8044H16.4472C17.1054 14.8044 18.355 14.3274 18.355 12.4196V10.9888H17.4011V12.4196Z"
                        fill="#3800D6"
                      />
                      <path
                        d="M5.9539 7.58511C5.9539 6.24965 6.75519 6.15426 6.90781 6.15426H16.7283L14.2052 8.67733L14.8777 9.34984L18.2164 6.01117C18.3052 5.92181 18.355 5.80092 18.355 5.67492C18.355 5.54891 18.3052 5.42803 18.2164 5.33867L14.8777 2L14.2004 2.67727L16.7283 5.20035H6.90781C6.24962 5.20035 5 5.6773 5 7.58511V9.01597H5.9539V7.58511Z"
                        fill="#3800D6"
                      />
                    </svg>
                  </button>
                </div>
                <span className="exchRate">{formattedExchangeRate}</span>
              </div>
            )}
            <div className="row">
              <span>{t("priceImpact")}</span>
              <span>{formattedPriceImpact}</span>
            </div>
            {formattedRoute && (
              <>
                <div className="row">
                  <span>{t("route")}</span>
                  <span>{formattedRoute}</span>
                </div>
                {isVirtualSwap && (
                  <div className="row">
                    <span></span>
                    <span>
                      <a
                        href="https://docs.saddle.finance/saddle-faq#what-is-virtual-swap"
                        style={{ textDecoration: "underline" }}
                        target="_blank"
                        rel="noreferrer"
                      >
                        ({t("virtualSwap")})
                      </a>
                    </span>
                  </div>
                )}
                {isVirtualSwap && isHighSlippage && (
                  <div className="exchangeWarning">
                    {t("lowSlippageVirtualSwapWarning")}
                  </div>
                )}
              </>
            )}
          </div>
          {account && isHighPriceImpact(exchangeRateInfo.priceImpact) ? (
            <div className="exchangeWarning">
              {t("highPriceImpact", {
                rate: formattedPriceImpact,
              })}
            </div>
          ) : null}
          {isVirtualSwap && (
            <div className="virtualSwapInfoBubble">
              <InfoIcon />
              {t("crossAssetSwapsUseVirtualSwaps")} {"<"}
              <a
                href="https://docs.saddle.finance/saddle-faq#what-is-virtual-swap"
                target="_blank"
                rel="noreferrer"
              >
                {t("learnMore")}
              </a>
              {">"}
            </div>
          )}
          <AdvancedOptions />
          <div className="pendingSwaps">
            {pendingSwaps.map((pendingSwap) => {
              const formattedSynthBalance = commify(
                formatUnits(
                  pendingSwap.synthBalance,
                  pendingSwap.synthTokenFrom.decimals,
                ),
              )
              return (
                <div
                  className="pendingSwapItem"
                  key={pendingSwap.itemId?.toString()}
                  onClick={() => {
                    setActivePendingSwap(pendingSwap.itemId)
                    setCurrentModal("pendingSwap")
                  }}
                >
                  <span className="swapDetails">
                    {formattedSynthBalance} {pendingSwap.synthTokenFrom.symbol}{" "}
                    {"->"} {pendingSwap.tokenTo.symbol}
                  </span>
                  <div className="swapTimeContainer">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 11 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.23467 1H5.5C7.98605 1 10 3.01525 10 5.49924C10 7.98311 7.98618 10 5.5 10C3.01388 10 1 7.98469 1 5.49924C1 4.30732 1.46423 3.22282 2.21973 2.41912L2.60641 2.78249C1.93974 3.49169 1.53066 4.4476 1.53066 5.49924C1.53066 7.69191 3.30721 9.46943 5.5 9.46943C7.69273 9.46943 9.46934 7.69046 9.46934 5.49924C9.46934 3.39724 7.83438 1.67581 5.76533 1.5393V2.96008H5.23467V1Z"
                        fill="black"
                        stroke="black"
                        strokeWidth="0.3"
                        strokeMiterlimit="10"
                      />
                      <path
                        d="M5.76204 5.52774L5.76861 5.53328L5.77577 5.53804C5.82206 5.5688 5.85082 5.61957 5.84998 5.67802L5.84997 5.67802V5.68017C5.84997 5.77327 5.77431 5.85 5.67911 5.85C5.62153 5.85 5.56861 5.81994 5.53676 5.77321L5.53241 5.76682L5.52742 5.76091L4.26017 4.26001L5.76204 5.52774Z"
                        fill="black"
                        stroke="black"
                        strokeWidth="0.3"
                      />
                    </svg>
                    <span className="swapTime">
                      {Math.ceil(pendingSwap.secondsRemaining / 60)} min.
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          <Box mt={3} width="100%">
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={(): void => {
                setCurrentModal("review")
              }}
              disabled={!!error || +toState.value <= 0}
            >
              {t("swap")}
            </Button>
          </Box>

          <div className={classNames({ showError: !!error }, "error")}>
            {error}
          </div>
          <Dialog
            open={!!currentModal}
            onClose={(): void => setCurrentModal(null)}
            scroll="body"
            maxWidth="xs"
            fullWidth
          >
            {currentModal === "review" ? (
              <ReviewSwap
                onClose={(): void => setCurrentModal(null)}
                onConfirm={async (): Promise<void> => {
                  setCurrentModal("confirm")
                  logEvent("swap", {
                    from: fromState.symbol,
                    to: toState.symbol,
                  })
                  await onConfirmTransaction?.()
                  setCurrentModal(null)
                }}
                data={{
                  from: fromState,
                  to: toState,
                  exchangeRateInfo,
                  txnGasCost,
                  swapType,
                }}
              />
            ) : null}
            {currentModal === "confirm" ? <ConfirmTransaction /> : null}
            {currentModal === "pendingSwap" ? (
              <PendingSwapModal
                pendingSwap={
                  pendingSwaps.find(
                    (p) => p.itemId === activePendingSwap,
                  ) as PendingSwap
                }
                onClose={() => {
                  setCurrentModal(null)
                  setActivePendingSwap(null)
                }}
              />
            ) : null}
          </Dialog>
        </div>
      </div>
    </Container>
  )
}

export default SwapPage
