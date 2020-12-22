import "./NoShareContent.scss"
import React, { ReactElement } from "react"
import depositGraph from "../assets/deposit_graph.png"

function NoShareContent(): ReactElement {
  return (
    <div className="no-share">
      <p>
        Looks like you have no share. <a href="/#/deposit">Deposit</a> first to
        get a share.
      </p>
      {/* TODO: update placeholder graph below */}
      <img src={depositGraph} alt="put tokens in pool" />
    </div>
  )
}

export default NoShareContent
