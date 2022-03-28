import {
  Box,
  Button,
  Container,
  Divider,
  Grow,
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
import { useTranslation } from "react-i18next"

type PoolType = "usdMetapool" | "btcMetapool" | "basepool"

type AssetType = "USD" | "ETH" | "BTC" | "OTHERS"

type TextFieldColors =
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning"

export default function CreatePool(): React.ReactElement {
  const { t } = useTranslation()
  const theme = useTheme()
  const [openCreatePoolDlg, setOpenCreatePoolDlg] = useState<boolean>(false)
  const [inputLoading, setInputLoading] = useState<boolean[]>([false])
  const [poolName, setPoolName] = useState<string>("")
  const [poolSymbol, setPoolSymbol] = useState<string>("")
  const [parameter, setParameter] = useState<string>("")
  const [poolType, setPoolType] = useState<PoolType>("usdMetapool")
  const [assetType, setAssetType] = useState<AssetType>("USD")
  const [tokenInputs, setTokenInputs] = useState<string[]>([""])
  const [tokenInfo, setTokenInfo] = useState<
    {
      name: string
      symbol: string
      decimals: number
      checkResult: TextFieldColors
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
  const { account, library } = useActiveWeb3React()
  const [disableCreatePool, setDisableCreatePool] = useState<boolean>(true)

  const handleAddToken = () => {
    setTokenInputs((prev) => [...prev, ""])
  }

  const isNumber = (text: string) => {
    const digitRegex = /^\d*(\.\d+)?$/

    return digitRegex.exec(text)
  }

  const getUserTokenInputContract = async (
    addr: string,
  ): Promise<{
    name: string
    symbol: string
    decimals: number
    checkResult: TextFieldColors
  }> => {
    if (!library || !account || !addr)
      return {
        name: "",
        symbol: "",
        decimals: 0,
        checkResult: "primary" as TextFieldColors,
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

  const poolNameError = poolName.length > 10
  const poolSymbolError = poolSymbol.length > 14
  const parameterError =
    !isNumber(parameter) ||
    parseFloat(parameter) < 100 ||
    parseFloat(parameter) > 400

  const feeError =
    !isNumber(fee) || parseFloat(fee) > 1 || parseFloat(fee) < 0.04

  useEffect(() => {
    const ishavingErrorField =
      poolNameError || poolSymbolError || parameterError || feeError
    const ishavingAllValue =
      poolName.length > 0 &&
      poolSymbol.length > 0 &&
      fee.length > 0 &&
      parameter.length > 0
    setDisableCreatePool(ishavingErrorField || !ishavingAllValue)
  }, [
    fee.length,
    feeError,
    parameter.length,
    parameterError,
    poolName.length,
    poolNameError,
    poolSymbol.length,
    poolSymbolError,
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
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
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
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    onChange={(e) => setParameter(e.target.value)}
                    error={parameterError}
                    helperText={parameterError && t("parameterError")}
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
                  <ToggleButton value="usdMetapool" size="large">
                    {t("usdBalance")}
                  </ToggleButton>
                  <ToggleButton value="btcMetapool">
                    {t("btcMetapool")}
                  </ToggleButton>
                  <ToggleButton value="basepool">{t("basepool")}</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Grow in={poolType === "basepool"}>
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
                    onChange={(event, value) => setAssetType(value)}
                    size="large"
                  >
                    <ToggleButton value="USD" color="secondary">
                      USD
                    </ToggleButton>
                    <ToggleButton value="ETH">ETH</ToggleButton>
                    <ToggleButton value="BTC">BTC</ToggleButton>
                    <ToggleButton value="OTHERS">{t("others")}</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grow>
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
                        setTokenInputs(tokenInputs)
                      }}
                      onBlur={async (e) => {
                        if (!e.target.value) {
                          tokenInfo[index] = {
                            name: "",
                            symbol: "",
                            decimals: 0,
                            checkResult: "primary" as TextFieldColors,
                          }
                          setTokenInfo([...tokenInfo])
                        } else if (e.target.value === tokenInput) {
                          return
                        }

                        inputLoading[index] = true
                        setInputLoading([...inputLoading])
                        let tokenData
                        try {
                          tokenData = await getUserTokenInputContract(
                            tokenInputs[index],
                          )
                        } catch (err) {
                          tokenData = {
                            name: "",
                            symbol: "",
                            decimals: 0,
                            checkResult: "error" as TextFieldColors,
                          }
                        }
                        inputLoading[index] = false
                        setInputLoading([...inputLoading])
                        tokenInfo[index] = tokenData
                        setTokenInfo([...tokenInfo])
                      }}
                      helperText={
                        tokenInfo[index]?.name
                          ? `${tokenInfo[index]?.name} (${tokenInfo[index]?.symbol}: ${tokenInfo[index]?.decimals} decimals)`
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
              </Stack>
            </Box>
            <Button
              variant="outlined"
              size="large"
              onClick={handleAddToken}
              disabled={
                (poolType === "basepool" && tokenInputs.length > 3) ||
                poolType !== "basepool"
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
        open={openCreatePoolDlg}
        onClose={() => setOpenCreatePoolDlg(false)}
      />
    </Container>
  )
}
