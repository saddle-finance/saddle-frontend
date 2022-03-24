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
import ERC20_ABI from "../../constants/abis/erc20.json"
import ReviewCreatePool from "./CreatePoolDialog"
import { Link as RouteLink } from "react-router-dom"
import { getContract } from "../../utils"
import { useActiveWeb3React } from "../../hooks"
import { useTranslation } from "react-i18next"

// type Token = {
//   tokenAddress: string
// }

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
  const [tokenLists, setTokenLists] = useState<string[]>(["", ""])
  const [fee, setFee] = useState<string>("")
  const { account, library } = useActiveWeb3React()

  const handleAddTokenList = () => {
    setTokenLists((prev) => [...prev, ""])
  }

  const isNumber = (text: string) => {
    const digitRegex = /^\d*(\.\d+)?$/

    return digitRegex.exec(text)
  }
  const getUserTokenInputContract = (addr: string) => {
    if (!library || !account) return
    const tokenData = getContract(addr, ERC20_ABI, library, account)
    console.log({ tokenData })
    return tokenData
  }

  useEffect(() => {
    const getTokenData = async () => {
      const res = getUserTokenInputContract(
        "0xdac17f958d2ee523a2206206994597c13d831ec7",
      )
      // eslint-disable-next-line
      const name = await res?.name()
      // eslint-disable-next-line
      const symbol = await res?.symbol()
      // eslint-disable-next-line
      const decimals = await res?.decimals()
      // eslint-disable-next-line
      console.log({ name, symbol, decimals, res })
    }
    void getTokenData()
  }, [])

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
        Back to pools
      </Link>

      <Paper>
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
                  label="Pool Name"
                  value={poolName}
                  onChange={(e) => setPoolName(e.target.value)}
                  error={poolName.length > 10}
                  helperText={
                    poolName.length > 10 &&
                    "Pool Name length should be less than 10 characters"
                  }
                  fullWidth
                  sx={{ mr: [0, 1.5], flex: 1 }}
                />
              </Box>
              <Box flex={1} mt={2}>
                <TextField
                  size="medium"
                  label="Pool Symbol"
                  fullWidth
                  error={poolSymbol.length > 14}
                  helperText={
                    poolSymbol.length > 14 &&
                    "Pool Symbol should be less than 14 characters"
                  }
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
                  error={
                    !isNumber(fee) ||
                    parseFloat(fee) > 1 ||
                    parseFloat(fee) < 0.04
                  }
                  onChange={(e) => setFee(e.target.value)}
                  helperText={
                    (!isNumber(fee) ||
                      parseFloat(fee) > 1 ||
                      parseFloat(fee) < 0.04) &&
                    "Fee should be a number between 0.04 and 1"
                  }
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
                  label="A parameter"
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  onChange={(e) => setParameter(e.target.value)}
                  error={
                    !isNumber(parameter) ||
                    parseFloat(parameter) < 100 ||
                    parseFloat(parameter) > 400
                  }
                  helperText={
                    (isNumber(parameter) ||
                      parseFloat(parameter) < 100 ||
                      parseFloat(parameter) > 400) &&
                    "Parameter should be a number between 100 and 400"
                  }
                  fullWidth
                />
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={3} my={4}>
            <Box flex={1}>
              <Typography variant="subtitle1">{t("createPoolType")}</Typography>
              <Divider />
              <Typography my={2}>{t("createPoolTypeDescription1")}</Typography>
              <Typography mb={2}>{t("createPoolTypeDescription2")}</Typography>
              <Typography mb={2}>{t("createPoolTypeDescription3")}</Typography>
              <ToggleButtonGroup
                value={poolType}
                color="secondary"
                size="large"
                exclusive
                onChange={(event, value) => setPoolType(value)}
                fullWidth
              >
                <ToggleButton value="usdMetapool" size="large">
                  USD Metapool
                </ToggleButton>
                <ToggleButton value="btcMetapool">BTC Metapool</ToggleButton>
                <ToggleButton value="basepool">Base Pool</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box flex={1} display={poolType === "basepool" ? "block" : "none"}>
              <Typography variant="subtitle1">
                {t("chooseAssetType")}
              </Typography>
              <Divider />
              <Typography my={2}>{t("chooseAssetTypeDescription")}</Typography>
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
                <ToggleButton value="OTHERS">Others</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Stack>

          <Box>
            <Typography variant="subtitle1">{t("addTokenAddress")}</Typography>
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
                    label={`Token ${index}`}
                    fullWidth
                    margin="normal"
                    // onBlur={getUserTokenInputContract(tokenLists[0])}
                    InputProps={{
                      endAdornment: (
                        <>
                          {index > 1 && (
                            <IconButton
                              onClick={() =>
                                setTokenLists((prev) =>
                                  prev.filter(
                                    (value, tokenIndex) => index !== tokenIndex,
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
            size="large"
            fullWidth
            onClick={() => setOpenCreatePoolDlg(true)}
          >
            {t("createCommunityPool")}
          </Button>
        </Box>
      </Paper>
      <ReviewCreatePool
        open={openCreatePoolDlg}
        onClose={() => setOpenCreatePoolDlg(false)}
      />
    </Container>
  )
}
