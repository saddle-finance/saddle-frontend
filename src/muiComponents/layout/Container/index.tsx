import { AppBar, Toolbar } from "@mui/material"
import React, { PropsWithChildren, ReactElement } from "react"
import MuiContainer from "@mui/material/Container/Container"
import { Switch } from "@mui/material"
import { ThemeMode } from "../../../providers/SettingContext"
import useSettings from "../../../hooks/useSetting"

export default function Container({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  const { themeMode, onChangeMode } = useSettings()
  const themeSwitchChecked = themeMode === "dark" ?? "light"
  const handleSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    const mode: ThemeMode = checked ? "dark" : "light"
    onChangeMode(mode)
  }

  console.log("theme value ==>", themeSwitchChecked)
  return (
    <MuiContainer maxWidth="lg">
      <AppBar elevation={2}>
        <Toolbar>
          Saddle
          <Switch
            defaultChecked={themeSwitchChecked}
            onChange={handleSwitchChange}
          />
        </Toolbar>
      </AppBar>
      <Toolbar sx={{ marginBottom: "10px" }} />
      {children}
    </MuiContainer>
  )
}
