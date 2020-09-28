import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { BrowserRouter as Router } from "react-router-dom"
import { createWeb3ReactRoot, Web3ReactProvider } from "@web3-react/core"

import { NetworkContextName } from "./constants"
import "./index.css"
import App from "./pages/App"
import * as serviceWorker from "./serviceWorker"
import store from "./state"
import getLibrary from "./utils/getLibrary"

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if ("ethereum" in window) {
  ;(window.ethereum as any).autoRefreshOnNetworkChange = false
}

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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
