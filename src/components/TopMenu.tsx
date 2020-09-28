import React from "react"
import "./TopMenu.scss"
import classNames from "classnames"
import { Twemoji } from "react-emoji-render"
import { Link } from "react-router-dom"

import Web3Status from "./Web3Status"

interface Props {
  activeTab: string
}

function TopMenu({ activeTab }: Props) {
  return (
    <header className="top">
      <h1>
        <Twemoji className="logo" svg text=":horse_face:" />
        <span className="title">Saddle</span>
      </h1>
      <ul className="nav">
        <li>
          <Link to="/" className={classNames({ active: activeTab === "swap" })}>
            Swap
          </Link>
        </li>
        <li>
          <Link
            to="/pool"
            className={classNames({ active: activeTab === "pool" })}
          >
            Pool
          </Link>
        </li>
      </ul>
      <Web3Status />
    </header>
  )
}

export default TopMenu
