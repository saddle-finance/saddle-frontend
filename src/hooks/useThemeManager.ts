import { AppDispatch, AppState } from "../state"
import { useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import { updateDarkMode } from "../state/user"
import { useColorMode } from "@chakra-ui/react"

export default function useThemeManager(): {
  toggleTheme: () => void
  userDarkMode: boolean
} {
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

  const toggleTheme = useCallback(() => {
    dispatch(updateDarkMode(!userDarkMode))
    if (
      (userDarkMode && colorMode === "dark") ||
      (!userDarkMode && colorMode === "light")
    ) {
      toggleColorMode()
    }
  }, [dispatch, userDarkMode, toggleColorMode, colorMode])

  return { toggleTheme, userDarkMode }
}
