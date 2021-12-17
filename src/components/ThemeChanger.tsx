import "./ThemeChanger.scss"

import React, { ReactElement } from "react"
import { useThemeSettings } from "../providers/ThemeSettingsProvider"

const ThemeChanger = (): ReactElement => {
  const { themeMode, onChangeMode } = useThemeSettings()

  const handleThemeChange = () => {
    onChangeMode(themeMode === "light" ? "dark" : "light")
  }

  return (
    <div className="themeChanger">
      <button
        onClick={(): void => {
          handleThemeChange()
        }}
      >
        {themeMode == "dark" ? "☾" : "☀"}
      </button>
    </div>
  )
}

export default ThemeChanger
