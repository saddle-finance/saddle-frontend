import { Box, Stack, Typography } from "@mui/material"
import { POOLS_MAP, PoolTypes, TOKENS_MAP } from "../constants"
import { Partners, UserShareType } from "../hooks/usePoolData"
import React, { ReactElement } from "react"
import { formatBNToPercentString, formatBNToString } from "../utils"

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
      const value = data.amountsStaked[key as keyof typeof data.amountsStaked]
      return value
        ? {
            ...acc,
            [key]: commify(formatBNToString(value, 18, formattedDecimals)),
          }
        : acc
    }, {} as typeof data.amountsStaked),
    tokens: data.tokens.map((coin) => {
      const token = TOKENS_MAP[coin.symbol]
      return {
        symbol: token.symbol,
        name: token.name,
        value: commify(formatBNToString(coin.value, 18, formattedDecimals)),
      }
    }),
  }
  const stakingUrls = {
    keep: "https://dashboard.keep.network/liquidity",
    sharedStake: "https://dashboard.keep.network/liquidity",
    alchemix: "https://app.alchemix.fi/farms",
  }

  return (
    <Box>
      <Typography variant="h1" mb={3}>
        {t("myShare")}
      </Typography>
      <div>
        <div>
          <Typography component="span">
            {formattedData.share} {t("ofPool")}
          </Typography>
        </div>
        <Box display="flex">
          <Typography component="span">{`${t("usdBalance")}: `}</Typography>
          <Typography component="span">{`$${formattedData.usdBalance}`}</Typography>
        </Box>
        <Box display="flex">
          <Typography component="span">{`${t("totalAmount")}: `}</Typography>
          <Typography component="span">{formattedData.amount}</Typography>
        </Box>
        {Object.keys(data.amountsStaked).map((key) => {
          return data.amountsStaked[key as Partners]?.gt(Zero) ? (
            <Typography component="span">
              &nbsp;
              <a
                href={stakingUrls[key as Partners]}
                target="_blank"
                rel="noopener noreferrer"
              >
                ({formattedData.amountsStaked[key as Partners]} {t("staked")})
              </a>
            </Typography>
          ) : null
        })}
      </div>
      <Stack direction="row" spacing={4}>
        {formattedData.tokens.map((coin) => (
          <div key={coin.symbol}>
            <Typography variant="subtitle1">{coin.symbol}</Typography>
            <Typography>{coin.value}</Typography>
          </div>
        ))}
      </Stack>
    </Box>
  )
}

export default MyShareCard
