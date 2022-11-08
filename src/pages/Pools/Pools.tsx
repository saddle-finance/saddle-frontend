import {
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
} from "@mui/material"
import React, { ReactElement, useContext, useEffect, useState } from "react"

import { AppState } from "../../state"
import { BigNumber } from "ethers"
import ConfirmTransaction from "../../components/ConfirmTransaction"
import Dialog from "../../components/Dialog"
import { ExpandedPoolsContext } from "../../providers/ExpandedPoolsProvider"
import PoolOverview from "../../components/PoolOverview"
import { PoolTypes } from "../../constants"
import ReviewMigration from "../../components/ReviewMigration"
import { Search } from "@mui/icons-material"
import { UserStateContext } from "../../providers/UserStateProvider"
import { Zero } from "@ethersproject/constants"
import { communityPoolsEnabled } from "../Pages"
import { getTokenAddrForPoolType } from "../../utils"
import { logEvent } from "../../utils/googleAnalytics"
import { parseUnits } from "@ethersproject/units"
import { useAccount } from "wagmi"
import { useActiveWeb3React } from "../../hooks"
import { useApproveAndMigrate } from "../../hooks/useApproveAndMigrate"
import { useHistory } from "react-router"
import { usePools } from "../../hooks/usePoolRegistryData"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

function Pools(): ReactElement | null {
  const { address } = useAccount()
  const pools = usePools()
  console.log({ xxx: pools })
  const { chainId } = useActiveWeb3React()
  const expandedPools = useContext(ExpandedPoolsContext)
  console.log({ expandedPools })
  const ePools = expandedPools.data.byName
  const userState = useContext(UserStateContext)
  const approveAndMigrate = useApproveAndMigrate()
  const { t } = useTranslation()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const history = useHistory()

  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const [activeMigration, setActiveMigration] = useState<{
    poolName: string | null
    lpTokenBalance: BigNumber
    lpTokenAddress: string
  }>({ poolName: null, lpTokenBalance: Zero, lpTokenAddress: "" })
  const [filter, setFilter] = useState<PoolTypes | "all" | "outdated">("all")
  const [communityPoolsFilter, setCommunityPoolsFilter] =
    useState<boolean>(false)
  const [poolOrTokenFilterValue, setPoolOrTokenFilterValue] =
    useState<string>("")
  const handleClickMigrate = (
    poolName: string,
    lpTokenBalance: BigNumber,
    lpTokenAddress: string,
  ) => {
    setActiveMigration({ poolName, lpTokenBalance, lpTokenAddress })
    setCurrentModal("migrate")
  }

  useEffect(() => {
    setActiveMigration({
      poolName: null,
      lpTokenBalance: Zero,
      lpTokenAddress: "",
    })
  }, [address])

  if (!ePools) return <>loading pools</>

  return (
    <Container sx={{ pb: 5 }}>
      <Stack direction="row" alignItems="center" justifyContent="center">
        {communityPoolsEnabled(chainId) && (
          <Box flex={1}>
            <TextField
              variant="standard"
              placeholder="Pool or token"
              InputProps={{
                startAdornment: <Search />,
              }}
              onChange={(e) => setPoolOrTokenFilterValue(e.target.value)}
              value={poolOrTokenFilterValue}
            />
            {communityPoolsEnabled(chainId) && (
              <Box ml={1} mt={1}>
                <FormGroup>
                  <FormControlLabel
                    label={t("communityPools")}
                    control={
                      <Checkbox
                        placeholder={t("communityPools")}
                        checked={communityPoolsFilter}
                        onChange={() =>
                          setCommunityPoolsFilter(!communityPoolsFilter)
                        }
                      />
                    }
                  />
                </FormGroup>
              </Box>
            )}
          </Box>
        )}
        <Stack direction="row" spacing={1} my={3}>
          {[
            ["all", "ALL"] as const,
            [PoolTypes.BTC, "BTC"] as const,
            [PoolTypes.ETH, "ETH"] as const,
            [PoolTypes.USD, "USD"] as const,
            ["outdated", "OUTDATED"] as const,
          ].map(([filterKey, text]) => (
            <Chip
              key={filterKey}
              variant={filter === filterKey ? "filled" : "text"}
              size="medium"
              color={filterKey === "outdated" ? "secondary" : "default"}
              label={text}
              onClick={(): void => setFilter(filterKey)}
            />
          ))}
        </Stack>

        {communityPoolsEnabled(
          chainId,
        ) /* TODO: Change when perm pool turned on */ && (
          <Box flex={1}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ float: "right" }}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              onClick={() => history.push("/pools/create")}
            >
              Create Pool
            </Button>
          </Box>
        )}
      </Stack>

      <Stack spacing={3}>
        {Object.values(pools || {})
          .filter(
            (pool) =>
              pool.poolName
                .toLowerCase()
                .includes(poolOrTokenFilterValue.toLowerCase()) ||
              ePools[pool.poolName]?.tokens.some((token) =>
                token.symbol
                  .toLowerCase()
                  .includes(poolOrTokenFilterValue.toLowerCase()),
              ),
          )
          .filter((basicPool) =>
            communityPoolsFilter ? !basicPool.isSaddleApproved : basicPool,
          )
          .filter(
            (basicPool) =>
              filter === "all" ||
              basicPool.typeOfAsset === filter ||
              (filter === "outdated" &&
                (basicPool.isMigrated ||
                  basicPool.isGuarded ||
                  basicPool.isPaused)),
          )
          .sort((a, b) => {
            // 1. user pools
            // 2. active pools
            // 3. higher TVL pools
            const expandedPoolA = ePools[a.poolName]
            const expandedPoolB = ePools[b.poolName]
            if (!expandedPoolA || !expandedPoolB) return 0
            const userLpTokenBalanceA =
              userState?.tokenBalances?.[expandedPoolA.lpToken.address] || Zero
            const userLpTokenBalanceB =
              userState?.tokenBalances?.[expandedPoolB.lpToken.address] || Zero
            const poolAssetA = parseUnits(
              String(
                tokenPricesUSD?.[
                  getTokenAddrForPoolType(a.typeOfAsset, chainId)
                ] || 0,
              ),
              18,
            )
            const poolAssetB = parseUnits(
              String(
                tokenPricesUSD?.[
                  getTokenAddrForPoolType(b.typeOfAsset, chainId)
                ] || 0,
              ),
              18,
            )
            const userBalanceUSDA = userLpTokenBalanceA
              .mul(poolAssetA)
              .div(BigNumber.from(BigInt(1e18)))
            const userBalanceUSDB = userLpTokenBalanceB
              .mul(poolAssetB)
              .div(BigNumber.from(BigInt(1e18)))
            const poolTVLUSDA = a.lpTokenSupply
              .mul(poolAssetA)
              .div(BigNumber.from(BigInt(1e18)))
            const poolTVLUSDB = b.lpTokenSupply
              .mul(poolAssetB)
              .div(BigNumber.from(BigInt(1e18)))
            const isOutdatedA = a.isMigrated || a.isGuarded || a.isPaused
            const isOutdatedB = b.isMigrated || b.isGuarded || b.isPaused
            if (userBalanceUSDA.gt(Zero) || userBalanceUSDB.gt(Zero)) {
              return userBalanceUSDA.gt(userBalanceUSDB) ? -1 : 1
            } else if (
              !(isOutdatedA && isOutdatedB) &&
              (isOutdatedA || isOutdatedB)
            ) {
              return isOutdatedA ? 1 : -1
            } else {
              return poolTVLUSDA.gt(poolTVLUSDB) ? -1 : 1
            }
          })
          .map((basicPool) => (
            <PoolOverview
              key={basicPool.poolName}
              poolName={basicPool.poolName}
              poolRoute={`/pools/${basicPool.poolName}`} // TODO address names may contain arbitrary chars
              onClickMigrate={
                basicPool.isMigrated
                  ? () => {
                      const expandedPool = ePools[basicPool.poolName]
                      if (!expandedPool) {
                        console.error("no pool found")
                        return
                      }

                      handleClickMigrate(
                        basicPool.poolName,
                        userState?.tokenBalances?.[
                          expandedPool.lpToken.address
                        ] || Zero,
                        expandedPool.lpToken.address,
                      )
                    }
                  : undefined
              }
            />
          ))}
      </Stack>
      <Dialog
        open={!!currentModal}
        onClose={(): void => setCurrentModal(null)}
        hideClose={currentModal === "confirm"}
      >
        {currentModal === "migrate" ? (
          <ReviewMigration
            onClose={(): void => {
              setCurrentModal(null)
              setActiveMigration({
                poolName: null,
                lpTokenBalance: Zero,
                lpTokenAddress: "",
              })
            }}
            onConfirm={async (): Promise<void> => {
              setCurrentModal("confirm")
              logEvent("migrate", {
                pool: activeMigration.poolName,
              })
              try {
                await approveAndMigrate(
                  activeMigration.poolName,
                  activeMigration.lpTokenBalance,
                )
              } catch (err) {
                console.error(err)
              }
              setCurrentModal(null)
              setActiveMigration({
                poolName: null,
                lpTokenBalance: Zero,
                lpTokenAddress: "",
              })
            }}
            lpTokenAddress={activeMigration.lpTokenAddress}
            migrationAmount={activeMigration.lpTokenBalance}
          />
        ) : null}
        {currentModal === "confirm" ? <ConfirmTransaction /> : null}
      </Dialog>
    </Container>
  )
}

export default Pools
