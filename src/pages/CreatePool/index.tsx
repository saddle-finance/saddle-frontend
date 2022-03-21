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
import React, { useState } from "react"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import ReviewCreatePool from "./CreatePoolDialog"
import { Link as RouteLink } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function CreatePool(): React.ReactElement {
  const { t } = useTranslation()
  const theme = useTheme()
  const [openCreatePoolDlg, setOpenCreatePoolDlg] = useState<boolean>(false)
  const [poolName, setPoolName] = useState<string>("")
  const [tokenLists, setTokenLists] = useState<string[]>(["", ""])
  const [fee, setFee] = useState<string>("")

  const handleAddTokenList = () => {
    setTokenLists((prev) => [...prev, ""])
  }

  const digitRegex = /^\d*(\.\d+)?$/.exec(fee)

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
                  error={poolName.length > 14}
                  helperText={
                    poolName.length > 14 &&
                    "Pool name length should less than 14 characters"
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
                  error={!digitRegex}
                  onChange={(e) => setFee(e.target.value)}
                  helperText={!digitRegex && "Fee should be number"}
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
                <TextField label="A parameter" fullWidth />
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
                value="basePool"
                color="secondary"
                size="large"
                fullWidth
              >
                <ToggleButton value="usdMetaPool" size="large">
                  USD Metapool
                </ToggleButton>
                <ToggleButton value="btcMetapool">USD Metapool</ToggleButton>
                <ToggleButton value="basePool">USD Metapool</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle1">
                {t("chooseAssetType")}
              </Typography>
              <Divider />
              <Typography my={2}>{t("chooseAssetTypeDescription")}</Typography>
              <ToggleButtonGroup
                value="usd"
                color="secondary"
                fullWidth
                size="large"
              >
                <ToggleButton value="usd" color="secondary">
                  USD
                </ToggleButton>
                <ToggleButton value="btcMetapool">ETH</ToggleButton>
                <ToggleButton value="btc">BTC</ToggleButton>
                <ToggleButton value="basePool">Others</ToggleButton>
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
