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
import { GaugeReward, areGaugesActive } from "../utils/gauges"
import React, {
  ReactElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { Trans, useTranslation } from "react-i18next"
import { commify, formatBNToString } from "../utils"
import { enqueuePromiseToast, enqueueToast } from "./Toastify"
import {
  useMiniChefContract,
  useRetroactiveVestingContract,
} from "../hooks/useContract"

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../constants/networks"
import { ContractTransaction } from "@ethersproject/contracts"
import Dialog from "./Dialog"
import { GaugeContext } from "../providers/GaugeProvider"
import { RewardsBalancesContext } from "../providers/RewardsBalancesProvider"
import { SDL_TOKEN } from "../constants"
import { UserStateContext } from "../providers/UserStateProvider"
import { Zero } from "@ethersproject/constants"
import logo from "../assets/icons/logo.svg"
import { useActiveWeb3React } from "../hooks"
import useAddTokenToMetamask from "../hooks/useAddTokenToMetamask"
import { useRetroMerkleData } from "../hooks/useRetroMerkleData"
import useUserGauge from "../hooks/useUserGauge"

// TODO: update token launch link

type GaugesWithName = {
  gaugeName: string
  address: string
  rewards: GaugeReward[]
}

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
  const { gauges } = useContext(GaugeContext)
  const gaugesWithName = useMemo<GaugesWithName[]>(() => {
    if (!basicPools || !userState?.gaugeRewards) return []
    return (
      Object.values(gauges)
        .map(({ gaugeName, rewards, address }) => {
          return {
            gaugeName,
            address,
            rewards,
          }
        })
        .filter(Boolean) as GaugesWithName[]
    ).sort((a, b) => {
      const [rewardBalA, rewardBalB] = [
        userState.gaugeRewards?.[a.address]?.claimableSDL,
        userState.gaugeRewards?.[b.address]?.claimableSDL,
      ]
      return (rewardBalA || Zero).gte(rewardBalB || Zero) ? -1 : 1
    })
  }, [basicPools, gauges, userState?.gaugeRewards])

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

  const gaugesAreActive = areGaugesActive(chainId)

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
                items={[
                  [t("retroactiveDrop"), rewardBalances.retroactive || Zero],
                ]}
                claimCallback={() => void claimRetroReward()}
                status={claimsStatuses["retroactive"]}
              />

              <Typography sx={{ ml: 2 }}>
                {t("totalRetroactiveDrop")} {formattedTotalRetroDrop}
              </Typography>

              {Boolean(
                gaugesAreActive ? gaugesWithName.length : allPoolsWithRewards,
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
          {!gaugesAreActive
            ? allPoolsWithRewards.map((pool, i, arr) => (
                <React.Fragment key={pool.poolName}>
                  <ClaimListItem
                    items={[
                      [pool.poolName, rewardBalances[pool.poolName] || Zero],
                    ]}
                    claimCallback={() => void claimPoolReward(pool)}
                    status={
                      claimsStatuses["allPools"] ||
                      claimsStatuses[pool.poolName]
                    }
                  />
                  {i < arr.length - 1 && <Divider key={i} />}
                </React.Fragment>
              ))
            : gaugesWithName?.map((gauge, i, arr) => {
                const poolGaugeRewards =
                  userState?.gaugeRewards?.[gauge?.address || ""]
                const userClaimableSdl = poolGaugeRewards?.claimableSDL
                const userClaimableOtherRewards: [string, BigNumber][] = (
                  poolGaugeRewards?.claimableExternalRewards || []
                ).map(({ amount, token }) => {
                  return [token?.symbol || "", amount]
                })
                const shouldShow = Boolean(
                  userClaimableSdl?.gt(Zero) ||
                    userClaimableOtherRewards.length,
                )

                return (
                  shouldShow && (
                    <React.Fragment key={gauge?.gaugeName}>
                      <ClaimListItem
                        title={gauge?.gaugeName}
                        items={[
                          ["SDL", userClaimableSdl ?? Zero],
                          ...userClaimableOtherRewards,
                        ]}
                        claimCallback={() => void claimGaugeReward(gauge)}
                        status={
                          claimsStatuses["allGauges"] ||
                          claimsStatuses[gauge?.gaugeName ?? ""]
                        }
                      />
                      {i < arr.length - 1 && <Divider key={i} />}
                    </React.Fragment>
                  )
                )
              })}
          {/* Case when user has rewards left to claim on minichef */}
          {gaugesAreActive && poolsWithUserRewards.length > 0 && (
            <>
              <Typography sx={{ mt: 2 }} variant="h2">
                Outdated Rewards
              </Typography>
              {allPoolsWithRewards
                .filter((pool) => rewardBalances[pool.poolName].gt(Zero))
                .map((pool, i, arr) => (
                  <React.Fragment key={`${pool.poolName}-outdated`}>
                    <ClaimListItem
                      key={`${pool.poolName}-outdated`}
                      items={[
                        [pool.poolName, rewardBalances[pool.poolName] || Zero],
                      ]}
                      claimCallback={() => void claimPoolReward(pool)}
                      status={
                        claimsStatuses["allPools"] ||
                        claimsStatuses[pool.poolName]
                      }
                    />
                    {i < arr.length - 1 && <Divider key={i} />}
                  </React.Fragment>
                ))}
            </>
          )}
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
        {gaugesAreActive && poolsWithUserRewards.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={poolsWithUserRewards.length < 2}
            onClick={() => void claimAllPoolsRewards(poolsWithUserRewards)}
          >
            {t("claimForAllOutdatedPools")}
          </Button>
        )}
      </Box>
    </Dialog>
  )
}

function ClaimListItem({
  claimCallback,
  status,
  items,
  title,
}: {
  title?: string
  claimCallback: () => void
  items: [string, BigNumber][]
  status?: STATUSES
}): ReactElement {
  const { t } = useTranslation()
  const disabled =
    status === STATUSES.PENDING ||
    status === STATUSES.SUCCESS ||
    items.every(([, amount]) => amount.isZero())
  // @dev - our formatting assumes all tokens are 1e18
  return (
    <ListItem>
      <Typography variant="subtitle1" sx={{ flex: 1 }}>
        {title && (
          <>
            {title}
            <br />
          </>
        )}
        {items.map(([name]) => (
          <>
            {name}
            <br />
          </>
        ))}
      </Typography>
      <Typography sx={{ flex: 1 }}>
        {title && <br />}
        {items.map(([, amount]) => (
          <>
            {status === STATUSES.SUCCESS
              ? 0
              : commify(formatBNToString(amount, 18, 2))}
            <br />
          </>
        ))}
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
  const { chainId, account } = useActiveWeb3React()
  const rewardsContract = useMiniChefContract()
  const retroRewardsContract = useRetroactiveVestingContract()
  const getUserGauge = useUserGauge()
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
        const txn: ContractTransaction = await rewardsContract.harvest(
          pid,
          account,
        )
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
        gaugeName: string
        address: string
        rewards: GaugeReward[]
      } | null,
    ) => {
      const userGauge = getUserGauge(gauge?.address)
      if (!gauge || !userGauge || !chainId) {
        enqueueToast("error", "Unable to claim reward")
        return
      }
      try {
        updateClaimStatus(gauge.gaugeName, STATUSES.PENDING)
        const txns = await userGauge.claim()
        const receipts = Promise.all((txns || []).map((txn) => txn.wait()))
        await enqueuePromiseToast(chainId, receipts, "claim", {
          poolName: gauge.gaugeName,
        })

        await receipts
        updateClaimStatus(gauge.gaugeName, STATUSES.SUCCESS)
      } catch {
        // Error toast already handled by claim()
        updateClaimStatus(gauge.gaugeName, STATUSES.ERROR)
      }
    },
    [getUserGauge, chainId, updateClaimStatus],
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
            return rewardsContract.populateTransaction.harvest(pid, account)
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
