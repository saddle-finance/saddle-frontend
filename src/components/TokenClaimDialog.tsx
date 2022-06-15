import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  Typography,
} from "@mui/material"
import { BasicPool, BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { ChainId, IS_VESDL_LIVE, SDL_TOKEN } from "../constants"
import React, {
  ReactElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { Trans, useTranslation } from "react-i18next"
import { commify, formatBNToString, getContract } from "../utils"
import { enqueuePromiseToast, enqueueToast } from "./Toastify"
import {
  useMiniChefContract,
  useMinterContract,
  useRetroactiveVestingContract,
} from "../hooks/useContract"

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import { BigNumber } from "@ethersproject/bignumber"
import { ContractTransaction } from "@ethersproject/contracts"
import Dialog from "./Dialog"
import { GaugeContext } from "../providers/GaugeProvider"
import { GaugeReward } from "../utils/gauges"
import LIQUIDITY_GAUGE_V5_ABI from "../constants/abis/liquidityGaugeV5.json"
import { LiquidityGaugeV5 } from "../../types/ethers-contracts/LiquidityGaugeV5"
import { RewardsBalancesContext } from "../providers/RewardsBalancesProvider"
import { UserStateContext } from "../providers/UserStateProvider"
import { Zero } from "@ethersproject/constants"
import logo from "../assets/icons/logo.svg"
import { useActiveWeb3React } from "../hooks"
import useAddTokenToMetamask from "../hooks/useAddTokenToMetamask"
import { useRetroMerkleData } from "../hooks/useRetroMerkleData"

// TODO: update token launch link

interface TokenClaimDialogProps {
  open: boolean
  onClose: () => void
}
export default function TokenClaimDialog({
  open,
  onClose,
}: TokenClaimDialogProps): ReactElement {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const basicPools = useContext(BasicPoolsContext)
  const userState = useContext(UserStateContext)
  const gaugeData = useContext(GaugeContext)
  const gaugesWithPoolName = useMemo<
    ({
      poolName: string
      address: string
      rewards: GaugeReward[]
    } | null)[]
  >(() => {
    return Object.values(basicPools || {})
      .map((pool) => {
        const gauge = gaugeData.gauges[pool.poolAddress]
        if (!gauge) return null
        return {
          poolName: pool.poolName,
          address: gauge.address,
          rewards: gauge.rewards,
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        const [rewardBalA, rewardBalB] = [
          userState?.gaugeRewards?.[a?.address ?? ""]?.claimableSDL,
          userState?.gaugeRewards?.[b?.address ?? ""]?.claimableSDL,
        ]
        return (rewardBalA || Zero).gte(rewardBalB || Zero) ? -1 : 1
      })
  }, [basicPools, gaugeData.gauges, userState?.gaugeRewards])

  const isClaimableNetwork =
    chainId === ChainId.MAINNET ||
    chainId === ChainId.ARBITRUM ||
    chainId === ChainId.HARDHAT ||
    chainId === ChainId.ROPSTEN ||
    chainId === ChainId.EVMOS

  const rewardBalances = useContext(RewardsBalancesContext)
  const {
    claimsStatuses,
    claimPoolReward,
    claimAllPoolsRewards,
    claimGaugeReward,
    claimRetroReward,
  } = useRewardClaims()
  const { addToken, canAdd } = useAddTokenToMetamask({
    ...SDL_TOKEN,
  })

  const formattedUnclaimedTokenbalance = commify(
    formatBNToString(rewardBalances.total, 18, 0),
  )
  const formattedTotalRetroDrop = commify(
    formatBNToString(rewardBalances.retroactiveTotal, 18, 2),
  )

  const [allPoolsWithRewards, poolsWithUserRewards] = useMemo(() => {
    if (!basicPools) return [[], []]
    const allPoolsWithRewards = Object.values(basicPools)
      .filter(({ miniChefRewardsPid }) => {
        // remove pools not in this chain and without rewards
        return miniChefRewardsPid !== null
      })
      .sort(({ poolName: nameA }, { poolName: nameB }) => {
        const [rewardBalA, rewardBalB] = [
          rewardBalances[nameA],
          rewardBalances[nameB],
        ]
        return (rewardBalA || Zero).gte(rewardBalB || Zero) ? -1 : 1
      })
    const poolsWithUserRewards = allPoolsWithRewards.filter(({ poolName }) => {
      const hasUserRewards = rewardBalances[poolName]?.gt(Zero)
      return !!hasUserRewards
    })
    return [allPoolsWithRewards, poolsWithUserRewards]
  }, [basicPools, rewardBalances])

  return (
    <Dialog
      open={open}
      scroll="body"
      onClose={onClose}
      data-testid="tokenClaimDialog"
    >
      <Box
        py="35px"
        sx={{
          backgroundImage: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(180deg, #000 0%, rgba(7,7,19,1) 25%, #341291 50%,rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%), radial-gradient(circle, rgba(18,19,52,1) 0%, #000 100%)"
              : `linear-gradient(180deg, #FFF 25%, #FAF3CE 50%,#FFF 50%, #FFF 100%)`,
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width={170}
          height={170}
          borderRadius="50%"
          marginX="auto"
          boxShadow="0px 4px 20px rgba(255, 255, 255, 0.25)"
          sx={{
            backgroundImage: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(0deg, #000 0%, #341291 100%)"
                : "linear-gradient(180deg, #FFF 0%, #FBF4CF 100%)",
          }}
        >
          <img src={logo} width={138} height={138} />
        </Box>
      </Box>
      <Alert color="info" severity="warning" sx={{ m: 4 }}>
        {t("migrationGaugeWarningMsg")}
      </Alert>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        data-testid="tknClaimContainer"
      >
        <Typography variant="h1">{formattedUnclaimedTokenbalance}</Typography>

        {canAdd && (
          <IconButton
            onClick={() => addToken()}
            color="primary"
            disabled={!isClaimableNetwork}
            data-testid="tokenAddBtn"
          >
            <AddCircleOutlineIcon fontSize="large" />
          </IconButton>
        )}
      </Box>
      <Typography variant="body1" textAlign="center">
        {t("totalClaimableSDL")}
      </Typography>
      <Box mx={{ xs: 2, md: 5 }} mb={3}>
        <List data-testid="claimsListContainer">
          {rewardBalances.retroactive && isClaimableNetwork && (
            <>
              <ClaimListItem
                title={t("retroactiveDrop")}
                amount={rewardBalances.retroactive || Zero}
                claimCallback={() => claimRetroReward()}
                status={claimsStatuses["retroactive"]}
              />

              <Typography sx={{ ml: 2 }}>
                {t("totalRetroactiveDrop")} {formattedTotalRetroDrop}
              </Typography>

              {Boolean(
                IS_VESDL_LIVE ? gaugesWithPoolName.length : allPoolsWithRewards,
              ) && <div style={{ height: "32px" }} />}
            </>
          )}
          {!isClaimableNetwork && (
            <Typography style={{ whiteSpace: "pre-line" }}>
              <Trans i18nKey="disableRewardContent">
                SDL is currently only deployed on Ethereum Mainnet and is not
                yet claimable on this chain. We display the amount that will be
                claimable once SDL is available on this network. See
                <Link
                  href="https://docs.saddle.finance/saddle-faq#why-cant-i-claim-my-sdl-on-arbitrum"
                  color="secondary"
                  target="_blank"
                >
                  this post
                </Link>
                for more information.
              </Trans>
            </Typography>
          )}
          {!IS_VESDL_LIVE && chainId === ChainId.MAINNET
            ? allPoolsWithRewards.map((pool, i, arr) => (
                <React.Fragment key={pool.poolName}>
                  <ClaimListItem
                    title={pool.poolName}
                    amount={rewardBalances[pool.poolName] || Zero}
                    claimCallback={() => claimPoolReward(pool)}
                    status={
                      claimsStatuses["allPools"] ||
                      claimsStatuses[pool.poolName]
                    }
                  />
                  {i < arr.length - 1 && <Divider key={i} />}
                </React.Fragment>
              ))
            : gaugesWithPoolName?.map((gauge, i, arr) => {
                const userClaimableSdl =
                  userState?.gaugeRewards?.[gauge?.address || ""]?.claimableSDL

                return (
                  userClaimableSdl?.gt(Zero) && (
                    <React.Fragment key={gauge?.poolName}>
                      <ClaimListItem
                        title={gauge?.poolName ?? ""}
                        amount={userClaimableSdl ?? Zero}
                        claimCallback={() => claimGaugeReward(gauge)}
                        status={
                          claimsStatuses["allGauges"] ||
                          claimsStatuses[gauge?.poolName ?? ""]
                        }
                      />
                      {i < arr.length - 1 && <Divider key={i} />}
                    </React.Fragment>
                  )
                )
              })}
        </List>

        <Typography my={3}>
          <Trans i18nKey="saddleTokenInfo" t={t}>
            SDL token is launched by Saddle Finance. Read more about token
            distribution{" "}
            <Link
              href="https://blog.saddle.finance/introducing-sdl"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline" }}
            >
              here
            </Link>
          </Trans>
        </Typography>

        {/* TODO: Follow up potentially P1 for gauges */}
        {!IS_VESDL_LIVE && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={poolsWithUserRewards.length < 2}
            onClick={() => claimAllPoolsRewards(poolsWithUserRewards)}
          >
            {t("claimForAllPools")}
          </Button>
        )}
      </Box>
    </Dialog>
  )
}

function ClaimListItem({
  title,
  amount,
  claimCallback,
  status,
}: {
  title: string
  amount: BigNumber
  claimCallback: () => void
  status?: STATUSES
}): ReactElement {
  const { t } = useTranslation()
  const formattedAmount = commify(formatBNToString(amount, 18, 2))
  const disabled =
    status === STATUSES.PENDING ||
    status === STATUSES.SUCCESS ||
    amount.lt(BigNumber.from(10).pow(16)) // don't let anyone try to claim less than 0.01 token
  return (
    <ListItem>
      <Typography variant="subtitle1" sx={{ flex: 1 }}>
        {title}
      </Typography>
      <Typography sx={{ flex: 1 }}>
        {status === STATUSES.SUCCESS ? 0 : formattedAmount}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={claimCallback}
        disabled={disabled}
      >
        {t("claim")}
      </Button>
    </ListItem>
  )
}

enum STATUSES {
  PENDING,
  SUCCESS,
  ERROR,
}
type PendingClaimsKeys = string | "allPools" | "allGauges" | "retroactive"
type PendingClaims = Record<PendingClaimsKeys, STATUSES>
function useRewardClaims() {
  const { chainId, account, library } = useActiveWeb3React()
  const rewardsContract = useMiniChefContract()
  const minterContract = useMinterContract()
  const retroRewardsContract = useRetroactiveVestingContract()
  const userMerkleData = useRetroMerkleData() // @dev todo hoist this to avoid refetches
  const [pendingClaims, setPendingClaims] = useState<PendingClaims>(
    {} as PendingClaims,
  )
  const updateClaimStatus = useCallback(
    (key: string, status: STATUSES) => {
      setPendingClaims((state) => ({
        ...state,
        [key]: status,
      }))
    },
    [setPendingClaims],
  )

  const claimPoolReward = useCallback(
    async (pool: BasicPool) => {
      if (!chainId || !account || !rewardsContract) return
      try {
        const pid = pool.miniChefRewardsPid
        if (pid === null) return
        updateClaimStatus(pool.poolName, STATUSES.PENDING)
        let txn: ContractTransaction
        if (chainId === ChainId.MAINNET) {
          txn = await rewardsContract.harvest(pid, account)
        } else {
          txn = await rewardsContract.deposit(pid, Zero, account)
        }
        await enqueuePromiseToast(chainId, txn.wait(), "claim", {
          poolName: pool.poolName,
        })
        updateClaimStatus(pool.poolName, STATUSES.SUCCESS)
      } catch (e) {
        console.error(e)
        updateClaimStatus(pool.poolName, STATUSES.ERROR)
        enqueueToast("error", "Unable to claim reward")
      }
    },
    [chainId, account, rewardsContract, updateClaimStatus],
  )

  const claimGaugeReward = useCallback(
    async (
      gauge: {
        poolName: string
        address: string
        rewards: GaugeReward[]
      } | null,
    ) => {
      if (!chainId || !account || !minterContract || !library || !gauge) return
      try {
        updateClaimStatus(gauge.poolName, STATUSES.PENDING)
        const claimPromises = []
        if (gauge.rewards.length > 0 && gauge.address) {
          const liquidityGaugeContract = getContract(
            gauge.address,
            LIQUIDITY_GAUGE_V5_ABI,
            library,
            account,
          ) as LiquidityGaugeV5
          claimPromises.push(
            liquidityGaugeContract["claim_rewards(address)"](account),
          )
        }
        claimPromises.push(minterContract.mint(gauge.address))
        const txns = await Promise.all(claimPromises)
        await enqueuePromiseToast(
          chainId,
          Promise.all(txns.map((txn) => txn.wait())),
          "claim",
          { poolName: gauge.poolName },
        )
        updateClaimStatus(gauge.poolName, STATUSES.SUCCESS)
      } catch (e) {
        console.error(e)
        updateClaimStatus(gauge.poolName, STATUSES.ERROR)
        enqueueToast("error", "Unable to claim reward")
      }
    },
    [chainId, account, updateClaimStatus, minterContract, library],
  )

  const claimRetroReward = useCallback(async () => {
    if (!account || !retroRewardsContract || !chainId) return
    try {
      updateClaimStatus("retroactive", STATUSES.PENDING)
      const userVesting = await retroRewardsContract.vestings(account)
      let txn
      if (userVesting?.isVerified) {
        txn = await retroRewardsContract.claimReward(account)
      } else if (userMerkleData) {
        txn = await retroRewardsContract.verifyAndClaimReward(
          account,
          userMerkleData.amount,
          userMerkleData.proof,
        )
      } else {
        throw new Error("Unable to claim retro reward")
      }
      await enqueuePromiseToast(chainId, txn.wait(), "claim", {
        poolName: "Retroactive",
      })
      updateClaimStatus("retroactive", STATUSES.SUCCESS)
    } catch (e) {
      console.error(e)
      updateClaimStatus("retroactive", STATUSES.ERROR)
      enqueueToast("error", "Unable to claim reward")
    }
  }, [
    retroRewardsContract,
    account,
    userMerkleData,
    updateClaimStatus,
    chainId,
  ])

  const claimAllPoolsRewards = useCallback(
    async (pools: BasicPool[]) => {
      if (!chainId || !account || !rewardsContract) return
      try {
        const calls = await Promise.all(
          pools.map((pool) => {
            const pid = pool.miniChefRewardsPid as number
            if (chainId === ChainId.MAINNET) {
              return rewardsContract.populateTransaction.harvest(pid, account)
            } else {
              return rewardsContract.populateTransaction.deposit(
                pid,
                Zero,
                account,
              )
            }
          }),
        )
        updateClaimStatus("all", STATUSES.PENDING)
        const txn = await rewardsContract.batch(
          calls.map(({ data }) => data as string),
          false,
        )
        await enqueuePromiseToast(chainId, txn.wait(), "claim", {
          poolName: "All Pools",
        })
        updateClaimStatus("all", STATUSES.SUCCESS)
      } catch (e) {
        console.error(e)
        updateClaimStatus("all", STATUSES.ERROR)
        enqueueToast("error", "Unable to claim reward")
      }
    },
    [account, rewardsContract, chainId, updateClaimStatus],
  )
  return {
    claimsStatuses: pendingClaims,
    claimPoolReward,
    claimGaugeReward,
    claimAllPoolsRewards,
    claimRetroReward,
  }
}
