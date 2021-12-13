import React from "react"
import { SettingsContext } from "../providers/SettingContext"

// ----------------------------------------------------------------------

const useSettings = () => React.useContext(SettingsContext)

export default useSettings
