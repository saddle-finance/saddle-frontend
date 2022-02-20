import { NavLink, NavLinkProps, useLocation } from "react-router-dom"
import React from "react"
import { styled } from "@mui/material"
import { useTranslation } from "react-i18next"

const Menu = styled(NavLink)<NavLinkProps & { selected: boolean }>(
  ({ theme, selected }) => {
    return {
      fontWeight: selected ? "bold" : "normal",
      textDecoration: "none",
      fontSize: theme.typography.h3.fontSize,
      color: theme.palette.text.primary,
    }
  },
)
type ActiveTabType = "" | "pools" | "risk"
export default function NavMenu(): JSX.Element {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const activeTab = pathname.split("/")[1] as ActiveTabType
  return (
    <React.Fragment>
      <Menu data-testid="swapNavLink" to="/" selected={activeTab === ""}>
        {t("swap")}
      </Menu>

      <Menu to="/pools" selected={activeTab === "pools"}>
        {t("pools")}
      </Menu>

      <Menu to="/risk" selected={activeTab === "risk"}>
        {t("risk")}
      </Menu>
    </React.Fragment>
  )
}
