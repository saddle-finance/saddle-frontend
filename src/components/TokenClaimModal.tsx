import { ChainId, POOLS_MAP, Pool, SDL_TOKEN } from "../constants"
import { IconButton, Link } from "@mui/material"
import React, {
  ReactElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { Trans, useTranslation } from "react-i18next"
import { commify, formatBNToString } from "../utils"
import { notifyCustomError, notifyHandler } from "../utils/notifyHandler"
import {
  useMiniChefContract,
  useRetroactiveVestingContract,
} from "../hooks/useContract"

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import { BigNumber } from "@ethersproject/bignumber"
import Button from "./Button"
import { RewardsBalancesContext } from "../providers/RewardsBalancesProvider"
import { Zero } from "@ethersproject/constants"
import logo from "../assets/icons/logo.svg"
import styles from "./TokenClaimModal.module.scss"
import { useActiveWeb3React } from "../hooks"
import useAddTokenToMetamask from "../hooks/useAddTokenToMetamask"
import { useRetroMerkleData } from "../hooks/useRetroMerkleData"

// TODO: update token launch link
export default function TokenClaimModal(): ReactElement {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const isClaimableNetwork =
    chainId === ChainId.MAINNET ||
    chainId === ChainId.HARDHAT ||
    chainId === ChainId.ROPSTEN

  console.log("is claimable network =>", isClaimableNetwork)

  const rewardBalances = useContext(RewardsBalancesContext)
  const {
    claimsStatuses,
    claimPoolReward,
    claimAllPoolsRewards,
    claimRetroReward,
  } = useRewardClaims()
  const { addToken, canAdd } = useAddTokenToMetamask({
    ...SDL_TOKEN,
    icon: `${window.location.origin}/logo.svg`,
  })

  const formattedUnclaimedTokenbalance = commify(
    formatBNToString(rewardBalances.total, 18, 0),
  )
  const formattedTotalRetroDrop = commify(
    formatBNToString(rewardBalances.retroactiveTotal, 18, 2),
  )
  const [allPoolsWithRewards, poolsWithUserRewards] = useMemo(() => {
    if (!chainId) return [[], []]
    const allPoolsWithRewards = Object.values(POOLS_MAP)
      .filter(({ addresses, rewardPids }) => {
        // remove pools not in this chain and without rewards
        const isChainPool = !!addresses[chainId]
        const hasRewards = rewardPids[chainId] !== null
        return isChainPool && hasRewards
      })
      .sort(({ name: nameA }, { name: nameB }) => {
        const [rewardBalA, rewardBalB] = [
          rewardBalances[nameA],
          rewardBalances[nameB],
        ]
        return (rewardBalA || Zero).gte(rewardBalB || Zero) ? -1 : 1
      })
    const poolsWithUserRewards = allPoolsWithRewards.filter(({ name }) => {
      const hasUserRewards = rewardBalances[name]?.gt(Zero)
      return !!hasUserRewards
    })
    return [allPoolsWithRewards, poolsWithUserRewards]
  }, [chainId, rewardBalances])

  return (
    <div data-testid="tknClaimContainer" className={styles.container}>
      <div className={styles.gradient}></div>
      <div className={styles.logoWrapper}>
        <div className={styles.logo}>
          <img src={logo} />
        </div>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.tokenBalance}>
          {formattedUnclaimedTokenbalance}

          {canAdd && (
            <IconButton
              onClick={() => addToken()}
              color="primary"
              disabled={!isClaimableNetwork}
            >
              <AddCircleOutlineIcon fontSize="large" />
            </IconButton>
          )}
        </div>
        <div className={styles.tokenBalanceHelpText}>
          {t("totalClaimableSDL")}
        </div>
        <ul data-testid="claimsListContainer" className={styles.claimsList}>
          {rewardBalances.retroactive && isClaimableNetwork && (
            <>
              <ClaimListItem
                title={t("retroactiveDrop")}
                amount={rewardBalances.retroactive || Zero}
                claimCallback={() => claimRetroReward()}
                status={claimsStatuses["retroactive"]}
              />
              <div className={styles.info}>
                {t("totalRetroactiveDrop")} {formattedTotalRetroDrop}
              </div>
              {!!allPoolsWithRewards.length && (
                <div style={{ height: "32px" }} />
              )}
            </>
          )}
          {!isClaimableNetwork && (
            <p style={{ whiteSpace: "pre-line" }}>
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
            </p>
          )}
          {allPoolsWithRewards.map((pool, i, arr) => (
            <>
              <ClaimListItem
                title={pool.name}
                amount={rewardBalances[pool.name] || Zero}
                claimCallback={() => claimPoolReward(pool)}
                status={claimsStatuses["allPools"] || claimsStatuses[pool.name]}
                key={pool.name}
              />
              {i < arr.length - 1 && <Divider key={i} />}
            </>
          ))}
        </ul>
        <div className={styles.info}>
          <span>
            <Trans i18nKey="saddleTokenInfo" t={t}>
              SDL token is launched by Saddle Finance. Read more about token
              distribution{" "}
              <a
                href="https://blog.saddle.finance/introducing-sdl"
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "underline" }}
              >
                here
              </a>
            </Trans>
          </span>
        </div>
        {
          <Button
            onClick={() => claimAllPoolsRewards(poolsWithUserRewards)}
            fullWidth
            disabled={poolsWithUserRewards.length < 2}
          >
            {t("claimForAllPools")}
          </Button>
        }
      </div>
    </div>
  )
}

const Divider = (): ReactElement => <div className={styles.divider}></div>

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
    <li className={styles.listItem}>
      <b className={styles.listItemTitle}>{title}</b>
      <span>{status === STATUSES.SUCCESS ? 0 : formattedAmount}</span>
      <Button
        onClick={claimCallback}
        size="medium"
        kind="primary"
        disabled={disabled}
      >
        {t("claim")}
      </Button>
    </li>
  )
}

enum STATUSES {
  PENDING,
  SUCCESS,
  ERROR,
}
type PendingClaimsKeys = string | "allPools" | "retroactive"
type PendingClaims = Record<PendingClaimsKeys, STATUSES>
function useRewardClaims() {
  const { chainId, account } = useActiveWeb3React()
  const rewardsContract = useMiniChefContract()
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
    async (pool: Pool) => {
      if (!chainId || !account || !rewardsContract) return
      try {
        const pid = pool.rewardPids[chainId]
        if (pid === null) return
        updateClaimStatus(pool.name, STATUSES.PENDING)
        const txn = await rewardsContract.harvest(pid, account)
        notifyHandler(txn?.hash, "claim")
        await txn?.wait()
        updateClaimStatus(pool.name, STATUSES.SUCCESS)
      } catch (e) {
        console.error(e)
        updateClaimStatus(pool.name, STATUSES.ERROR)
        notifyCustomError({
          ...(e as Error),
          message: "Unable to claim reward",
        })
      }
    },
    [chainId, account, rewardsContract, updateClaimStatus],
  )
  const claimRetroReward = useCallback(async () => {
    if (!account || !retroRewardsContract) return
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
      notifyHandler(txn?.hash, "claim")
      await txn?.wait()
      updateClaimStatus("retroactive", STATUSES.SUCCESS)
    } catch (e) {
      console.error(e)
      updateClaimStatus("retroactive", STATUSES.ERROR)
      notifyCustomError({ ...(e as Error), message: "Unable to claim reward" })
    }
  }, [retroRewardsContract, account, userMerkleData, updateClaimStatus])

  const claimAllPoolsRewards = useCallback(
    async (pools: Pool[]) => {
      if (!chainId || !account || !rewardsContract) return
      try {
        const calls = await Promise.all(
          pools.map((pool) => {
            const pid = pool.rewardPids[chainId] as number
            return rewardsContract.populateTransaction.harvest(pid, account)
          }),
        )
        updateClaimStatus("all", STATUSES.PENDING)
        const txn = await rewardsContract.batch(
          calls.map(({ data }) => data as string),
          false,
        )
        notifyHandler(txn?.hash, "claim")
        await txn?.wait()
        updateClaimStatus("all", STATUSES.SUCCESS)
      } catch (e) {
        console.error(e)
        updateClaimStatus("all", STATUSES.ERROR)
        notifyCustomError({
          ...(e as Error),
          message: "Unable to claim reward",
        })
      }
    },
    [account, rewardsContract, chainId, updateClaimStatus],
  )
  return {
    claimsStatuses: pendingClaims,
    claimPoolReward,
    claimAllPoolsRewards,
    claimRetroReward,
  }
}
