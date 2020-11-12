import "./ThemeChanger.scss"

import React, { ReactElement, useEffect, useState } from "react"

const ThemeChanger = (): ReactElement => {
  const [themeState, setThemeState] = useState(false)

  useEffect(() => {
    const getTheme = localStorage.getItem("Theme")
    if (getTheme === "dark") {
      setThemeState(true)
    }
  }, [])

  useEffect(() => {
    if (themeState) {
      localStorage.setItem("Theme", "dark")
      document.body.classList.add("dark")
    } else {
      localStorage.setItem("Theme", "light")
      document.body.classList.remove("dark")
    }
  }, [themeState])

  return (
    <div className="themeChanger">
      <button onClick={(): void => setThemeState(!themeState)}>
        {themeState ? "☾" : "☀"}
      </button>
    </div>
  )
}

export default ThemeChanger
