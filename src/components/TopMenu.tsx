import "./TopMenu.scss"

import React, { ReactElement } from "react"

import { Link } from "react-router-dom"
import { Twemoji } from "react-emoji-render"
import Web3Status from "./Web3Status"
import classNames from "classnames"

interface Props {
  activeTab: string
}

function TopMenu({ activeTab }: Props): ReactElement {
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
