// ---------------------------------------------------------------------

import { TypographyOptions } from "@mui/material/styles/createTypography"

function pxToRem(value: number): string {
  return `${value / 16}rem`
}

const SOURCE_CODE_PRO_FAMILY = ['"Source Code Pro"', "monospace"].join(",")
const NOE_DISPLAY_FAMILY = ['"Noe Display"'].join(",")

declare module "@mui/material/styles/createTypography" {}

const typography: TypographyOptions = {
  fontFamily: SOURCE_CODE_PRO_FAMILY,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightBold: 700,
  h1: {
    fontFamily: NOE_DISPLAY_FAMILY,
    fontWeight: 700,
    fontSize: pxToRem(32),
    lineHeight: 40 / 32,
  },
  h2: {
    fontFamily: NOE_DISPLAY_FAMILY,
    fontWeight: 700,
    fontSize: pxToRem(24),
    lineHeight: 32 / 24,
  },
  h3: {
    fontFamily: NOE_DISPLAY_FAMILY,
    fontWeight: 700,
    fontSize: pxToRem(22),
  },
  h4: {
    fontSize: pxToRem(20),
    lineHeight: 24 / 20,
  },
  h5: {
    fontWeight: 700,
    fontSize: pxToRem(18),
  },
  h6: {
    fontWeight: 700,
    fontSize: pxToRem(17),
  },
  subtitle1: {
    fontWeight: 700,
    fontSize: pxToRem(16),
    lineHeight: 20.11 / 16,
  },
  subtitle2: {
    fontWeight: 600,
    fontSize: pxToRem(12),
    lineHeight: 16 / 12,
  },
  body1: {
    fontSize: pxToRem(16),
    lineHeight: 20.11 / 16,
  },
  body2: {
    fontSize: pxToRem(12),
    lineHeight: 16 / 12,
  },
  caption: {
    fontSize: pxToRem(12),
    lineHeight: 16 / 12,
  },
  button: {
    fontWeight: 700,
    fontSize: pxToRem(16),
  },
}

export default typography
