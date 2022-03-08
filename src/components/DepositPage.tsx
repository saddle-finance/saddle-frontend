import { ALETH_POOL_NAME, VETH2_POOL_NAME, isMetaPool } from "../constants"
import {
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  Divider,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useState } from "react"
import { Trans, useTranslation } from "react-i18next"

import AdvancedOptions from "./AdvancedOptions"
import ConfirmTransaction from "./ConfirmTransaction"
import { DepositTransaction } from "../interfaces/transactions"
import LPStakingBanner from "./LPStakingBanner"
import MyFarm from "./MyFarm"
import MyShareCard from "./MyShareCard"
import PoolInfoCard from "./PoolInfoCard"
import ReviewDeposit from "./ReviewDeposit"
import TokenInput from "./TokenInput"
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
  const theme = useTheme()
  const isLgDown = useMediaQuery(theme.breakpoints.down("lg"))

  return (
    <Container maxWidth={isLgDown ? "sm" : "lg"} sx={{ pt: 5, pb: 10 }}>
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

      <Stack
        display="flex"
        direction={{ xs: "column", lg: "row" }}
        spacing={4}
        alignItems={{ xs: "center", lg: "flex-start" }}
      >
        <Box
          flex={1}
          justifyContent="center"
          alignItems="center"
          marginX="auto"
          width="100%"
        >
          <Paper>
            <Box p={3}>
              <Typography variant="h2">{t("addLiquidity")}</Typography>
              {exceedsWallet ? (
                <Typography variant="body1" color="error" textAlign="center">
                  {t("depositBalanceExceeded")}
                </Typography>
              ) : null}
              {poolData?.isPaused && poolData?.name === VETH2_POOL_NAME ? (
                <Typography variant="body1" color="error" textAlign="center">
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
                </Typography>
              ) : null}
              <Stack direction="column" spacing={2}>
                {tokens.map((token, index) => (
                  <TokenInput
                    key={index}
                    {...token}
                    disabled={poolData?.isPaused}
                    onChange={(value): void =>
                      onChangeTokenInputValue(token.symbol, value)
                    }
                  />
                ))}
              </Stack>
              <Box
                sx={{
                  display: shouldDisplayWrappedOption ? "block" : "none",
                  mt: 2,
                }}
              >
                <Checkbox
                  onChange={onToggleDepositWrapped}
                  checked={shouldDepositWrapped}
                />
                <Typography component="span" variant="body1">
                  {t("depositWrapped")}
                </Typography>
              </Box>
              <div className={"transactionInfoContainer"}>
                <Stack mt={4} spacing={1}>
                  {/* TODO: Check the style of KEEP APR */}
                  {poolData?.aprs?.keep?.apr.gt(Zero) && (
                    <div>
                      <a
                        href="https://docs.saddle.finance/faq#what-are-saddles-liquidity-provider-rewards"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{`KEEP APR:`}</span>
                      </a>{" "}
                      <Typography component="span" variant="body1">
                        {formatBNToPercentString(poolData.aprs.keep.apr, 18)}
                      </Typography>
                    </div>
                  )}
                  {poolData?.aprs?.sharedStake?.apr.gt(Zero) && (
                    <div>
                      <a
                        href="https://docs.saddle.finance/faq#what-are-saddles-liquidity-provider-rewards"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{`SGT APR:`}</span>
                      </a>{" "}
                      <Typography component="span" variant="body1">
                        {formatBNToPercentString(
                          poolData.aprs.sharedStake.apr,
                          18,
                        )}
                      </Typography>
                    </div>
                  )}
                  <div>
                    {transactionData.priceImpact.gte(0) ? (
                      <Typography
                        component="span"
                        variant="body1"
                        color="primary"
                      >{`${t("bonus")}: `}</Typography>
                    ) : (
                      <Typography
                        component="span"
                        variant="body1"
                        color="error"
                      >
                        {t("priceImpact")}
                      </Typography>
                    )}
                    <Typography
                      component="span"
                      color={
                        transactionData.priceImpact.gte(0) ? "primary" : "error"
                      }
                    >
                      {" "}
                      {formatBNToPercentString(
                        transactionData.priceImpact,
                        18,
                        4,
                      )}
                    </Typography>
                  </div>
                </Stack>
              </div>
            </Box>
          </Paper>

          <AdvancedOptions />
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={(): void => {
              setCurrentModal("review")
            }}
            disabled={!validDepositAmount || poolData?.isPaused}
            sx={{ mt: 3 }}
          >
            {t("deposit")}
          </Button>
        </Box>

        {/* <Box width={["90%", "50%"]} paddingTop={2}>
              <Button variant="primary" size="lg" width="100%">
                {t("depositAndStake")}
              </Button>
            </Box> */}
        {/* <Stack spacing={4} flex={1}> */}
        <Stack direction="column" flex={1} spacing={4} width="100%">
          {poolData && (
            <MyFarm
              lpWalletBalance={myShareData?.lpTokenBalance || Zero}
              poolName={poolData.name}
            />
          )}
          <Paper>
            <Box p={4}>
              <MyShareCard data={myShareData} />
              <Divider
                sx={{
                  display: myShareData ? "block" : "none",
                }}
              />
              <PoolInfoCard data={poolData} />
            </Box>
          </Paper>
        </Stack>
      </Stack>

      <Dialog
        open={!!currentModal}
        onClose={(): void => setCurrentModal(null)}
        scroll="body"
      >
        {currentModal === "review" ? (
          <ReviewDeposit
            transactionData={transactionData}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onConfirm={async (): Promise<void> => {
              setCurrentModal("confirm")
              logEvent("deposit", (poolData && { pool: poolData?.name }) || {})
              await onConfirmTransaction?.()
              setCurrentModal(null)
            }}
            onClose={(): void => setCurrentModal(null)}
          />
        ) : null}
        {currentModal === "confirm" ? <ConfirmTransaction /> : null}
      </Dialog>
    </Container>
  )
}

export default DepositPage
