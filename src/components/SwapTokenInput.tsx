import { ArrowDropDown, CheckCircleOutline } from "@mui/icons-material"
import {
  Button,
  Chip,
  InputBase,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import React, { useEffect } from "react"
import { commify, formatBNToString, isNumberOrEmpty } from "../utils"
import { styled, useTheme } from "@mui/material/styles"
import { useRef, useState } from "react"

import Autocomplete from "@mui/material/Autocomplete"
import { BigNumber } from "ethers"
import Box from "@mui/material/Box"
import ClickAwayListener from "@mui/material/ClickAwayListener"
import Popper from "@mui/material/Popper"
import { SWAP_TYPES } from "../constants"
import Search from "@mui/icons-material/Search"
import TokenIcon from "./TokenIcon"
import { TokenOption } from "../types"
import { matchSorter } from "match-sorter"
import { useTranslation } from "react-i18next"

const StyledPopper = styled(Popper)(({ theme }) => ({
  border: `1px solid ${theme.palette.other.divider}`,
  borderRadius: theme.shape.borderRadius,
  width: 400,
  padding: theme.spacing(2),
  zIndex: theme.zIndex.modal,
  backgroundColor: theme.palette.background.paper,
}))

interface SwapTokenInputProps {
  tokens: TokenOption[]
  selected?: string
  inputValue: string
  inputValueUSD: BigNumber
  isSwapFrom?: boolean
  onSelect?: (tokenSymbol: string) => void
  onChangeAmount?: (value: string) => void
}

export default function SwapTokenInput({
  tokens,
  selected: selectedTokenSymbol,
  inputValue,
  inputValueUSD,
  isSwapFrom,
  onSelect,
  onChangeAmount,
  ...rest
}: SwapTokenInputProps): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [popOverWidth, setPopOverWidth] = useState<number | undefined>()
  const theme = useTheme()

  const filterOptions = (
    options: TokenOption[],
    { inputValue }: { inputValue: string },
  ) =>
    matchSorter(options, inputValue, {
      sorter: (rankedItems) => rankedItems,
      threshold: matchSorter.rankings.WORD_STARTS_WITH,
      keys: ["symbol", "address", "name"],
    })

  useEffect(() => {
    const containerWidth = containerRef.current?.offsetWidth
    setPopOverWidth(containerWidth)
  }, [containerRef.current?.offsetWidth])

  const handleClick = () => {
    // setAnchorEl(event.currentTarget)
    if (containerRef?.current) setAnchorEl(containerRef.current)
  }

  const handleClose = () => {
    if (anchorEl) {
      anchorEl.focus()
    }
    setAnchorEl(null)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    // if value is not blank, then test the regex
    if (isNumberOrEmpty(e.target.value)) onChangeAmount?.(e.target.value)
  }

  const handleFocus = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  ) => {
    event.target.select()
  }
  const open = Boolean(anchorEl)

  return (
    <div {...rest}>
      <Box
        display="flex"
        alignItems="center"
        padding={1}
        borderRadius="6px"
        border={`1px solid ${theme.palette.other.border} `}
        bgcolor={theme.palette.background.paper}
        ref={containerRef}
      >
        {selectedTokenSymbol && (
          <Box width={24} height={24} marginRight={1}>
            <TokenIcon
              symbol={selectedTokenSymbol}
              alt={selectedTokenSymbol}
              width="100%"
              height="100%"
            />
          </Box>
        )}
        <Box flexWrap="nowrap">
          <Button
            onClick={handleClick}
            endIcon={<ArrowDropDown />}
            data-testid="listOpenBtn"
          >
            <Typography variant="subtitle1">
              {selectedTokenSymbol || "Choose"}
            </Typography>
          </Button>
          <Typography
            variant="body2"
            noWrap
            paddingLeft={1}
            color="text.secondary"
          >
            {selectedTokenSymbol}
          </Typography>
        </Box>
        <Box flex={1}>
          <InputBase
            placeholder="0.0"
            type="text"
            data-testid="tokenValueInput"
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            value={isSwapFrom ? inputValue : commify(inputValue)}
            onChange={handleInputChange}
            inputProps={{
              style: {
                textAlign: "end",
                padding: 0,
                fontFamily: theme.typography.body1.fontFamily,
                fontSize: theme.typography.body1.fontSize,
              },
            }}
            onFocus={handleFocus}
            fullWidth
            readOnly={!isSwapFrom}
            tabIndex={isSwapFrom ? 0 : -1}
          />
          <Typography
            data-testid="inputValueUSD"
            variant="body2"
            color="text.secondary"
            textAlign="end"
          >
            ≈$
            {commify(formatBNToString(inputValueUSD, 18, 2))}
          </Typography>
        </Box>
      </Box>

      <StyledPopper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{ width: popOverWidth ? popOverWidth : 400 }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Box height="100%" borderRadius="6px">
            <Autocomplete
              open={open}
              options={tokens}
              popupIcon={null}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  data-testid="searchTermInput"
                  ref={params.InputProps.ref}
                  InputProps={{
                    startAdornment: <Search />,
                  }}
                  inputProps={params.inputProps}
                  placeholder="Search name, symbol, or address"
                  autoFocus
                />
              )}
              onChange={(event, newValue, reason) => {
                if (
                  event.type === "keydown" &&
                  (event as React.KeyboardEvent).key === "Backspace" &&
                  reason === "removeOption"
                ) {
                  return
                }
                setAnchorEl(null)
                if (newValue?.address) {
                  onSelect?.(newValue?.address)
                }
              }}
              renderOption={(props, option) => (
                <ListItem
                  listItemProps={props}
                  {...option}
                  key={option.address}
                />
              )}
              filterOptions={filterOptions}
              getOptionLabel={(option) => option.address}
              getOptionDisabled={(option) => !option.isAvailable}
              PopperComponent={(props) => (
                <div {...props} data-testid="dropdownContainer"></div>
              )}
              PaperComponent={(props) => <Box {...props} marginRight={-2} />}
              noOptionsText={"No tokens found."}
              disabledItemsFocusable
            />
          </Box>
        </ClickAwayListener>
      </StyledPopper>
    </div>
  )
}

function ListItem({
  amount,
  valueUSD,
  name,
  symbol,
  decimals,
  isAvailable,
  isOnTokenLists,
  swapType,
  listItemProps,
}: TokenOption & {
  listItemProps: React.HTMLAttributes<HTMLLIElement>
}) {
  const theme = useTheme()
  const { t } = useTranslation()
  const isVirtualSwap = (
    [
      SWAP_TYPES.SYNTH_TO_SYNTH,
      SWAP_TYPES.SYNTH_TO_TOKEN,
      SWAP_TYPES.TOKEN_TO_SYNTH,
      SWAP_TYPES.TOKEN_TO_TOKEN,
    ] as Array<SWAP_TYPES | null>
  ).includes(swapType)
  return (
    <li
      {...listItemProps}
      data-testid="swapTokenItem"
      style={{
        paddingLeft: 0,
        borderBottom: `1px solid ${theme.palette.other.border}`,
      }}
    >
      <Stack direction="row" width="100%" alignItems="center">
        <Box mr={1} width={24} height={24}>
          <TokenIcon symbol={symbol} alt={name} height="100%" width="100%" />
        </Box>
        <Box>
          <Box display="flex" alignItems="center">
            <Typography color="text.primary">{symbol}</Typography>
            {isOnTokenLists && (
              <CheckCircleOutline sx={{ marginLeft: 1, width: 20 }} />
            )}
            {!isAvailable && (
              <Chip
                variant="outlined"
                label={t("unavailable")}
                size="small"
                sx={{ marginLeft: 1 }}
              />
            )}
            {isAvailable && isVirtualSwap && (
              <Chip
                variant="outlined"
                color="primary"
                label={t("virtualSwap")}
                size="small"
                sx={{ marginLeft: 1 }}
              />
            )}
          </Box>
          <Typography color="text.secondary">{name}</Typography>
        </Box>
        <Box flex={1} sx={{ marginRight: 0, textAlign: "end" }}>
          <Typography color="text.primary">
            {commify(formatBNToString(amount, decimals))}
          </Typography>
          <Typography color="text.secondary">
            ≈${commify(formatBNToString(valueUSD, 18, 2))}
          </Typography>
        </Box>
      </Stack>
    </li>
  )
}
