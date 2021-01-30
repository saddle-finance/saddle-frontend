import "./AssetButton.scss"

import React, { ReactElement } from "react"

import { Link } from "react-router-dom"
import defaultIcon from "../assets/icons/icon_btc.svg"

interface Props {
  title: string
  to: string
  icon?: string
}

function AssetButton({ title, to, icon = defaultIcon }: Props): ReactElement {
  return (
    <Link to={to}>
      <button className="asset">
        <img src={icon} alt="icon" />
        <span>{title}</span>
      </button>
    </Link>
  )
}

export default AssetButton
