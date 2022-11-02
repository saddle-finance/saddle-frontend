import {
  ALETH_POOL_NAME,
  TBTC_METAPOOL_V2_NAME,
  VETH2_POOL_NAME,
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
import React, { ReactElement, useContext, useEffect, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import {
  commify,
  formatBNToPercentString,
  formatBNToString,
  getContract,
} from "../utils"
import { enqueuePromiseToast, enqueueToast } from "./Toastify"

import AdvancedOptions from "./AdvancedOptions"
import ConfirmTransaction from "./ConfirmTransaction"
import { DepositBasicTransaction } from "../interfaces/transactions"
import Dialog from "./Dialog"
import { GaugeContext } from "../providers/GaugeProvider"
import LIQUIDITY_GAUGE_V5_ABI from "../constants/abis/liquidityGaugeV5.json"
import LPStakingBanner from "./LPStakingBanner"
import { LiquidityGaugeV5 } from "../../types/ethers-contracts/LiquidityGaugeV5"
import MyFarm from "./MyFarm"
import MyShareCard from "./MyShareCard"
import PoolInfoCard from "./PoolInfoCard"
import ReviewDeposit from "./ReviewDeposit"
import TokenInput from "./TokenInput"
import { Zero } from "@ethersproject/constants"
import { areGaugesActive } from "../utils/gauges"
import checkAndApproveTokenForTrade from "../utils/checkAndApproveTokenForTrade"
import { logEvent } from "../utils/googleAnalytics"
import { useActiveWeb3React } from "../hooks"
import { useLPTokenContract } from "../hooks/useContract"
import { useRewardsHelpers } from "../hooks/useRewardsHelpers"

interface Props {
  title: string
  onConfirmTransaction: () => Promise<void>
  onToggleDepositWrapped: () => void
  onChangeTokenInputValue: (tokenAddr: string, value: string) => void
  shouldDepositWrapped: boolean
  tokens: Array<{
    isOnTokenLists: boolean
    address: string
    symbol: string
    name: string
    max: string
    decimals: number
    inputValue: string
    priceUSD: number
  }>
  exceedsWallet: boolean
  poolData: PoolDataType | null
  myShareData: UserShareType | null
  transactionData: DepositBasicTransaction | null
}

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
  const { account, chainId, library } = useActiveWeb3React()
  const { unstakeMinichef, amountStakedMinichef } = useRewardsHelpers(
    poolData?.name ?? "",
  )
  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const [liquidityGaugeContract, setLiquidityGaugeContract] =
    useState<LiquidityGaugeV5 | null>(null)
  const lpTokenContract = useLPTokenContract(poolData?.name ?? "")
  const validDepositAmount = transactionData?.to.totalAmount.gt(0)
  const shouldDisplayWrappedOption = poolData?.isMetaSwap
  const theme = useTheme()
  const isLgDown = useMediaQuery(theme.breakpoints.down("lg"))
  const { gauges } = useContext(GaugeContext)
  const gaugeAddr = gauges?.[poolData?.lpToken ?? ""]?.address ?? ""
  const gaugesAreActive = areGaugesActive(chainId)

  useEffect(() => {
    if (!library || !account || !chainId || !poolData || !gaugeAddr) {
      setLiquidityGaugeContract(null)
      return
    }
    const liquidityGaugeContract = getContract(
      gaugeAddr,
      LIQUIDITY_GAUGE_V5_ABI,
      library,
      account,
    ) as LiquidityGaugeV5
    setLiquidityGaugeContract(liquidityGaugeContract)
  }, [library, account, chainId, poolData, gauges, gaugeAddr])

  const onMigrateToGaugeClick = async () => {
    if (
      !liquidityGaugeContract ||
      !chainId ||
      !account ||
      !poolData ||
      !lpTokenContract
    )
      return
    try {
      await unstakeMinichef(amountStakedMinichef)
      await checkAndApproveTokenForTrade(
        lpTokenContract,
        liquidityGaugeContract.address,
        account,
        await lpTokenContract.balanceOf(account),
        true,
        Zero, // @dev: gas not being used
        {
          onTransactionError: () => {
            throw new Error("Your transaction could not be completed")
          },
        },
        chainId,
      )
      const txn = await liquidityGaugeContract["deposit(uint256,address,bool)"](
        await lpTokenContract.balanceOf(account),
        account,
        true,
      )
      await enqueuePromiseToast(chainId, txn.wait(), "stake", {
        poolName: poolData.name,
      })
    } catch (err) {
      console.error(err)
      enqueueToast("error", "Unable to stake in gauge amount")
    }
  }

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
      {gaugesAreActive && amountStakedMinichef.gt(Zero) && (
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
              onClick={() => void onMigrateToGaugeClick()}
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
                {tokens.map(
                  (
                    {
                      address,
                      decimals,
                      symbol,
                      name,
                      priceUSD,
                      inputValue,
                      isOnTokenLists,
                      max,
                    },
                    index,
                  ) => (
                    <TokenInput
                      key={index}
                      max={max}
                      token={{
                        isOnTokenLists,
                        address,
                        decimals,
                        symbol,
                        name,
                        priceUSD,
                      }}
                      inputValue={inputValue}
                      disabled={poolData?.isPaused}
                      onChange={(value): void =>
                        onChangeTokenInputValue(address, value)
                      }
                    />
                  ),
                )}
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
                  data-testid="deposit-wrapped-checkbox"
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
                  <div>
                    {transactionData?.priceImpact.gte(0) ? (
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
                        transactionData?.priceImpact.gte(0)
                          ? "primary"
                          : "error"
                      }
                    >
                      {" "}
                      {formatBNToPercentString(
                        transactionData?.priceImpact ?? Zero,
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
              liquidityGaugeContract={liquidityGaugeContract}
              lpWalletBalance={myShareData?.lpTokenBalance || Zero}
              poolName={poolData.name}
              gaugeAddress={gaugeAddr}
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
            onConfirm={() => {
              setCurrentModal("confirm")
              logEvent("deposit", (poolData && { pool: poolData?.name }) || {})
              void onConfirmTransaction?.()
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
