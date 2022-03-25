import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
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
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import ReviewCreatePool from "./CreatePoolDialog"
import { Link as RouteLink } from "react-router-dom"
import { useTranslation } from "react-i18next"

type Token = {
  tokenAddress: string
}

type PoolType = "usdMetapool" | "btcMetapool" | "basepool"

type AssetType = "USD" | "ETH" | "BTC" | "OTHERS"

export default function CreatePool(): React.ReactElement {
  const { t } = useTranslation()
  const theme = useTheme()
  const [openCreatePoolDlg, setOpenCreatePoolDlg] = useState<boolean>(false)
  const [poolName, setPoolName] = useState<string>("")
  const [poolSymbol, setPoolSymbol] = useState<string>("")
  const [parameter, setParameter] = useState<string>("")
  const [poolType, setPoolType] = useState<PoolType>("usdMetapool")
  const [assetType, setAssetType] = useState<AssetType>("USD")
  const [tokenLists, setTokenLists] = useState<Token[]>([
    { tokenAddress: "" },
    { tokenAddress: "" },
  ])
  const [fee, setFee] = useState<string>("")
  const [disableCreatePool, setDisableCreatePool] = useState<boolean>(true)

  const handleAddTokenList = () => {
    setTokenLists((prev) => [...prev, { tokenAddress: "" }])
  }

  const handleSubmit = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    // event.preventDefault()
    console.log(event)
    // setOpenCreatePoolDlg(true)
  }
  const isNumber = (text: string) => {
    const digitRegex = /^\d*(\.\d+)?$/

    return digitRegex.exec(text)
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
                    required
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
                    required
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
                  onChange={(event, value) => setPoolType(value)}
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
              <Box
                flex={1}
                display={poolType === "basepool" ? "block" : "none"}
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
                >
                  <ToggleButton value="USD" color="secondary">
                    USD
                  </ToggleButton>
                  <ToggleButton value="ETH">ETH</ToggleButton>
                  <ToggleButton value="BTC">BTC</ToggleButton>
                  <ToggleButton value="OTHERS">{t("others")}</ToggleButton>
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
                {tokenLists.map((token, index) => (
                  <Box
                    key={`token-input-${index}`}
                    flexBasis={`calc(50% - ${theme.spacing(1.5)})`}
                  >
                    <TextField
                      label={`${t("token")} ${index}`}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        endAdornment: (
                          <>
                            {index > 1 && (
                              <IconButton
                                onClick={() =>
                                  setTokenLists((prev) =>
                                    prev.filter(
                                      (value, tokenIndex) =>
                                        index !== tokenIndex,
                                    ),
                                  )
                                }
                              >
                                <DeleteForeverIcon />
                              </IconButton>
                            )}
                          </>
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
              onClick={handleAddTokenList}
              disabled={tokenLists.length > 3}
              sx={{ mb: 4 }}
            >
              {t("addToken")}
            </Button>
            <Button
              variant="contained"
              type="submit"
              size="large"
              fullWidth
              disabled={
                // poolNameError || poolSymbolError || feeError || parameterError
                disableCreatePool
              }
              onClick={handleSubmit}
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
