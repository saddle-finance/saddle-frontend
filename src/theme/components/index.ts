import { Components, Theme } from "@mui/material"
import AppBarTheme from "./AppbarTheme"
import BackdropTheme from "./BackdropTheme"
import DialogTheme from "./DialogTheme"
import TooltipTheme from "./TooltipTheme"
import { merge } from "lodash"

export default function componentsOverrides(theme: Theme): Components {
  return merge(
    AppBarTheme(theme),
    DialogTheme(theme),
    TooltipTheme,
    BackdropTheme,
  )
}
