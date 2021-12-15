import {
  SettingsContext,
  SettingsContextProps,
} from "../providers/SettingContext"
import { useContext } from "react"

// ----------------------------------------------------------------------

const useSettings: () => SettingsContextProps = () =>
  useContext(SettingsContext)

export default useSettings
