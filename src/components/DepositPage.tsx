import {
  ALETH_POOL_NAME,
  PoolName,
  TBTC_METAPOOL_V2_NAME,
  VETH2_POOL_NAME,
  isMetaPool,
} from "../constants"
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { PoolDataType, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { commify, formatBNToPercentString, formatBNToString } from "../utils"

import AdvancedOptions from "./AdvancedOptions"
import ConfirmTransaction from "./ConfirmTransaction"
import { DepositTransaction } from "../interfaces/transactions"
import Dialog from "./Dialog"
import LPStakingBanner from "./LPStakingBanner"
import MyFarm from "./MyFarm"
import MyShareCard from "./MyShareCard"
import PoolInfoCard from "./PoolInfoCard"
import ReviewDeposit from "./ReviewDeposit"
import TokenInput from "./TokenInput"
import { Zero } from "@ethersproject/constants"
// import { enqueuePromiseToast } from "./Toastify"
import { logEvent } from "../utils/googleAnalytics"
// import { useActiveWeb3React } from "../hooks"
import { useRewardsHelpers } from "../hooks/useRewardsHelpers"

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
  console.log({ myShareData })

  const { unstake, amountStaked } = useRewardsHelpers(
    poolData?.name as PoolName,
  )
  console.log({ poolData, unstake, amountStaked })
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const validDepositAmount = transactionData.to.totalAmount.gt(0)
  const shouldDisplayWrappedOption = isMetaPool(poolData?.name)
  const theme = useTheme()
  const isLgDown = useMediaQuery(theme.breakpoints.down("lg"))
  // const { account, chainId } = useActiveWeb3React()
  // TODO: import gauge addr from GaugeProvider context.
  // const liquidityGauge = new Contract(LiquidityGaugeAddr, LiquidityGaugeABI, library)

  const onMigrateToGaugeClick = () => {
    void unstake(amountStaked)
    // TODO: stake into new contract
    // const depositTxn = await liquidityGauge.deposit(myShareData.lpTokenBalance, account, true)
    // await enqueuePromiseToast(chainId, depositTxn.wait(), "deposit")
  }

  const veSDLFeatureReady = true // TODO: delete after release.

  return (
    <Container maxWidth={isLgDown ? "sm" : "lg"} sx={{ pt: 5, pb: 10 }}>
      {poolData?.name === VETH2_POOL_NAME &&
        myShareData?.lpTokenBalance.gt(0) && (
          <LPStakingBanner stakingLink={"https://www.sharedstake.org/earn"} />
        )}
      {poolData?.name === ALETH_POOL_NAME &&
        myShareData?.lpTokenBalance.gt(0) && (
          <LPStakingBanner stakingLink={"https://app.alchemix.fi/farms"} />
        )}
      {poolData?.name === TBTC_METAPOOL_V2_NAME && (
        <Alert icon={false} sx={{ mb: 2 }}>
          <Typography>
            {t("incentivesMigratedFromKeepToT")} &lt;
            <Link
              href="https://forum.keep.network/t/repurpose-saddle-tbtc-pool-liquidity-incentives-and-move-incentives-to-t/404"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("learnMore")}
            </Link>
            &gt;
          </Typography>
        </Alert>
      )}
      {veSDLFeatureReady && (
        // {amountStaked.gt(Zero) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-around">
            <Typography>
              {t("migrateToGauge", { farmName: poolData?.name })}
            </Typography>
            <Button
              sx={{ minWidth: 192 }}
              variant="contained"
              color="secondary"
              size="large"
              onClick={onMigrateToGaugeClick}
            >
              {t("exitToMigrate")}
            </Button>
          </Box>
        </Alert>
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
                  {poolData?.claimableAmount?.threshold?.gt(Zero) && (
                    <Box>
                      Claimable Threshold Amount:{" "}
                      {commify(
                        formatBNToString(
                          poolData?.claimableAmount?.threshold,
                          18,
                          4,
                        ),
                      )}
                    </Box>
                  )}
                  {poolData?.aprs?.threshold?.apr.gt(Zero) && (
                    <div>
                      <a
                        href="https://docs.saddle.finance/faq#what-are-saddles-liquidity-provider-rewards"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{`Threshold APR:`}</span>
                      </a>{" "}
                      <Typography component="span" variant="body1">
                        {formatBNToPercentString(
                          poolData.aprs.threshold.apr,
                          18,
                        )}
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
              <PoolInfoCard data={poolData} />
            </Box>
          </Paper>
        </Stack>
      </Stack>

      <Dialog
        open={!!currentModal}
        onClose={(): void => setCurrentModal(null)}
        maxWidth="sm"
        fullWidth
        scroll="body"
        hideClose={currentModal === "confirm"}
      >
        {currentModal === "review" ? (
          <ReviewDeposit
            transactionData={transactionData}
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
