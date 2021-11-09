import "./MyFarm.scss"
import React, { ReactElement } from "react"
import { Box } from "@chakra-ui/react"
import StackButton from "./Button"
// TODO All number is place holder.
export default function MyFarm(): ReactElement {
  return (
    <div className="myFarm">
      <h4>My Farm</h4>
      <div className="item" style={{ marginBottom: 16 }}>
        <div>
          <p>LP Available</p>
          <p className="bold">2.123456</p>
        </div>
        <Box>
          <StackButton kind="outline">stake all</StackButton>
        </Box>
      </div>
      <div className="item">
        <div>
          <p>LP Staked</p>
          <p className="bold">2.123456</p>
        </div>
        <Box>
          <StackButton kind="outline">unstake all</StackButton>
        </Box>
      </div>
    </div>
  )
}
