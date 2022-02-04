import { ComponentMeta } from "@storybook/react"
import React from "react"
import SwapTokenInput from "../components/SwapTokenInput"

export default {
  title: "Light components/Button",
  component: SwapTokenInput,
} as ComponentMeta<typeof SwapTokenInput>

export const SwapTokenInputComponent = () => <SwapTokenInput />
