import { Components, Theme } from "@mui/material"
import AppBarTheme from "./AppBarTheme"
import BackdropTheme from "./BackdropTheme"
import { CssBaseLine } from "./CssBaseLine"
import DialogTheme from "./DialogTheme"
import TooltipTheme from "./TooltipTheme"
import { merge } from "lodash"

export default function componentsOverrides(theme: Theme): Components {
  return merge(
    CssBaseLine(),
    AppBarTheme(theme),
    DialogTheme(theme),
    TooltipTheme(),
    BackdropTheme(),
  )
}
