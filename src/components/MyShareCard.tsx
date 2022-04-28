import { Box, Divider, Stack, Typography } from "@mui/material"
import { POOLS_MAP, PoolTypes } from "../constants"
import React, { ReactElement } from "react"
import { formatBNToPercentString, formatBNToString } from "../utils"

import { Partners } from "../utils/thirdPartyIntegrations"
import TokenIcon from "./TokenIcon"
import { UserShareType } from "../hooks/usePoolData"
import { Zero } from "@ethersproject/constants"
import { commify } from "@ethersproject/units"
import { useTranslation } from "react-i18next"

interface Props {
  data: UserShareType | null
}

function MyShareCard({ data }: Props): ReactElement | null {
  const { t } = useTranslation()

  if (!data) return null
  const { type: poolType } = POOLS_MAP[data.name]
  const formattedDecimals = poolType === PoolTypes.USD ? 2 : 4

  const formattedData = {
    share: formatBNToPercentString(data.share, 18),
    usdBalance: commify(formatBNToString(data.usdBalance, 18, 2)),
    amount: commify(
      formatBNToString(data.underlyingTokensAmount, 18, formattedDecimals),
    ),
    amountsStaked: Object.keys(data.amountsStaked).reduce((acc, key) => {
      const value = data.amountsStaked[key]
      return value
        ? {
            ...acc,
            [key]: commify(formatBNToString(value, 18, formattedDecimals)),
          }
        : acc
    }, {} as typeof data.amountsStaked),
    tokens: data.tokens.map((coin) => {
      return {
        symbol: coin.symbol,
        name: coin.name,
        value: commify(formatBNToString(coin.value, 18, formattedDecimals)),
      }
    }),
  }
  const stakingUrls = {
    sharedStake: "https://dashboard.keep.network/liquidity",
    alchemix: "https://app.alchemix.fi/farms",
  }

  return (
    <Box mb={3}>
      <Typography variant="h1" mb={3}>
        {t("myShare")}
      </Typography>
      <Typography>
        {formattedData.share} {t("ofPool")}
      </Typography>
      <Typography>{`${t("balance")}: $${formattedData.usdBalance}`}</Typography>
      <Typography>{`${t("lpAmount")}: ${formattedData.amount}`}</Typography>
      {Object.keys(stakingUrls).map((key) => {
        return data.amountsStaked[key as Partners]?.gt(Zero) ? (
          <Typography component="span">
            &nbsp;
            <a
              href={stakingUrls[key]}
              target="_blank"
              rel="noopener noreferrer"
            >
              ({formattedData.amountsStaked[key as Partners]} {t("staked")})
            </a>
          </Typography>
        ) : null
      })}
      <Stack direction="row" mb={2} flexWrap="wrap">
        {formattedData.tokens.map((token) => (
          <Box key={token.symbol} pt={3} pr={4}>
            <Box display="flex" alignItems="center">
              <TokenIcon
                alt="icon"
                symbol={token.symbol}
                width={20}
                height={20}
              />
              <Typography variant="subtitle1" ml={1} data-testid="tokenName">
                {token.symbol}
              </Typography>
            </Box>
            <Typography data-testid="tokenValue">{token.value}</Typography>
          </Box>
        ))}
      </Stack>
      <Divider />
    </Box>
  )
}

export default MyShareCard
