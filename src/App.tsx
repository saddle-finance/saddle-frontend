import React from 'react'
import { Twemoji } from 'react-emoji-render'

import './App.scss'
import TokenSelector from './components/TokenSelector'

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
        <div className="swapArea">
          <nav>
            <a className="active">Swap</a>
            <a>Earn</a>
          </nav>
          <hr />
          <form>
            <TokenSelector label="From" tokens={['tbtc', 'wbtc']} />
            <TokenSelector label="To" tokens={['wbtc', 'tbtc']} />
            <button>Swap!</button>
          </form>
        </div>
      </main>
    </>
  )
}

export default App
