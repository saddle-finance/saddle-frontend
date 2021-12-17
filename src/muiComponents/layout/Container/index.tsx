import { AppBar, Toolbar } from "@mui/material"
import React, { PropsWithChildren, ReactElement } from "react"
import {
  ThemeMode,
  useThemeSettings,
} from "../../../providers/ThemeSettingsProvider"
import MuiContainer from "@mui/material/Container/Container"
import { Switch } from "@mui/material"

export default function Container({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  const { themeMode, onChangeMode } = useThemeSettings()
  const currentThemeSelected = themeMode === "dark" ?? "light"
  const handleSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    const mode: ThemeMode = checked ? "dark" : "light"
    onChangeMode(mode)
  }

  return (
    <MuiContainer maxWidth="lg">
      <AppBar elevation={2}>
        <Toolbar>
          Saddle
          <Switch
            defaultChecked={currentThemeSelected}
            onChange={handleSwitchChange}
          />
        </Toolbar>
      </AppBar>
      <Toolbar sx={{ marginBottom: "10px" }} />
      {children}
    </MuiContainer>
  )
}
