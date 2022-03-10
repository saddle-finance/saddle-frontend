import { Box, Typography, useTheme } from "@mui/material"
import React, { ReactElement } from "react"
import { ReactComponent as SaddleLogo } from "../assets/bg_light.svg"
import loadingGif from "../assets/loading.gif"
import { useTranslation } from "react-i18next"

function ConfirmTransaction(): ReactElement {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Box p={8} textAlign="center">
      <Box
        width="240px"
        height="240px"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor={theme.palette.common.white}
        borderRadius="50%"
        margin="auto"
        mb={8}
        color={theme.palette.info.main}
      >
        <SaddleLogo width="90%" height="90%" />
      </Box>
      <Typography variant="h2" mb={2}>
        {t("confirmTransaction")}
      </Typography>
      <img src={loadingGif} alt="loading..." width="40px" />
    </Box>
  )
}

export default ConfirmTransaction
