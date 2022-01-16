import { Components, Theme } from "@mui/material"
import AppBarTheme from "./AppBarTheme"
import BackdropTheme from "./BackdropTheme"
import ButtonTheme from "./ButtonTheme"
import { CssBaseLine } from "./CssBaseLine"
import DialogTheme from "./DialogTheme"
import IconButtonTheme from "./IconButtonTheme"
import PaperTheme from "./PaperTheme"
import TooltipTheme from "./TooltipTheme"
import { merge } from "lodash"

export default function componentsOverrides(theme: Theme): Components {
  return merge(
    AppBarTheme(theme),
    ButtonTheme(theme),
    DialogTheme(theme),
    IconButtonTheme(),
    TooltipTheme(),
    BackdropTheme(),
    PaperTheme(theme),
    CssBaseLine(),
  ) as Components
}
