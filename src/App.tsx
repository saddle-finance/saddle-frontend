import React, { useState } from "react"
import classNames from "classnames"
import { Twemoji } from "react-emoji-render"

import "./App.scss"
import SwapForm from "./components/SwapForm"
import EarnForm from "./components/EarnForm"
import WalletStatus from "./components/ConnectWallet"

function SwapOrEarn() {
  const [activeArea, setActiveArea] = useState("swap")

  return (
    <div className="swapArea">
      <nav>
        <a
          href="/#"
          className={classNames({ active: activeArea === "swap" })}
          onClick={() => setActiveArea("swap")}
        >
          Swap
        </a>
        <a
          href="/#"
          className={classNames({ active: activeArea === "earn" })}
          onClick={() => setActiveArea("earn")}
        >
          Earn
        </a>
      </nav>
      <hr />
      {activeArea === "swap" ? (
        <SwapForm />
      ) : (
        <EarnForm swapYields={{ USD: 1.92, BTC: 9.8, ETH: 5 }} />
      )}
    </div>
  )
}

function App() {
  return (
    <>
      <header className="top">
        <h1>
          <Twemoji className="logo" svg text=":horse_face:" />
          <span className="title">Saddle</span>
        </h1>
        <WalletStatus />
      </header>
      <main>
        <SwapOrEarn />
      </main>
    </>
  )
}

export default App
