import { Components, Theme } from "@mui/material"
import AppBarTheme from "./AppBarTheme"
import BackdropTheme from "./BackdropTheme"
import ButtonTheme from "./ButtonTheme"
import { CssBaseLine } from "./CssBaseLine"
import DialogTheme from "./DialogTheme"
import IconButtonTheme from "./IconButtonTheme"
import ListItemButtonTheme from "./ListItemButtonTheme"
import MenuItemTheme from "./MenuItemTheme"
import MenuTheme from "./MenuTheme"
import PaperTheme from "./PaperTheme"
import TooltipTheme from "./TooltipTheme"
import { merge } from "lodash"

export default function componentsOverrides(theme: Theme): Components {
  return merge(
    AppBarTheme(),
    ButtonTheme(theme),
    DialogTheme(theme),
    IconButtonTheme(),
    MenuTheme(theme),
    MenuItemTheme(),
    TooltipTheme(),
    BackdropTheme(),
    PaperTheme(theme),
    CssBaseLine(),
    ListItemButtonTheme(theme),
  ) as Components
}
