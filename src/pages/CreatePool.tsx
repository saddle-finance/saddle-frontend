import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
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
            <TextField size="medium" placeholder="Pool Name" />
            <TextField size="medium" placeholder="Pool Symbol" />
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
            <Box>
              <Typography variant="subtitle1">{t("createPoolType")}</Typography>
              <Divider />
              <Typography>{t("createPoolTypeDescription")}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{t("createPoolType")}</Typography>
              <Divider />
              <Typography>{t("createPoolTypeDescription")}</Typography>
            </Box>
          </Stack>
          <Box>
            <Typography>{t("addTokenAddress")}</Typography>
            <Divider />
            <Box mb={4}>
              <TextField placeholder="Token 1" />{" "}
              <Button variant="contained">Add Token</Button>
            </Box>
          </Box>
          <Button variant="contained" fullWidth>
            Create Community Pool
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
