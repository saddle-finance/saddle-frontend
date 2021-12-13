import "./ThemeChanger.scss"

import React, { ReactElement } from "react"

import useSettings from "../hooks/useSetting"

const ThemeChanger = (): ReactElement => {
  const { themeMode, onChangeMode } = useSettings()

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
