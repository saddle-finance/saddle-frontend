import { ComponentMeta, ComponentStory } from "@storybook/react"
import React from "react"
import StarknetTestDappSkeleton from "./StarknetTestDappSkeleton"

export default {
  title: "Skeleton/StarknetTestDapp page skeleton",
  component: StarknetTestDappSkeleton,
} as ComponentMeta<typeof StarknetTestDappSkeleton>

const Template: ComponentStory<typeof StarknetTestDappSkeleton> = () => (
  <StarknetTestDappSkeleton />
)

export const Default = Template.bind({})
