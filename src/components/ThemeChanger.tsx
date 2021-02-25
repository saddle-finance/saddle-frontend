import "./ThemeChanger.scss"

import { AppDispatch, AppState } from "../state"
import React, { ReactElement, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import { updateDarkMode } from "../state/user"
import { useColorMode } from "@chakra-ui/react"

const ThemeChanger = (): ReactElement => {
  const dispatch = useDispatch<AppDispatch>()
  const { colorMode, toggleColorMode } = useColorMode()
  const { userDarkMode } = useSelector((state: AppState) => state.user)

  useEffect(() => {
    if (userDarkMode) {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }, [userDarkMode])

  return (
    <div className="themeChanger">
      <button
        onClick={(): void => {
          dispatch(updateDarkMode(!userDarkMode))
          if (
            (userDarkMode && colorMode === "dark") ||
            (!userDarkMode && colorMode === "light")
          ) {
            toggleColorMode()
          }
        }}
      >
        {userDarkMode ? "☾" : "☀"}
      </button>
    </div>
  )
}

export default ThemeChanger
