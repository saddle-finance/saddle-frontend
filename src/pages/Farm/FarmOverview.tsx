import {
  Button,
  Grid,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import React, { useContext } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { GaugeApr } from "../../providers/AprsProvider"
import GaugeRewardsDisplay from "../../components/GaugeRewardsDisplay"
import TokenIcon from "../../components/TokenIcon"
import { TokensContext } from "../../providers/TokensProvider"
import { Zero } from "@ethersproject/constants"
import { formatBNToShortString } from "../../utils"
import { useActiveWeb3React } from "../../hooks"
import { useTranslation } from "react-i18next"

interface FarmOverviewProps {
  farmName: string
  aprs?: GaugeApr[]
  poolTokens?: string[]
  tvl?: BigNumber
  myStake: BigNumber
  onClickStake: () => void
  onClickClaim: () => void
}

const TokenGroup = styled("div")(() => ({
  display: "flex",
  "& img:not(:first-of-type)": {
    marginLeft: -5,
  },
}))

export default function FarmOverview({
  farmName,
  poolTokens,
  aprs,
  tvl,
  myStake,
  onClickStake,
}: // onClickClaim,
FarmOverviewProps): JSX.Element | null {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const tokens = useContext(TokensContext)
  const theme = useTheme()
  const isLgDown = useMediaQuery(theme.breakpoints.down("lg"))

  if (!chainId) return null

  return (
    <Grid
      container
      alignItems="center"
      direction="row"
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        border: (theme) => `${theme.palette.other.divider} solid 1px`,
        py: 1,
        px: 3,
      }}
    >
      <Grid item container xs={7} lg={3.5} flexDirection="column" gap={1}>
        <Typography variant="h2">{farmName}</Typography>
        <TokenGroup>
          {farmName === "SDL/WETH SLP" ? (
            <>
              <TokenIcon symbol="SDL" alt="sdl" />
              <TokenIcon symbol="WETH" alt="weth" />
            </>
          ) : (
            poolTokens?.map((tokenAddress) => {
              const token = tokens?.[tokenAddress]
              if (!token) return <div></div>
              return (
                <TokenIcon
                  key={token.name}
                  symbol={token.symbol}
                  alt={token.symbol}
                />
              )
            })
          )}
        </TokenGroup>

        {isLgDown && (
          <React.Fragment>
            <Typography variant="subtitle1">
              TVL: {tvl ? `${formatBNToShortString(tvl, 18)}` : "_"}
            </Typography>
            <Typography variant="subtitle1">
              {t("myStaked")}:{" "}
              {myStake?.gt(Zero) ? formatBNToShortString(myStake, 18) : "_"}
            </Typography>
          </React.Fragment>
        )}
      </Grid>
      <Grid item xs={3}>
        <GaugeRewardsDisplay aprs={aprs} />
      </Grid>
      {!isLgDown && (
        <React.Fragment>
          <Grid item xs={0} lg={1.5}>
            <Typography variant="subtitle1">
              {tvl ? `$${formatBNToShortString(tvl, 18)}` : "_"}
            </Typography>
          </Grid>
          <Grid item xs={1.5}>
            <Typography variant="subtitle1">
              {myStake?.gt(Zero) ? formatBNToShortString(myStake, 18) : "_"}
            </Typography>
          </Grid>
        </React.Fragment>
      )}
      <Grid item xs={12} lg="auto" justifyContent="center">
        {/* <Button variant="outlined" size="large">
          {t("claimRewards")}
        </Button> */}
        <Button
          variant="contained"
          size="large"
          onClick={onClickStake}
          fullWidth
          sx={{ mt: 2 }}
        >
          {t("stakeOrUnstake")}
        </Button>
      </Grid>
    </Grid>
  )
}
