import "./ThemeChanger.scss"

import React, { ReactElement, useContext } from "react"

import { ThemeContext } from "../providers/ThemeProvider"

const ThemeChanger = (): ReactElement => {
  const { toggleTheme, userDarkMode } = useContext(ThemeContext)

  return (
    <div className="themeChanger">
      <button
        onClick={(): void => {
          toggleTheme()
        }}
      >
        {userDarkMode ? "☾" : "☀"}
      </button>
    </div>
  )
}

export default ThemeChanger
