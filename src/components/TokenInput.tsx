import {
  Box,
  Button,
  FormHelperText,
  InputBase,
  Typography,
  useTheme,
} from "@mui/material"
import {
  LPTOKEN_TO_POOL_MAP,
  // TOKENS_MAP,
  readableDecimalNumberRegex,
} from "../constants"
import React, { ReactElement } from "react"
import { calculatePrice, commify } from "../utils"
import { AppState } from "../state/index"
import { BigNumber } from "ethers"
import TokenIcon from "./TokenIcon"
import { Zero } from "@ethersproject/constants"
import { formatBNToString } from "../utils"
import usePoolData from "../hooks/usePoolData"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

interface Props {
  symbol: string
  name?: string
  max?: string
  inputValue: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
  helperText?: string
}

function TokenInput({
  symbol,
  name,
  max,
  inputValue,
  onChange,
  disabled,
  error,
  helperText,
}: Props): ReactElement {
  const { t } = useTranslation()
  const theme = useTheme()

  let tokenUSDValue: number | BigNumber | undefined
  const poolName = LPTOKEN_TO_POOL_MAP[symbol]
  const [poolData] = usePoolData(poolName)
  const { tokenPricesUSD } = useSelector((state: AppState) => state.application)

  if (poolData.lpTokenPriceUSD != Zero) {
    tokenUSDValue = parseFloat(
      formatBNToString(poolData.lpTokenPriceUSD, 18, 2),
    )
  } else {
    tokenUSDValue = tokenPricesUSD?.[symbol]
  }

  function onChangeInput(e: React.ChangeEvent<HTMLInputElement>): void {
    // const { decimals } = TOKENS_MAP[symbol]
    const parsedValue = parseFloat("0" + e.target.value)
    // const periodIndex = e.target.value.indexOf(".")
    const isValidInput = e.target.value === "" || !isNaN(parsedValue)
    // const isValidPrecision =
    //   periodIndex === -1 || e.target.value.length - 1 - periodIndex <= decimals
    // if (isValidInput && isValidPrecision) {
    if (isValidInput) {
      // don't allow input longer than the token allows

      // if value is not blank, then test the regex
      if (
        e.target.value === "" ||
        readableDecimalNumberRegex.test(e.target.value)
      ) {
        onChange(e.target.value)
      }
    }
  }

  return (
    <div>
      {max != null && (
        <Box display="flex" alignItems="center" justifyContent="end">
          <Typography variant="subtitle2" sx={{ mr: 1 }}>
            {t("balance")}:
          </Typography>
          <Button size="small" onClick={() => onChange(String(max))}>
            <Typography variant="subtitle2">{max}</Typography>
          </Button>
        </Box>
      )}

      <Box
        id="tokenInput"
        display="flex"
        borderRadius="6px"
        alignItems="center"
        border={`1px solid ${
          !error ? theme.palette.other.border : theme.palette.error.main
        }`}
        bgcolor={
          disabled ? theme.palette.action.disabledBackground : "transparent"
        }
        p={1}
        sx={{
          cursor: disabled ? "not-allowed" : "auto",
          opacity: disabled ? theme.palette.action.disabledOpacity : 1,
        }}
      >
        <TokenIcon symbol={symbol} alt="icon" width={24} height={24} />
        <Box ml={1}>
          <Typography
            variant="subtitle1"
            color={disabled ? "text.secondary" : "text.primary"}
          >
            {symbol}
          </Typography>
          <Typography
            variant="body2"
            color={disabled ? "text.secondary" : "text.primary"}
          >
            {name}
          </Typography>
        </Box>
        <Box textAlign="end" flex={1}>
          <InputBase
            autoComplete="off"
            autoCorrect="off"
            type="text"
            placeholder="0.0"
            spellCheck="false"
            disabled={disabled ? true : false}
            value={inputValue}
            inputProps={{
              style: {
                textAlign: "end",
                padding: 0,
                fontFamily: theme.typography.body1.fontFamily,
                fontSize: theme.typography.body1.fontSize,
              },
            }}
            onChange={onChangeInput}
            onFocus={(e) => e.target.select()}
            fullWidth
          />
          <Typography
            variant="body2"
            color={disabled ? "text.secondary" : "text.primary"}
            textAlign="end"
          >
            ≈$
            {commify(
              formatBNToString(
                calculatePrice(inputValue, tokenUSDValue),
                18,
                2,
              ),
            )}
          </Typography>
        </Box>
      </Box>
      <FormHelperText
        disabled={disabled}
        error={error}
        sx={{ textAlign: "end" }}
      >
        {helperText}
      </FormHelperText>
    </div>
  )
}

export default TokenInput
