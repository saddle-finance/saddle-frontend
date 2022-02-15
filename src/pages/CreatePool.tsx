import { Box, Container, Paper, TextField, Typography } from "@mui/material"
import React from "react"
import { useTranslation } from "react-i18next"

export default function CreatePool(): React.ReactElement {
  const { t } = useTranslation()
  return (
    <Container>
      <Paper>
        <Box p={3}>
          <Typography variant="h1">{t("createPool")}</Typography>
          <Typography mt={2}>{t("createPoolDescription")}</Typography>
          <Typography>{t("addPoolName")}</Typography>
          <TextField />
        </Box>
      </Paper>
    </Container>
  )
}
