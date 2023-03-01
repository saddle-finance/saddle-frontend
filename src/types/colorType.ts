import { ButtonPropsColorOverrides } from "@mui/material/Button"
import { OverridableStringUnion } from "@mui/types"

// Button color variant interface

export type OriginColorVariant =
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "info"
  | "warning"

export type ColorVariant = OverridableStringUnion<
  OriginColorVariant,
  ButtonPropsColorOverrides
>
