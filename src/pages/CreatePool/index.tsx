import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material"
import { ChainId, PoolTypes } from "../../constants"
import React, { useContext, useEffect, useState } from "react"

import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { BigNumberish } from "ethers"
import CircularProgress from "@mui/material/CircularProgress"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import ERC20_ABI from "../../constants/abis/erc20.json"
import { Erc20 } from "../../../types/ethers-contracts/Erc20"
import { ExpandedPoolsContext } from "../../providers/ExpandedPoolsProvider"
import ReviewCreatePool from "./CreatePoolDialog"
import { Link as RouteLink } from "react-router-dom"
import { getContract } from "../../utils"
import { isAddress } from "ethers/lib/utils"
import { useActiveWeb3React } from "../../hooks"
import { useQueries } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

export enum PoolType {
  UsdMeta = "usdMetapool",
  BtcMeta = "btcMetapool",
  Base = "basepool",
  Empty = "",
}

export type ValidationStatus =
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning"

export default function CreatePool(): React.ReactElement {
  const { t } = useTranslation()
  const theme = useTheme()
  const expandedPools = useContext(ExpandedPoolsContext)
  const expandedPoolsRemapped = Object.values(expandedPools.data.byName)
    .map((pool) => ({
      basePoolAddress: pool.basePoolAddress,
      poolName: pool.poolName,
      isSaddleApproved: pool.isSaddleApproved,
      address: pool.poolAddress,
      isPaused: pool.isPaused,
      isMigrated: pool.isMigrated,
      tokensLength: pool.tokens.length,
    }))
    .filter((pool) => pool.tokensLength < 4)
    .filter((pool) => pool.isSaddleApproved)
    .filter((pool) => !pool.basePoolAddress)
    .filter((pool) => !pool.isMigrated)
    .filter((pool) => !pool.isPaused)
  const { account, library, chainId } = useActiveWeb3React()

  const [disableCreatePool, setDisableCreatePool] = useState<boolean>(true)
  const [metapoolBasepoolAddr, setMetapoolBasepoolAddr] = useState<string>(
    "Unable to obtain basepool address",
  )
  const [metapoolBasepoolLpAddr, setMetapoolBasepoolLpAddr] =
    useState<string>("")
  const [openCreatePoolDlg, setOpenCreatePoolDlg] = useState<boolean>(false)
  const [inputLoading] = useState<boolean[]>([false])
  const [poolName, setPoolName] = useState<string>("")
  const [poolSymbol, setPoolSymbol] = useState<string>("")
  const [aParameter, setAParameter] = useState<string>("")
  const [poolType, setPoolType] = useState<PoolType>(PoolType.Empty)
  const [assetType, setAssetType] = useState<PoolTypes>(PoolTypes.ETH)
  const [tokenInputs, setTokenInputs] = useState<string[]>([""])
  const results = useQueries({
    queries: tokenInputs.map((address) => ({
      queryKey: [address],
      queryFn: async () => await getUserTokenInputContract(address),
      enabled: isAddress(address),
    })),
  })
  const [selectedTokensLength, setSelectedTokensLength] = useState(0)
  const [tokenInfo, setTokenInfo] = useState<
    {
      name: string
      symbol: string
      decimals: BigNumberish
      checkResult: ValidationStatus
    }[]
  >([
    {
      name: "",
      symbol: "",
      decimals: 0,
      checkResult: "primary",
    },
  ])
  const [fee, setFee] = useState<string>("")
  const [tokenInputErrorMsg, setTokenInputErrorMsg] = useState<string>("")

  const handleAddToken = () => {
    setTokenInputs((prev) => [...prev, ""])
  }

  const isValidNumber = (text: string) => {
    const digitRegex = /^\d*(\.\d+)?$/

    return digitRegex.test(text)
  }

  const resetFields = () => {
    setPoolName("")
    setPoolSymbol("")
    setAParameter("")
    setPoolType(PoolType.Empty)
    setAssetType(0)
    setFee("")
    setSelectedTokensLength(0)
    setTokenInfo([
      {
        name: "",
        symbol: "",
        decimals: 0,
        checkResult: "primary",
      },
    ])
    setTokenInputs([""])
  }

  const getUserTokenInputContract = (addr: string) => {
    if (!library || !account || !addr)
      throw new Error("error on token contract")

    const tokenContractResult = getContract(
      addr,
      ERC20_ABI,
      library,
      account,
    ) as Erc20

    return Promise.all([
      tokenContractResult.name(),
      tokenContractResult.symbol(),
      tokenContractResult.decimals(),
    ])
  }

  const poolNameError = poolName.length > 32
  const poolSymbolError = poolSymbol.length > 32 || poolSymbol.includes(" ")
  const aParameterError =
    !isValidNumber(aParameter) || parseFloat(aParameter) < 1

  const minFee = "0.01"
  const maxFee = "1"
  const maxAmountOfTokens = 4

  const feeError =
    !isValidNumber(fee) ||
    parseFloat(fee) > Number(maxFee) ||
    parseFloat(fee) < Number(minFee)

  useEffect(() => {
    const tokenInfoErrors = tokenInfo.map((token) =>
      token?.checkResult === "success" ? "success" : "error",
    )
    const hasFieldError =
      poolNameError ||
      poolSymbolError ||
      aParameterError ||
      feeError ||
      tokenInfoErrors.includes("error")
    const hasAllValues =
      poolName.length > 0 &&
      poolSymbol.length > 0 &&
      fee.length > 0 &&
      aParameter.length > 0

    setDisableCreatePool(
      hasFieldError || !hasAllValues || Boolean(tokenInputErrorMsg),
    )
  }, [
    fee.length,
    feeError,
    aParameter.length,
    aParameterError,
    poolName.length,
    poolNameError,
    poolSymbol.length,
    poolSymbolError,
    tokenInfo,
    tokenInputErrorMsg,
  ])

  const handleTokenInputchange = async (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
  ) => {
    tokenInputs[index] = event.target.value
    console.log("token inputs ==>", tokenInputs)
    setTokenInputs(tokenInputs)
    if (isAddress(event.target.value)) await results[index].refetch()
    if (
      new Set(tokenInputs).size !== tokenInputs.length &&
      event.target.value
    ) {
      setTokenInputErrorMsg("Duplicate Tokens Not Allowed")
    } else {
      setTokenInputErrorMsg("")
    }
  }

  return (
    <Container sx={{ pb: 5 }}>
      <Link
        component={RouteLink}
        to="/pools"
        color="inherit"
        sx={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          my: 2,
        }}
      >
        <ArrowBackIcon sx={{ mr: 1 }} />
        {t("backToPools")}
      </Link>

      <Paper>
        <form>
          <Box p={3}>
            <Box>
              <Typography variant="h1">{t("createPool")}</Typography>
              <Typography mt={2}>{t("createPoolDescription")}</Typography>
            </Box>
            <Box mt={4}>
              <Typography variant="subtitle1">
                {t("addPoolNameAndSymbol")}
              </Typography>
              <Divider />
              <Typography my={2}>{t("addPoolNameExample")}</Typography>
              <Typography my={2}>{t("addPoolSymbolExample")}</Typography>
              <Box display="flex" flexDirection={["column", "row"]}>
                <Box flex={1} mt={2}>
                  <TextField
                    size="medium"
                    label={t("poolName")}
                    value={poolName}
                    onChange={(e) => setPoolName(e.target.value)}
                    error={poolNameError}
                    helperText={poolNameError && t("poolNameError")}
                    fullWidth
                    sx={{ mr: [0, 1.5], flex: 1 }}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </Box>
                <Box flex={1} mt={2}>
                  <TextField
                    size="medium"
                    label={t("poolSymbol")}
                    fullWidth
                    error={poolSymbolError}
                    helperText={poolSymbolError && t("poolSymbolError")}
                    onChange={(e) => setPoolSymbol(e.target.value)}
                    value={poolSymbol}
                    sx={{ ml: [0, 1.5], flex: 1 }}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </Box>
              </Box>
            </Box>

            <Box mt={4}>
              <Typography variant="subtitle1">{t("setParameters")}</Typography>
              <Divider />
              <Stack direction="row" spacing={3} mt={2}>
                <Box flex={1}>
                  <Typography mb={2}>
                    {t("setFeeDescription", { minFee, maxFee })}
                  </Typography>
                  <TextField
                    label={`${t("fee")} (%)`}
                    fullWidth
                    value={fee}
                    type="text"
                    error={feeError}
                    onChange={(e) => setFee(e.target.value)}
                    helperText={feeError && t("feeError", { minFee, maxFee })}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </Box>
                <Box flex={1}>
                  <Typography mb={2}>{t("amplificationParameter")}</Typography>
                  <Typography mb={2}>
                    {t("suggestedValue")}
                    <li>{t("suggestedValue-1")}</li>
                    <li>{t("suggestedValue-2")}</li>
                    <li>{t("suggestedValue-3")}</li>
                  </Typography>
                  <TextField
                    label={t("aParameter")}
                    onChange={(e) => setAParameter(e.target.value)}
                    value={aParameter}
                    error={aParameterError}
                    helperText={aParameterError && t("aParameterError")}
                    fullWidth
                    spellCheck={false}
                    autoComplete="off"
                  />
                </Box>
              </Stack>
            </Box>

            <Stack direction="row" spacing={3} my={4}>
              <Box flex={1}>
                <Typography variant="subtitle1">
                  {t("createPoolType")}
                </Typography>
                <Divider />
                <Typography my={2}>
                  {t("createPoolTypeDescription1")}
                </Typography>
                {chainId && ![ChainId.ARBITRUM].includes(chainId) && (
                  <Typography mb={2}>
                    {t("createPoolTypeDescription2")}
                  </Typography>
                )}
                <Typography mb={2}>
                  {t("createPoolTypeDescription3")}
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="pool-type-label">Choose Pool Type</InputLabel>
                  <Select
                    label="Choose Pool Type"
                    id="pool-select"
                    onChange={(e) => {
                      if (e.target.value === PoolType.Base) {
                        setPoolType(e.target.value as PoolType)
                        setTokenInputs(["", ""])
                      } else {
                        const pool =
                          expandedPools.data.byAddress[e.target.value as string]
                        if (!pool) {
                          console.error("Unable to locate pool")
                          return
                        }
                        const tokensLength = pool.tokens.length
                        const lpTokenAddr = pool.lpToken.address
                        setPoolType(pool.poolName as PoolType)
                        setSelectedTokensLength(tokensLength)
                        setTokenInputs([
                          ...(Array(maxAmountOfTokens - tokensLength).fill(
                            "",
                            0,
                          ) as string[]),
                        ])
                        setMetapoolBasepoolAddr(e.target.value as string)
                        setMetapoolBasepoolLpAddr(lpTokenAddr)
                      }
                    }}
                  >
                    <MenuItem value={PoolType.Base}>Base Pool</MenuItem>
                    {expandedPoolsRemapped.map((pool) => (
                      <MenuItem key={pool.address} value={pool.address}>
                        {pool.poolName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box flex={1}>
                <Typography variant="subtitle1">
                  {t("chooseAssetType")}
                </Typography>
                <Divider />
                <Typography my={2}>
                  {t("chooseAssetTypeDescription")}
                </Typography>
                <ToggleButtonGroup
                  value={assetType}
                  color="secondary"
                  fullWidth
                  exclusive
                  onChange={(event, value: PoolTypes) => {
                    if (value !== null) setAssetType(value)
                  }}
                  size="large"
                >
                  <ToggleButton value={PoolTypes.USD} color="secondary">
                    USD
                  </ToggleButton>
                  <ToggleButton value={PoolTypes.ETH}>ETH</ToggleButton>
                  <ToggleButton value={PoolTypes.BTC}>BTC</ToggleButton>
                  <ToggleButton value={PoolTypes.OTHER}>
                    {t("others")}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>

            {poolType !== PoolType.Empty ? (
              <>
                <Box>
                  <Typography variant="subtitle1">
                    {t("addTokenAddress")}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack
                    direction="row"
                    mb={1}
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                  >
                    {tokenInputs.map((tokenInput, index) => {
                      const tokenData = results[index].data
                      const tokenName = tokenData?.[0]
                      const tokenSymbol = tokenData?.[1] || ""
                      const tokenDecimal = tokenData?.[2] ?? ""
                      const helperText = tokenName
                        ? `${tokenName} (${tokenSymbol}: ${tokenDecimal} decimals)`
                        : ""
                      return (
                        <Box
                          key={`token-input-${index}`}
                          flexBasis={`calc(50% - ${theme.spacing(1.5)})`}
                        >
                          <TextField
                            autoComplete="off"
                            value={tokenInputs[index]}
                            label={`Token ${index}`}
                            fullWidth
                            color={tokenInfo[index]?.checkResult ?? "primary"}
                            margin="normal"
                            onChange={(e) =>
                              void handleTokenInputchange(e, index)
                            }
                            helperText={helperText}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  {(poolType === PoolType.Base && index > 1) ||
                                  (poolType !== PoolType.Base && index > 0) ? (
                                    <IconButton
                                      onClick={() =>
                                        setTokenInputs((prev) =>
                                          prev.filter(
                                            (value, tokenIndex) =>
                                              index !== tokenIndex,
                                          ),
                                        )
                                      }
                                    >
                                      {results[index].isLoading ? (
                                        <CircularProgress size={20} />
                                      ) : (
                                        <DeleteForeverIcon />
                                      )}
                                    </IconButton>
                                  ) : null}
                                  {index <= 1 && inputLoading[index] && (
                                    <CircularProgress size={20} />
                                  )}
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>
                      )
                    })}
                    {poolType !== PoolType.Base && (
                      <Box flexBasis={`calc(50% - ${theme.spacing(1.5)})`}>
                        <TextField
                          value={metapoolBasepoolAddr}
                          fullWidth
                          disabled
                          color="primary"
                          margin="normal"
                          helperText={t("basepoolAddress")}
                        />
                      </Box>
                    )}
                  </Stack>
                </Box>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleAddToken}
                  disabled={
                    (poolType === PoolType.Base && tokenInputs.length > 3) ||
                    (poolType !== PoolType.Base &&
                      tokenInputs.length >=
                        maxAmountOfTokens - selectedTokensLength)
                  }
                  sx={{ mb: 4 }}
                >
                  {t("addToken")}
                </Button>
              </>
            ) : (
              <Typography>Select Pool Type to add Tokens</Typography>
            )}
            <Box display="flex" justifyContent="center" pb={1}>
              {tokenInputErrorMsg ? (
                <Typography color="error">{tokenInputErrorMsg}</Typography>
              ) : (
                <Box sx={{ height: 20.11 }} />
              )}
            </Box>
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={disableCreatePool}
              onClick={() => setOpenCreatePoolDlg(true)}
            >
              {t("createCommunityPool")}
            </Button>
          </Box>
        </form>
      </Paper>
      <ReviewCreatePool
        poolData={{
          poolName,
          poolSymbol,
          aParameter,
          poolType,
          assetType,
          tokenInputs,
          tokenInfo,
          fee,
        }}
        metapoolBasepoolAddr={metapoolBasepoolAddr}
        metapoolBasepoolLpAddr={metapoolBasepoolLpAddr}
        open={openCreatePoolDlg}
        onClose={() => setOpenCreatePoolDlg(false)}
        resetFields={resetFields}
      />
    </Container>
  )
}
