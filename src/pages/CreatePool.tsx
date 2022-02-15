import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import React from "react"
import { useTranslation } from "react-i18next"

export default function CreatePool(): React.ReactElement {
  const { t } = useTranslation()
  return (
    <Container sx={{ pb: 5 }}>
      <Paper>
        <Box p={3}>
          <Box>
            <Typography variant="h1">{t("createPool")}</Typography>
            <Typography mt={2}>{t("createPoolDescription")}</Typography>
          </Box>
          <Box mt={4}>
            <Typography variant="subtitle1">{t("addPoolName")}</Typography>
            <Divider />
            <Typography my={2}>{t("addPoolNameDescription")}</Typography>
            <Stack direction={["column", "row"]}>
              <TextField
                size="medium"
                placeholder="Pool Name"
                sx={{ mr: [0, 1.5], flex: 1 }}
              />
              <TextField
                size="medium"
                placeholder="Pool Symbol"
                sx={{ ml: [0, 1.5], flex: 1 }}
              />
            </Stack>
          </Box>

          <Box mt={4}>
            <Typography variant="subtitle1">{t("setParameters")}</Typography>
            <Divider />
            <Stack direction="row" spacing={3} mt={2}>
              <Box flex={1}>
                <Typography mb={2}>{t("setFeeDescription")}</Typography>
                <TextField placeholder={`${t("fee")} (%)`} fullWidth />
              </Box>
              <Box flex={1}>
                <Typography mb={2}>{t("amplificationParameter")}</Typography>
                <Typography mb={2}>
                  {t("suggestedValue")}
                  <li>{t("suggestedValue-1")}</li>
                  <li>{t("suggestedValue-2")}</li>
                  <li>{t("suggestedValue-3")}</li>
                </Typography>
                <TextField placeholder="A parameter" fullWidth />
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={3} my={4}>
            <Box flex={1}>
              <Typography variant="subtitle1">{t("createPoolType")}</Typography>
              <Divider />
              <Typography mb={2}>{t("createPoolTypeDescription")}</Typography>
              <ToggleButtonGroup
                value="basePool"
                color="secondary"
                size="large"
                fullWidth
              >
                <ToggleButton value="usdMetaPool">USD Metapool</ToggleButton>
                <ToggleButton value="btcMetapool">USD Metapool</ToggleButton>
                <ToggleButton value="basePool">USD Metapool</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle1">
                {t("chooseAssetType")}
              </Typography>
              <Divider />
              <Typography mb={2}>{t("chooseAssetTypeDescription")}</Typography>
              <ToggleButtonGroup value="usd" color="secondary" fullWidth>
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
            <Box display="flex" mb={4} alignItems="center">
              <Box flex={1}>
                <TextField placeholder="Token 1" fullWidth />
              </Box>
              <Box flex={1}>
                <Button variant="contained" size="large" sx={{ ml: 3 }}>
                  {t("addToken")}
                </Button>
              </Box>
            </Box>
          </Box>
          <Button variant="contained" size="large" fullWidth>
            {t("createCommunityPool")}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
