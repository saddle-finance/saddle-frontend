import { Components, Theme } from "@mui/material"
import AccordionTheme from "./AccordionTheme"
import AlertTheme from "./AlertTheme"
import AppBarTheme from "./AppBarTheme"
import BackdropTheme from "./BackdropTheme"
import ButtonTheme from "./ButtonTheme"
import CheckboxTheme from "./CheckboxTheme"
import ChipTheme from "./ChipTheme"
import { CssBaseLine } from "./CssBaseLine"
import DialogTheme from "./DialogTheme"
import DialogTitleTheme from "./DialogTitleTheme"
import IconButtonTheme from "./IconButtonTheme"
import ListItemButtonTheme from "./ListItemButtonTheme"
import ListItemIconTheme from "./ListItemIconTheme"
import MenuItemTheme from "./MenuItemTheme"
import MenuTheme from "./MenuTheme"
import PaperTheme from "./PaperTheme"
import RadioButtonTheme from "./RadioButtonTheme"
import TextFieldTheme from "./TextFieldTheme"
import ToggleButtonTheme from "./ToggleButtonTheme"
import TooltipTheme from "./TooltipTheme"
import { merge } from "lodash"

export default function componentsOverrides(theme: Theme): Components {
  return merge(
    AppBarTheme(),
    AccordionTheme(theme),
    AlertTheme(theme),
    ButtonTheme(theme),
    CheckboxTheme(),
    ChipTheme(theme),
    DialogTheme(theme),
    DialogTitleTheme(theme),
    IconButtonTheme(theme),
    MenuTheme(theme),
    MenuItemTheme(),
    TooltipTheme(theme),
    ToggleButtonTheme(theme),
    BackdropTheme(),
    PaperTheme(theme),
    CssBaseLine(),
    ListItemButtonTheme(theme),
    ListItemIconTheme(theme),
    RadioButtonTheme(),
    TextFieldTheme(),
  ) as Components
}
