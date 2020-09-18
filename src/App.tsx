import React, { useState } from "react"
import classNames from "classnames"

import "./App.scss"
import TopMenu from "./components/TopMenu"
import SwapForm from "./components/SwapForm"
import EarnForm from "./components/EarnForm"

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
      <TopMenu activeTab="" />
      <main>
        <SwapOrEarn />
      </main>
    </>
  )
}

export default App
