import "./Eligibility.scss"
import React, { ReactElement } from "react"

function Eligibility(): ReactElement {
  return (
    <div className="eligibility">
      <p>
        You are not eligible for deposit at this moment. Deposits at this time
        are only available to holders of common defi governance tokens.{" "}
        <a href="#top">Learn more</a>
      </p>
      {/* TODO: Add related article link */}
    </div>
  )
}

export default Eligibility
