import React, { useState } from 'react'
import classNames from 'classnames'
import { Twemoji } from 'react-emoji-render'

import './App.scss'
import SwapForm from './components/SwapForm'
import EarnForm from './components/EarnForm'

function SwapOrEarn() {
  const [activeArea, setActiveArea] = useState('swap')

  return <div className="swapArea">
    <nav>
      <a className={classNames({active: activeArea=='swap'})}
         onClick={() => setActiveArea('swap')}>Swap</a>
      <a className={classNames({active: activeArea=='earn'})}
         onClick={() => setActiveArea('earn')}>Earn</a>
    </nav>
    <hr />
    { activeArea == 'swap' ? <SwapForm /> : <EarnForm /> }
  </div>
}

function App() {
  return (
    <>
      <header className="top">
        <h1>
          <Twemoji className="logo" svg text=":horse_face:" />
          <span className="title">Saddle</span>
        </h1>
        <span className="walletInfo">
          <button>Connect Wallet</button>
        </span>
      </header>
      <main>
        <SwapOrEarn />

      </main>
    </>
  )
}

export default App
