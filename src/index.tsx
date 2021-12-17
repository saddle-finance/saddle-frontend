import "./index.css"
import "./i18n"

import { Web3ReactProvider, createWeb3ReactRoot } from "@web3-react/core"
import { logError, sendWebVitalsToGA } from "./utils/googleAnalytics"

import App from "./pages/App"
import { NetworkContextName } from "./constants"
import { Provider } from "react-redux"
import React from "react"
import ReactDOM from "react-dom"
import { HashRouter as Router } from "react-router-dom"
import { ThemeSettingsProvider } from "./providers/ThemeSettingsProvider"
import getLibrary from "./utils/getLibrary"
import { getNetworkLibrary } from "./connectors"
import reportWebVitals from "./reportWebVitals"
import store from "./state"

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if (window && window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

window.addEventListener("error", logError)

ReactDOM.render(
  <>
    <React.StrictMode>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ProviderNetwork getLibrary={getNetworkLibrary}>
          <Provider store={store}>
            <ThemeSettingsProvider>
              <Router>
                <App />
              </Router>
            </ThemeSettingsProvider>
          </Provider>
        </Web3ProviderNetwork>
      </Web3ReactProvider>
    </React.StrictMode>
  </>,
  document.getElementById("root"),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(sendWebVitalsToGA)
