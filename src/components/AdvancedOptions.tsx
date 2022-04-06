import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  InputAdornment,
  ToggleButton as MuiToggleButton,
  OutlinedInput,
  Stack,
  TextField,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  styled,
  useTheme,
} from "@mui/material"
import { Deadlines, GasPrices, Slippages } from "../state/user"
import React, { ReactElement } from "react"
import {
  updateGasPriceCustom,
  updateGasPriceSelected,
  updateInfiniteApproval,
  updatePoolAdvancedMode,
  updateSlippageCustom,
  updateSlippageSelected,
  updateTransactionDeadlineCustom,
  updateTransactionDeadlineSelected,
} from "../state/user"
import { useDispatch, useSelector } from "react-redux"

import { AppDispatch } from "../state"
import { AppState } from "../state/index"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import { PayloadAction } from "@reduxjs/toolkit"
import { useTranslation } from "react-i18next"

const ToggleButton = styled(MuiToggleButton)(({ theme }) => ({
  "&.Mui-selected": {
    border: `1px solid ${theme.palette.primary.main} !important`,
  },
}))

interface AdvancedOptionProps {
  isOutlined?: boolean
}
export default function AdvancedOptions({
  isOutlined,
}: AdvancedOptionProps): ReactElement {
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useDispatch<AppDispatch>()
  const {
    infiniteApproval,
    slippageCustom,
    slippageSelected,
    transactionDeadlineSelected,
    transactionDeadlineCustom,
    gasCustom,
    gasPriceSelected,
    userPoolAdvancedMode: advanced,
  } = useSelector((state: AppState) => state.user)

  const { gasStandard, gasFast, gasInstant } = useSelector(
    (state: AppState) => state.application,
  )

  const handleSlippage = (
    event: React.MouseEvent<HTMLElement>,
    slippageValue: Slippages,
  ) => {
    if (slippageValue) dispatch(updateSlippageSelected(slippageValue))
  }

  const handleDeadline = (
    event: React.MouseEvent<HTMLElement>,
    deadlineValue: Deadlines,
  ) => {
    // toggle button return null value when toggle button is selected.
    if (deadlineValue)
      dispatch(updateTransactionDeadlineSelected(deadlineValue))
  }
  return (
    <Box data-testid="advOptionContainer" mt={3} width="100%">
      <Accordion
        data-testid="advOptionTitle"
        onChange={(): PayloadAction<boolean> =>
          dispatch(updatePoolAdvancedMode(!advanced))
        }
        expanded={advanced}
        sx={{
          padding: 0,
          border: isOutlined ? "unset" : `1px solid ${theme.palette.divider}`,
          background: isOutlined
            ? "transparent"
            : theme.palette.background.paper,
        }}
      >
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon color="primary" />}
          sx={{
            padding: isOutlined ? 0 : theme.spacing(0, 3),
            borderBottom: isOutlined
              ? `1px solid ${theme.palette.primary.main}`
              : "unset",
          }}
        >
          <Typography color="primary" variant="subtitle1">
            {t("advancedOptions")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            padding: isOutlined ? 0 : theme.spacing(0, 3, 2, 3),
            marginTop: isOutlined ? 2 : 0,
          }}
        >
          <div data-testid="advTableContainer">
            <Box display="flex" data-testid="infiniteApprovalContainer">
              <Checkbox
                checked={infiniteApproval}
                onChange={(): PayloadAction<boolean> =>
                  dispatch(updateInfiniteApproval(!infiniteApproval))
                }
              />
              <Tooltip
                title={
                  <React.Fragment>
                    {t("infiniteApprovalTooltip")}
                  </React.Fragment>
                }
                placement="top"
              >
                <Typography
                  variant="body1"
                  sx={{ textDecoration: "underline" }}
                >
                  {t("infiniteApproval")}
                </Typography>
              </Tooltip>
            </Box>

            <Box mb={2}>
              <Typography variant="body1" mt={2} mb={1}>
                {t("maxSlippage")}:{" "}
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                data-testid="maxSlippageInputGroup"
              >
                <ToggleButtonGroup
                  size="small"
                  fullWidth
                  exclusive
                  color="mute"
                  value={slippageSelected}
                  onChange={handleSlippage}
                >
                  <ToggleButton size="small" value={Slippages.OneTenth}>
                    0.1%
                  </ToggleButton>
                  <ToggleButton value={Slippages.One}>1%</ToggleButton>
                </ToggleButtonGroup>
                <TextField
                  value={slippageCustom?.valueRaw}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    const value = e.target.value
                    if (value && !isNaN(+value)) {
                      dispatch(updateSlippageCustom(value))
                      if (slippageSelected !== Slippages.Custom) {
                        dispatch(updateSlippageSelected(Slippages.Custom))
                      }
                    } else {
                      dispatch(updateSlippageSelected(Slippages.OneTenth))
                    }
                  }}
                  sx={{ width: 150 }}
                />
              </Stack>
            </Box>

            <Typography variant="body1" mt={2} mb={1}>
              {t("deadline")}:{" "}
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              data-testid="txnDeadlineInputGroup"
            >
              <ToggleButtonGroup
                size="small"
                fullWidth
                exclusive
                color="mute"
                value={transactionDeadlineSelected}
                onChange={handleDeadline}
              >
                <ToggleButton value={Deadlines.Twenty}>
                  20 {t("minutes")}
                </ToggleButton>
                <ToggleButton value={Deadlines.Forty}>
                  40 {t("minutes")}
                </ToggleButton>
              </ToggleButtonGroup>
              <OutlinedInput
                type="text"
                size="small"
                endAdornment={
                  <InputAdornment position="end">min</InputAdornment>
                }
                placeholder="20"
                onClick={(): PayloadAction<Deadlines> =>
                  dispatch(updateTransactionDeadlineSelected(Deadlines.Custom))
                }
                value={transactionDeadlineCustom}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  const value = e.target.value
                  if (value && !isNaN(+value)) {
                    dispatch(updateTransactionDeadlineCustom(value))
                    if (transactionDeadlineSelected !== Deadlines.Custom) {
                      dispatch(
                        updateTransactionDeadlineSelected(Deadlines.Custom),
                      )
                    }
                  } else {
                    dispatch(
                      updateTransactionDeadlineSelected(Deadlines.Twenty),
                    )
                  }
                }}
                sx={{ width: 150 }}
              />
            </Stack>
            <div style={{ display: "none" }}>
              <div>
                <Typography variant="body1">{t("gas")}:</Typography>
                <Stack direction="row" spacing={2}>
                  <ToggleButtonGroup
                    size="small"
                    value={gasPriceSelected}
                    exclusive
                    fullWidth
                  >
                    {[
                      GasPrices.Standard,
                      GasPrices.Fast,
                      GasPrices.Instant,
                    ].map((gasPriceConst) => {
                      let priceValue
                      let text
                      if (gasPriceConst === GasPrices.Standard) {
                        priceValue = gasStandard
                        text = t("standard")
                      } else if (gasPriceConst === GasPrices.Fast) {
                        priceValue = gasFast
                        text = t("fast")
                      } else {
                        priceValue = gasInstant
                        text = t("instant")
                      }

                      return (
                        <ToggleButton
                          key={gasPriceConst}
                          value={gasPriceConst}
                          onClick={(): PayloadAction<GasPrices> =>
                            dispatch(updateGasPriceSelected(gasPriceConst))
                          }
                        >
                          <div>
                            <div>{priceValue}</div>
                            <div>{text}</div>
                          </div>
                        </ToggleButton>
                      )
                    })}
                  </ToggleButtonGroup>
                  <TextField
                    type="text"
                    value={gasCustom?.valueRaw}
                    onChange={(
                      e: React.ChangeEvent<HTMLInputElement>,
                    ): void => {
                      const value = e.target.value
                      if (value && !isNaN(+value)) {
                        dispatch(updateGasPriceCustom(value))
                        if (gasPriceSelected !== GasPrices.Custom) {
                          dispatch(updateGasPriceSelected(GasPrices.Custom))
                        }
                      } else {
                        dispatch(updateGasPriceSelected(GasPrices.Fast))
                      }
                    }}
                  />
                </Stack>
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}
