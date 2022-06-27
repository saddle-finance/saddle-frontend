import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import React, { ReactElement, useContext, useEffect, useState } from "react"

import { AppState } from "../state"
import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { BigNumber } from "ethers"
import ConfirmTransaction from "../components/ConfirmTransaction"
import Dialog from "../components/Dialog"
import PoolOverview from "../components/PoolOverview"
import { PoolTypes } from "../constants"
import ReviewMigration from "../components/ReviewMigration"
import { Search } from "@mui/icons-material"
import { UserStateContext } from "../providers/UserStateProvider"
import { Zero } from "@ethersproject/constants"
import { getTokenSymbolForPoolType } from "../utils"
import { logEvent } from "../utils/googleAnalytics"
import { parseUnits } from "@ethersproject/units"
import { useActiveWeb3React } from "../hooks"
import { useApproveAndMigrate } from "../hooks/useApproveAndMigrate"
import { useHistory } from "react-router"
import { useSelector } from "react-redux"

function Pools(): ReactElement | null {
  const { account, chainId } = useActiveWeb3React()
  const basicPools = useContext(BasicPoolsContext)
  const userState = useContext(UserStateContext)
  const approveAndMigrate = useApproveAndMigrate()
  const history = useHistory()

  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  const [currentModal, setCurrentModal] = useState<string | null>(null)
  const [activeMigration, setActiveMigration] = useState<{
    poolName: string | null
    lpTokenBalance: BigNumber
    lpTokenAddress: string
  }>({ poolName: null, lpTokenBalance: Zero, lpTokenAddress: "" })
  const [filter, setFilter] = useState<PoolTypes | "all" | "outdated">("all")
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
  }, [account, chainId])

  return (
    <Container sx={{ pb: 5 }}>
      <Stack direction="row" alignItems="center" justifyContent="center">
        {false && (
          <Box flex={1}>
            <TextField
              variant="standard"
              placeholder="Pool or token"
              InputProps={{
                startAdornment: <Search />,
              }}
            />
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

        {false /* TODO: Change when perm pool turned on */ && (
          <Box flex={1}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ float: "right" }}
              onClick={() => history.push("/pools/create")}
            >
              Create Pool
            </Button>
          </Box>
        )}
      </Stack>

      <Stack spacing={3}>
        {!basicPools ? (
          <Paper sx={{ display: "flex", justifyContent: "center", padding: 4 }}>
            <Typography>Please connect your wallet to see pools.</Typography>
          </Paper>
        ) : (
          Object.values(basicPools || {})
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
              const userLpTokenBalanceA =
                userState?.tokenBalances?.[a.lpToken] || Zero
              const userLpTokenBalanceB =
                userState?.tokenBalances?.[b.lpToken] || Zero
              const poolAssetA = parseUnits(
                String(
                  tokenPricesUSD?.[getTokenSymbolForPoolType(a.typeOfAsset)] ||
                    0,
                ),
                18,
              )
              const poolAssetB = parseUnits(
                String(
                  tokenPricesUSD?.[getTokenSymbolForPoolType(b.typeOfAsset)] ||
                    0,
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
                    ? () =>
                        handleClickMigrate(
                          basicPool.poolName,
                          userState?.tokenBalances?.[basicPool.lpToken] || Zero,
                          basicPool.lpToken,
                        )
                    : undefined
                }
              />
            ))
        )}
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
