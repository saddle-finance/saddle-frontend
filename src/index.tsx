import "./index.css"
import "./i18n"

import * as Sentry from "@sentry/react"

import { Web3ReactProvider, createWeb3ReactRoot } from "@web3-react/core"
import { logError, sendWebVitalsToGA } from "./utils/googleAnalytics"

import App from "./pages/App"
import BasicPoolsProvider from "./providers/BasicPoolsProvider"
import { IS_PRODUCTION } from "./utils/environment"
import { Integrations } from "@sentry/tracing"
import { IntercomProvider } from "react-use-intercom"
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

// This Sentry DSN only works with production origin URLs and will discard everything else
// TODO: If we like Sentry, add support for other environments and move the DSN configuration into .env
Sentry.init({
  dsn: "https://aa2638e61b14430385cc4be7023ba621@o1107900.ingest.sentry.io/6135183",
  integrations: [new Integrations.BrowserTracing()],
  release: process.env.REACT_APP_GIT_SHA,
  tracesSampleRate: 0.1,
})

const intercomAppId = "tbghxgth"

ReactDOM.render(
  <>
    <React.StrictMode>
      <IntercomProvider appId={intercomAppId} shouldInitialize={IS_PRODUCTION}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3ProviderNetwork getLibrary={getNetworkLibrary}>
            <Provider store={store}>
              <ThemeSettingsProvider>
                <BasicPoolsProvider>
                  <Router>
                    <App />
                  </Router>
                </BasicPoolsProvider>
              </ThemeSettingsProvider>
            </Provider>
          </Web3ProviderNetwork>
        </Web3ReactProvider>
      </IntercomProvider>
    </React.StrictMode>
  </>,
  document.getElementById("root"),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(sendWebVitalsToGA)
