import React, { useState } from "react"
import classNames from "classnames"
import { Twemoji } from "react-emoji-render"
import { Link } from "react-router-dom"

import "./App.scss"
import SwapForm from "./components/SwapForm"
import EarnForm from "./components/EarnForm"
import WalletStatus from "./components/ConnectWallet"

// TODO state model
// provider object - Ethers.js provider, MetaMask first, falls back to Infura
// account object - string account
// signer object - optional, signer for the account

// CONNECT_PROVIDER
// => gets provider or fails
//   => gets signer or fails
//

// how can we connect to an Infura provider, or Alchemy, then switch to
// whatever MetaMask has set?
//
// SET_ACCOUNT
// => sets the account this user "is"? or instead do we use a read-only signer?

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
        <EarnForm
          tokenBaskets={["USD", "BTC", "ETH"]}
          basketYields={{ USD: 1.92, BTC: 9.8, ETH: 5 }}
        />
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
        <ul className="nav">
          <li>
            <Link to="/home">Swap</Link>
          </li>
          <li>
            <Link to="/pool">Pool</Link>
          </li>
        </ul>
        <WalletStatus />
      </header>
      <main>
        <SwapOrEarn />
      </main>
    </>
  )
}

export default App
