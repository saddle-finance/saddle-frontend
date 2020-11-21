import "./ThemeChanger.scss"

import { AppDispatch, AppState } from "../state"
import React, { ReactElement, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import { PayloadAction } from "@reduxjs/toolkit"
import { updateDarkMode } from "../state/user"

const ThemeChanger = (): ReactElement => {
  const dispatch = useDispatch<AppDispatch>()
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
        onClick={(): PayloadAction<boolean> =>
          dispatch(updateDarkMode(!userDarkMode))
        }
      >
        {userDarkMode ? "☾" : "☀"}
      </button>
    </div>
  )
}

export default ThemeChanger
