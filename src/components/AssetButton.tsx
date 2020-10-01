import "./AssetButton.scss"

import { Link } from "react-router-dom"
import React from "react"
<<<<<<< HEAD
=======
import defaultIcon from "../assets/icons/icon_btc.svg"
>>>>>>> Enable eslint:recommended linting rules and fix errors

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
        <img src={icon ? icon : defaultIcon} alt="" />
        <span>{title}</span>
      </button>
    </Link>
  )
}

export default AssetButton
