import React from "react"
import ReactDOM from "react-dom"
import history from "./history"
import { Provider } from "react-redux"
import { Router } from "react-router-dom"

import "./index.css"
// import App from "./App"
import { Routes } from "./routes"
import * as serviceWorker from "./serviceWorker"
import { store } from "./store"

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router history={history}>
        <Routes />
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root"),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
