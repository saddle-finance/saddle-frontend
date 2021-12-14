import "./TopMenu.scss"
import React, { ReactElement } from "react"
import { Link } from "react-router-dom"
// import classNames from "classnames"

interface MenuLinkProps {
  label: string
  to: string
  activeOnlyWhenExact: boolean
}

export default function MenuLink({
  to,
  label,
}: // activeOnlyWhenExact,
MenuLinkProps): ReactElement {
  // const match = useRouteMatch({ path: to, exact: activeOnlyWhenExact })
  return (
    <div>
      <Link to={to}>{label}</Link>
    </div>
  )
}
