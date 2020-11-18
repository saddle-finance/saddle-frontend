import "./index.css"
import "normalize.css"
import "./i18n"

import { Web3ReactProvider, createWeb3ReactRoot } from "@web3-react/core"

import App from "./pages/App"
import { NetworkContextName } from "./constants"
import { Provider } from "react-redux"
import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router } from "react-router-dom"
import cssVars from "css-vars-ponyfill"
import getLibrary from "./utils/getLibrary"
import store from "./state"

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if ("ethereum" in window) {
  ;(window.ethereum as any).autoRefreshOnNetworkChange = false // eslint-disable-line @typescript-eslint/no-explicit-any
}

cssVars({})

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Provider store={store}>
          <Router>
            <App />
          </Router>
        </Provider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById("root"),
)
