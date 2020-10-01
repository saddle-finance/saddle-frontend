import "./AssetButton.scss"

import { Link } from "react-router-dom"
import React from "react"

interface Props {
  title: string
  to: string
  icon?: string
}

// const icon_btc = require("../assets/icons/icon_btc.svg") as string;

function AssetButton({ title, to, icon }: Props) {
  return (
    <Link to={to}>
      <button className="asset">
        <img
          src={icon ? icon : require("../assets/icons/icon_btc.svg")}
          alt=""
        />
        <span>{title}</span>
      </button>
    </Link>
  )
}

export default AssetButton
