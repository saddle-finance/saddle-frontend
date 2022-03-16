import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  Divider,
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
import DialogTitle from "../components/DialogTitle"
import { Link as RouteLink } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function CreatePool(): React.ReactElement {
  const { t } = useTranslation()
  const theme = useTheme()
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [tokenLists, setTokenLists] = useState<string[]>([""])

  const handleAddTokenList = () => {
    setTokenLists((prev) => [...prev, ""])
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
                <TextField label={`${t("fee")} (%)`} fullWidth />
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
                  />
                </Box>
              ))}
            </Stack>
          </Box>
          <Button
            variant="outlined"
            size="large"
            onClick={handleAddTokenList}
            sx={{ mb: 4 }}
          >
            {t("addToken")}
          </Button>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => setOpenModal(true)}
          >
            {t("createCommunityPool")}
          </Button>
        </Box>
      </Paper>
      <Dialog open={openModal}>
        <DialogTitle variant="h1" onClose={() => setOpenModal(false)}>
          Review Pool Creation
        </DialogTitle>
        <DialogContent>
          <Alert icon={false} color="warning">
            Double check the inputs for your pool are as you want it-- once a
            pool is created, it can be modified but cannot be deleted
            (it&lsquo;ll live on the blockchain forever!)
          </Alert>
          <Stack my={3} spacing={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography>{t("poolName")}</Typography>
              <Typography>vUSD</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography>{t("poolSymbol")}</Typography>
              <Typography>Saddle-vUSD</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography>{t("fee")}</Typography>
              <Typography>0.9%</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography>{t("aParameter")}</Typography>
              <Typography>120</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography>{t("poolType")}</Typography>
              <Typography>USD MetaPool</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography>Tokens</Typography>
              <Typography>vUSD</Typography>
            </Box>
          </Stack>
          <Divider />
          <Typography my={3}>
            Output is estimated. If the price changes by more than max slippage
            your transaction will revert.
          </Typography>
          <Stack spacing={1}>
            <Button variant="contained" size="large">
              Create Pool
            </Button>
            <Button size="large">Go back to edit</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Container>
  )
}
