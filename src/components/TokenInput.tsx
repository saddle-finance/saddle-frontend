import {
  Box,
  Button,
  FormHelperText,
  InputBase,
  Typography,
  useTheme,
} from "@mui/material"
import React, { ReactElement } from "react"
import { calculatePrice, commify } from "../utils"

import TokenIcon from "./TokenIcon"
import { formatBNToString } from "../utils"
import { readableDecimalNumberRegex } from "../constants"
import { useTranslation } from "react-i18next"

interface Props {
  max?: string
  inputValue: string
  onChange?: (value: string) => void
  disabled?: boolean
  readonly?: boolean
  showUSDprice?: boolean
  error?: boolean
  helperText?: string
  token: {
    symbol: string
    name: string
    priceUSD?: number
    decimals: number
  }
}

function TokenInput({
  max,
  inputValue,
  onChange,
  disabled,
  readonly,
  error,
  helperText,
  showUSDprice = true,
  token: {
    symbol: tokenSymbol,
    name: tokenName,
    priceUSD: tokenPriceUSD = 0,
    decimals: tokenDecimals,
  },
  ...rest
}: Props): ReactElement {
  const { t } = useTranslation()
  const theme = useTheme()

  function onChangeInput(e: React.ChangeEvent<HTMLInputElement>): void {
    const parsedValue = parseFloat("0" + e.target.value)
    const periodIndex = e.target.value.indexOf(".")
    const isValidInput = e.target.value === "" || !isNaN(parsedValue)
    const isValidPrecision =
      periodIndex === -1 ||
      e.target.value.length - 1 - periodIndex <= tokenDecimals
    if (isValidInput && isValidPrecision) {
      // don't allow input longer than the token allows

      // if value is not blank, then test the regex
      if (
        e.target.value === "" ||
        readableDecimalNumberRegex.test(e.target.value)
      ) {
        if (onChange) onChange(e.target.value)
      }
    }
  }

  return (
    <div {...rest}>
      {max && (
        <Box display="flex" alignItems="center" justifyContent="end">
          <Typography variant="subtitle2" sx={{ mr: 1 }}>
            {t("balance")}:
          </Typography>
          <Button
            size="small"
            disabled={readonly || disabled}
            onClick={() => onChange && onChange(String(max))}
          >
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
        <TokenIcon symbol={tokenSymbol} alt="icon" width={24} height={24} />
        <Box ml={1}>
          <Typography
            variant="subtitle1"
            color={disabled ? "text.secondary" : "text.primary"}
          >
            {tokenSymbol}
          </Typography>
          <Typography
            variant="body2"
            color={disabled ? "text.secondary" : "text.primary"}
          >
            {tokenName}
          </Typography>
        </Box>
        <Box textAlign="end" flex={1}>
          <InputBase
            autoComplete="off"
            autoCorrect="off"
            type="text"
            placeholder="0.0"
            spellCheck="false"
            disabled={disabled}
            value={inputValue}
            readOnly={readonly}
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
          {showUSDprice && (
            <Typography
              variant="body2"
              color={disabled ? "text.secondary" : "text.primary"}
              textAlign="end"
            >
              ≈$
              {commify(
                formatBNToString(
                  calculatePrice(inputValue, tokenPriceUSD || 0),
                  18,
                  2,
                ),
              )}
            </Typography>
          )}
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
