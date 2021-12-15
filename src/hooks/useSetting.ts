import {
  ThemeSettingsContext,
  ThemeSettingsContextProps,
} from "../providers/ThemeSettingsContext"
import { useContext } from "react"

// ----------------------------------------------------------------------

const useSettings: () => ThemeSettingsContextProps = () =>
  useContext(ThemeSettingsContext)

export default useSettings
