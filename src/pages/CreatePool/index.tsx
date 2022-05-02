import { BigNumberish, ethers } from "ethers"
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material"
import React, { useEffect, useState } from "react"

import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import CircularProgress from "@mui/material/CircularProgress"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import ERC20_ABI from "../../constants/abis/erc20.json"
import { Erc20 } from "../../../types/ethers-contracts/Erc20"
import ReviewCreatePool from "./CreatePoolDialog"
import { Link as RouteLink } from "react-router-dom"
import { getContract } from "../../utils"
import { useActiveWeb3React } from "../../hooks"
import { usePoolRegistry } from "../../hooks/useContract"
import { useTranslation } from "react-i18next"

export enum PoolType {
  UsdMeta = "usdMetapool",
  BtcMeta = "btcMetapool",
  Base = "basepool",
}

export enum AssetType {
  USD,
  ETH,
  BTC,
  OTHERS,
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
  const poolRegistry = usePoolRegistry()
  const { account, library } = useActiveWeb3React()

  const [disableCreatePool, setDisableCreatePool] = useState<boolean>(true)
  const [metapoolBasepoolAddr, setMetapoolBasepoolAddr] = useState<string>(
    "Unable to obtain basepool address",
  )
  const [metapoolBasepoolLpAddr, setMetapoolBasepoolLpAddr] =
    useState<string>("")
  const [openCreatePoolDlg, setOpenCreatePoolDlg] = useState<boolean>(false)
  const [inputLoading, setInputLoading] = useState<boolean[]>([false])
  const [poolName, setPoolName] = useState<string>("")
  const [poolSymbol, setPoolSymbol] = useState<string>("")
  const [aParameter, setAParameter] = useState<string>("")
  const [poolType, setPoolType] = useState<PoolType>(PoolType.UsdMeta)
  const [assetType, setAssetType] = useState<AssetType>(0)
  const [tokenInputs, setTokenInputs] = useState<string[]>([""])
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
    setPoolType(PoolType.Base)
    setAssetType(0)
    setFee("")
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

  const getUserTokenInputContract = async (
    addr: string,
  ): Promise<{
    name: string
    symbol: string
    decimals: BigNumberish
    checkResult: ValidationStatus
  }> => {
    if (!library || !account || !addr)
      return {
        name: "",
        symbol: "",
        decimals: 0,
        checkResult: "primary" as ValidationStatus,
      }

    const tokenContractResult = getContract(
      addr,
      ERC20_ABI,
      library,
      account,
    ) as Erc20

    return {
      name: (await tokenContractResult?.name()) ?? "",
      symbol: (await tokenContractResult?.symbol()) ?? "",
      decimals: (await tokenContractResult?.decimals()) ?? 0,
      checkResult: "success",
    }
  }

  const poolNameError = poolName.length > 32
  const poolSymbolError = poolSymbol.length > 32
  const aParameterError =
    !isValidNumber(aParameter) || parseFloat(aParameter) < 1

  const feeError =
    !isValidNumber(fee) || parseFloat(fee) > 1 || parseFloat(fee) < 0.04

  useEffect(() => {
    const getBasePoolLPTokenAddrs = async () => {
      if (poolRegistry) {
        const basePoolName = poolType === PoolType.UsdMeta ? "USDv2" : "BTCv2"
        try {
          const poolRegistryData = await poolRegistry.getPoolDataByName(
            ethers.utils.formatBytes32String(basePoolName),
          )
          setMetapoolBasepoolAddr(poolRegistryData.poolAddress)
          setMetapoolBasepoolLpAddr(poolRegistryData.lpToken)
        } catch (err) {
          console.error(err)
        }
      }
    }
    void getBasePoolLPTokenAddrs()
  }, [poolRegistry, poolType])

  useEffect(() => {
    const tokenInfoErrors = tokenInfo.map((token) =>
      token.checkResult === "success" ? "success" : "error",
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

    setDisableCreatePool(hasFieldError || !hasAllValues)
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
  ])

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
                  />
                </Box>
              </Box>
            </Box>

            <Box mt={4}>
              <Typography variant="subtitle1">{t("setParameters")}</Typography>
              <Divider />
              <Stack direction="row" spacing={3} mt={2}>
                <Box flex={1}>
                  <Typography mb={2}>{t("setFeeDescription")}</Typography>
                  <TextField
                    label={`${t("fee")} (%)`}
                    fullWidth
                    value={fee}
                    type="text"
                    error={feeError}
                    onChange={(e) => setFee(e.target.value)}
                    helperText={feeError && t("feeError")}
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
                <Typography mb={2}>
                  {t("createPoolTypeDescription2")}
                </Typography>
                <Typography mb={2}>
                  {t("createPoolTypeDescription3")}
                </Typography>
                <ToggleButtonGroup
                  value={poolType}
                  color="secondary"
                  size="large"
                  exclusive
                  onChange={(event, value) => {
                    setPoolType(value)
                    setTokenInputs([tokenInputs[0]])
                  }}
                  fullWidth
                >
                  <ToggleButton value={PoolType.UsdMeta} size="large">
                    {t("usdMetapool")}
                  </ToggleButton>
                  <ToggleButton value={PoolType.BtcMeta}>
                    {t("btcMetapool")}
                  </ToggleButton>
                  <ToggleButton value={PoolType.Base}>
                    {t("basepool")}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box
                flex={1}
                sx={{
                  opacity: poolType === PoolType.Base ? 1 : 0.5,
                  cursor:
                    poolType === PoolType.Base ? "default" : "not-allowed",
                }}
              >
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
                  onChange={(event, value) => setAssetType(value)}
                  size="large"
                  disabled={poolType !== PoolType.Base}
                >
                  <ToggleButton value={AssetType.USD} color="secondary">
                    USD
                  </ToggleButton>
                  <ToggleButton value={AssetType.ETH}>ETH</ToggleButton>
                  <ToggleButton value={AssetType.BTC}>BTC</ToggleButton>
                  <ToggleButton value={AssetType.OTHERS}>
                    {t("others")}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>

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
                {tokenInputs.map((tokenInput, index) => (
                  <Box
                    key={`token-input-${index}`}
                    flexBasis={`calc(50% - ${theme.spacing(1.5)})`}
                  >
                    <TextField
                      autoComplete="off"
                      label={`Token ${index}`}
                      fullWidth
                      color={tokenInfo[index]?.checkResult ?? "primary"}
                      margin="normal"
                      onChange={(e) => {
                        tokenInputs[index] = e.target.value
                        setTokenInputs([...tokenInputs])
                      }}
                      onBlur={async (e) => {
                        if (!e.target.value) {
                          tokenInfo[index] = {
                            name: "",
                            symbol: "",
                            decimals: 0,
                            checkResult: "primary" as ValidationStatus,
                          }
                          setTokenInfo([...tokenInfo])
                        }

                        inputLoading[index] = true
                        setInputLoading([...inputLoading])
                        let tokenData
                        try {
                          tokenData = await getUserTokenInputContract(
                            tokenInputs[index],
                          )
                        } catch (err) {
                          console.error(err)
                          tokenData = {
                            name: "",
                            symbol: "",
                            decimals: 0,
                            checkResult: "error" as ValidationStatus,
                          }
                        }
                        inputLoading[index] = false
                        setInputLoading([...inputLoading])
                        tokenInfo[index] = tokenData
                        setTokenInfo([...tokenInfo])
                      }}
                      helperText={
                        tokenInfo[index]?.name
                          ? `${tokenInfo[index]?.name} (${
                              tokenInfo[index]?.symbol
                            }: ${String(tokenInfo[index]?.decimals)} decimals)`
                          : " "
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {index > 1 && (
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
                                {inputLoading[index] ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <DeleteForeverIcon />
                                )}
                              </IconButton>
                            )}
                            {index <= 1 && inputLoading[index] && (
                              <CircularProgress size={20} />
                            )}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                ))}
                {(poolType === PoolType.UsdMeta ||
                  poolType === PoolType.BtcMeta) && (
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
                poolType !== PoolType.Base
              }
              sx={{ mb: 4 }}
            >
              {t("addToken")}
            </Button>
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
