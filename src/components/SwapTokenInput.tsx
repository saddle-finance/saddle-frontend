import * as React from "react"

import { Button, InputBase, Stack, TextField, Typography } from "@mui/material"
import { ReactElement, useRef, useState } from "react"
import { commify, formatBNToString } from "../utils"
import { styled, useTheme } from "@mui/material/styles"
import { ArrowDropDown } from "@mui/icons-material"
import Autocomplete from "@mui/material/Autocomplete"
import { BigNumber } from "ethers"
import Box from "@mui/material/Box"
import ClickAwayListener from "@mui/material/ClickAwayListener"
import Popper from "@mui/material/Popper"
import Search from "@mui/icons-material/Search"
import { TokenOption } from "../pages/Swap"

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
  // selected,
  inputValue,
  inputValueUSD,
  onSelect,
  onChangeAmount,
}: SwapTokenInputProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [value, setValue] = useState<TokenOption | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const theme = useTheme()

  console.log("tokens ==>", tokens)

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
    const re = /^[0-9]*[.,]?[0-9]*$/
    // if value is not blank, then test the regex
    if (e.target.value === "" || re.test(e.target.value)) {
      // setInputValue(e.target.value)
      onChangeAmount?.(e.target.value)
    }
  }

  const handleFocus = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  ) => {
    event.target.select()
  }

  const open = Boolean(anchorEl)

  return (
    <React.Fragment>
      <Box
        display="flex"
        alignItems="center"
        padding={1}
        borderRadius="6px"
        border={`1px solid ${theme.palette.other.border} `}
        bgcolor={theme.palette.background.paper}
        ref={containerRef}
      >
        {value?.icon && (
          <Box width={24} height={24} marginRight={1}>
            <img
              src={value?.icon}
              alt={value?.name}
              width="100%"
              height="100%"
            />
          </Box>
        )}

        <Box flexWrap="nowrap">
          <Button
            disableRipple
            onClick={handleClick}
            endIcon={<ArrowDropDown />}
            disableElevation
            disableFocusRipple
          >
            <Typography variant="subtitle1">
              {value?.symbol || "Choose"}
            </Typography>
          </Button>
          <Typography
            variant="body2"
            noWrap
            paddingLeft={1}
            color="text.secondary"
          >
            {value?.name}
          </Typography>
        </Box>
        <Box flex={1}>
          <InputBase
            placeholder="0.0"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            value={inputValue}
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
          />
          <Typography variant="body2" color="text.secondary" textAlign="end">
            ≈$
            {commify(formatBNToString(inputValueUSD, 18, 2))}
          </Typography>
        </Box>
      </Box>

      <StyledPopper open={open} anchorEl={anchorEl} placement="bottom-start">
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
                  ref={params.InputProps.ref}
                  InputProps={{
                    startAdornment: <Search />,
                  }}
                  inputProps={params.inputProps}
                  placeholder="Search name"
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
                setValue(newValue)
                setAnchorEl(null)
                if (newValue?.symbol) {
                  onSelect?.(newValue?.symbol)
                }
              }}
              renderOption={(props, option) => (
                <li
                  {...props}
                  style={{
                    paddingLeft: 0,
                    borderBottom: `1px solid  ${theme.palette.other.border}`,
                    overflow: "visible",
                  }}
                >
                  <Stack direction="row" width="100%" alignItems="center">
                    <Box mr={1} width={24} height={24}>
                      <img
                        src={option.icon}
                        alt={option.name}
                        height="100%"
                        width="100%"
                      />
                    </Box>
                    <Box>
                      <Typography color="text.primary">
                        {option.symbol}
                      </Typography>
                      <Typography color="text.secondary">
                        {option.name}
                      </Typography>
                    </Box>
                    <Box flex={1} sx={{ marginRight: 0, textAlign: "end" }}>
                      <Typography color="text.primary">
                        {formatBNToString(option.amount, option.decimals)}
                      </Typography>
                      <Typography color="text.secondary">
                        {formatBNToString(option.valueUSD, option.decimals)}
                      </Typography>
                    </Box>
                  </Stack>
                </li>
              )}
              getOptionLabel={(option) => option.symbol}
              PopperComponent={(props) => <div {...props}></div>}
              PaperComponent={(props) => <Box {...props} marginRight={-2} />}
              noOptionsText={"No tokens found."}
            />
          </Box>
        </ClickAwayListener>
      </StyledPopper>
    </React.Fragment>
  )
}
