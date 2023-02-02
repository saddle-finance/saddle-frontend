import {
  Alert,
  Box,
  Button,
  Collapse,
  Container,
  IconButton,
  Link,
  Paper,
  Typography,
} from "@mui/material"
import React, { ReactElement, useMemo, useState } from "react"
import { SWAP_TYPES, getIsVirtualSwap } from "../constants"
import { formatBNToPercentString, formatBNToString } from "../utils"

import AdvancedOptions from "./AdvancedOptions"
import { AppState } from "../state/index"
import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../constants/networks"
import { Close } from "@mui/icons-material"
import ConfirmTransaction from "./ConfirmTransaction"
import Dialog from "./Dialog"
import InfoIcon from "@mui/icons-material/Info"
import { PendingSwap } from "../hooks/usePendingSwapData"
import PendingSwapModal from "./PendingSwapModal"
import ReviewSwap from "./ReviewSwap"
import { Slippages } from "../state/user"
import SwapIcon from "@mui/icons-material/SwapHoriz"
import SwapTokenInput from "./SwapTokenInput"
import { TokenOption } from "../types"
import { Zero } from "@ethersproject/constants"
import { commify } from "../utils"
import { formatUnits } from "@ethersproject/units"
import { getMultichainScanLink } from "../utils/getEtherscanLink"
import { isHighPriceImpact } from "../utils/priceImpact"
import { logEvent } from "../utils/googleAnalytics"
import { shortenAddress } from "../utils/shortenAddress"
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
  fromState: {
    address: string
    symbol: string
    value: string
    valueUSD: BigNumber
  }
  toState: {
    address: string
    symbol: string
    value: string
    valueUSD: BigNumber
  }
  pendingSwaps: PendingSwap[]
  onChangeFromToken: (tokenSymbol: string) => void
  onChangeFromAmount: (amount: string) => void
  onChangeToToken: (tokenSymbol: string) => void
  onConfirmTransaction: () => Promise<void>
  onClickReverseExchangeDirection: () => void
  openFrom: boolean
  setOpenFrom: (open: boolean) => void
  openTo: boolean
  setOpenTo: (open: boolean) => void
}

const SwapPage = (props: Props): ReactElement => {
  const { t } = useTranslation()
  const { account, chainId } = useActiveWeb3React()
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
    openFrom,
    setOpenFrom,
    openTo,
    setOpenTo,
  } = props

  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const [activePendingSwap, setActivePendingSwap] = useState<string | null>(
    null,
  )
  const { slippageCustom, slippageSelected } = useSelector(
    (state: AppState) => state.user,
  )

  const fromToken = useMemo(() => {
    return tokenOptions.from.find(
      ({ address }) => address === fromState.address,
    )
  }, [tokenOptions.from, fromState.address])

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

  const renderTokenListsWarning = React.useCallback(
    (open: boolean, setOpen: (open: boolean) => void, type: "from" | "to") => {
      return (
        <Collapse in={open}>
          <Alert
            variant="filled"
            severity="warning"
            sx={{ mb: 2, mt: type === "to" ? 2 : -3 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setOpen(false)
                }}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
          >
            <Typography>{t("tokenNotFoundTokenLists")}</Typography>
            <Link
              href={getMultichainScanLink(
                chainId ?? 1,
                type === "from" && fromToken
                  ? fromToken.address
                  : toState.address,
                "address",
              )}
              target="_blank"
            >
              <Typography mt={1}>
                {type === "from" && fromToken
                  ? shortenAddress(fromToken.address)
                  : type === "to" && toState.address
                  ? shortenAddress(toState.address)
                  : "Unable to detect Token address"}
              </Typography>
            </Link>
          </Alert>
        </Collapse>
      )
    },
    [chainId, fromToken, t, toState.address],
  )

  return (
    <Container maxWidth="sm" sx={{ pt: 5, pb: 20 }}>
      <Paper>
        <Box p={{ xs: 3, md: 4 }} flex={1}>
          <Box mb={5}>
            <Box display="flex">
              <Typography variant="subtitle1" component="span">
                {t("from").toLocaleUpperCase()}
              </Typography>
              <Box width="max-content" mr={0} ml="auto">
                <Typography variant="subtitle2" component="span">
                  {t("balance")}:
                </Typography>
                &nbsp;
                <Button
                  size="small"
                  data-testid="swapTokenFromWalletBalance"
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
                </Button>
              </Box>
            </Box>
            <SwapTokenInput
              data-testid="swapTokenInputFrom"
              tokens={tokenOptions.from.filter(
                ({ address }) => address !== toState.address,
              )}
              onSelect={onChangeFromToken}
              onChangeAmount={onChangeFromAmount}
              selected={fromState.symbol}
              inputValue={fromState.value}
              inputValueUSD={fromState.valueUSD}
              isSwapFrom={true}
            />
          </Box>
          {chainId &&
            [ChainId.MAINNET, ChainId.HARDHAT].includes(chainId) &&
            renderTokenListsWarning(openFrom, setOpenFrom, "from")}
          <Typography variant="subtitle1">
            {t("to").toLocaleUpperCase()}
          </Typography>

          <SwapTokenInput
            data-testid="swapTokenInputTo"
            tokens={tokenOptions.to.filter(
              ({ address }) => address !== fromState.address,
            )}
            onSelect={onChangeToToken}
            selected={toState.symbol}
            inputValue={toState.value}
            inputValueUSD={toState.valueUSD}
            isSwapFrom={false}
          />
          {chainId &&
            [ChainId.MAINNET, ChainId.HARDHAT].includes(chainId) &&
            renderTokenListsWarning(openTo, setOpenTo, "to")}
          <div style={{ height: "24px" }}></div>
          {fromState.symbol && toState.symbol && (
            <Box display="flex" justifyContent="space-between">
              <div>
                <Typography component="span" mr={1}>
                  {t("rate")}
                </Typography>
                <Typography component="span" mr={1}>
                  {exchangeRateInfo.pair}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={onClickReverseExchangeDirection}
                >
                  <SwapIcon />
                </Button>
              </div>
              <Typography data-testid="exchRate">
                {formattedExchangeRate}
              </Typography>
            </Box>
          )}
          <Box display="flex" justifyContent="space-between">
            <Typography>{t("priceImpact")}</Typography>
            <Typography data-testid="swapPriceImpactValue">
              {formattedPriceImpact}
            </Typography>
          </Box>
          {formattedRoute && (
            <>
              <Box display="flex" justifyContent="space-between">
                <Typography>{t("route")}</Typography>
                <Typography>{formattedRoute}</Typography>
              </Box>
              {isVirtualSwap && (
                <Link
                  href="https://docs.saddle.finance/saddle-faq#what-is-virtual-swap"
                  style={{ textDecoration: "underline" }}
                  target="_blank"
                  rel="noreferrer"
                >
                  ({t("virtualSwap")})
                </Link>
              )}
              {isVirtualSwap && isHighSlippage && (
                <Alert variant="filled" severity="error" sx={{ mt: 2 }}>
                  {t("lowSlippageVirtualSwapWarning")}
                </Alert>
              )}
            </>
          )}
        </Box>
      </Paper>
      {account && isHighPriceImpact(exchangeRateInfo.priceImpact) ? (
        <Alert variant="filled" severity="error" sx={{ mt: 2 }}>
          {t("highPriceImpact", {
            rate: formattedPriceImpact,
          })}
        </Alert>
      ) : null}
      {isVirtualSwap && (
        <Alert icon={false} sx={{ mt: 2 }}>
          <Box display="flex" alignItems="center" mx={5}>
            <InfoIcon color="primary" />
            <Typography ml={1}>
              {t("crossAssetSwapsUseVirtualSwaps")}
              <Link
                href="https://docs.saddle.finance/saddle-faq#what-is-virtual-swap"
                target="_blank"
                rel="noreferrer"
                color="inherit"
              >
                {"<" + t("learnMore") + ">"}
              </Link>
            </Typography>
          </Box>
        </Alert>
      )}
      <div>
        {pendingSwaps.map((pendingSwap) => {
          if (!pendingSwap.synthTokenFrom || !pendingSwap.tokenTo)
            return <>Loading Tokens2</>
          const formattedSynthBalance = commify(
            formatUnits(
              pendingSwap.synthBalance,
              pendingSwap.synthTokenFrom.decimals,
            ),
          )
          return (
            <Button
              key={pendingSwap.itemId?.toString()}
              variant="outlined"
              fullWidth
              size="large"
              onClick={() => {
                setActivePendingSwap(pendingSwap.itemId)
                setCurrentModal("pendingSwap")
              }}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                p: 2,
                mt: 2,
              }}
            >
              <Typography variant="subtitle1" color="text.primary">
                {formattedSynthBalance} {pendingSwap.synthTokenFrom.symbol}{" "}
                {"->"} {pendingSwap.tokenTo.symbol}
              </Typography>

              <Typography variant="body1" color="text.primary">
                {Math.ceil(pendingSwap.secondsRemaining / 60)} min wait
              </Typography>
            </Button>
          )
        })}
      </div>
      <AdvancedOptions />

      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        onClick={(): void => {
          setCurrentModal("review")
        }}
        disabled={!!error || +toState.value <= 0}
        sx={{ mt: 3 }}
      >
        {t("swap")}
      </Button>

      <Typography
        display={!error ? "none" : "block"}
        color="error"
        textAlign="center"
      >
        {error}
      </Typography>
      <Dialog
        open={!!currentModal}
        onClose={(): void => setCurrentModal(null)}
        scroll="body"
        hideClose={currentModal === "confirm"}
      >
        {currentModal === "review" ? (
          <ReviewSwap
            onClose={(): void => setCurrentModal(null)}
            onConfirm={() => {
              setCurrentModal("confirm")
              logEvent("swap", {
                from: fromState.symbol,
                to: toState.symbol,
              })
              void onConfirmTransaction?.()
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
    </Container>
  )
}

export default SwapPage
