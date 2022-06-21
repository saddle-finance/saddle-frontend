import { Container, Grid, Typography } from "@mui/material"
import React, { useState } from "react"
import FarmOverview from "./FarmOverview"
import StakeDialog from "./StakeDialog"
import { parseEther } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

export default function Farm(): JSX.Element {
  const [openStackDlg, setOpenStackDlg] = useState<boolean>(false)
  const sdlWethPoolName = "SDL/WETH"

  return (
    <Container sx={{ pt: 5 }}>
      <FarmListHeader />

      <FarmOverview
        farmName={sdlWethPoolName}
        apr={parseEther("20.12")}
        tvl={parseEther("70300000")}
        myStake={parseEther("200330")}
        onClickStake={() => setOpenStackDlg(true)}
      />
      <StakeDialog
        farmName={sdlWethPoolName}
        open={openStackDlg}
        onClose={() => setOpenStackDlg(false)}
      />
    </Container>
  )
}

function FarmListHeader(): JSX.Element {
  const { t } = useTranslation()
  return (
    <Grid
      container
      direction="row"
      sx={{
        py: 1,
        px: 3,
      }}
    >
      <Grid item xs={2.5}>
        <Typography>{t("farms")}</Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography>APR</Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography>TVL</Typography>
      </Grid>
      <Grid item xs={1.5}>
        <Typography>{t("myStaked")}</Typography>
      </Grid>
    </Grid>
  )
}
