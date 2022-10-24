import { ComponentMeta, ComponentStory } from "@storybook/react"
import React from "react"
import SwapSkeleton from "./SwapSkeleton"

export default {
  title: "Skeleton/Swap page skeleton",
  component: SwapSkeleton,
} as ComponentMeta<typeof SwapSkeleton>

const Template: ComponentStory<typeof SwapSkeleton> = () => <SwapSkeleton />

export const Default = Template.bind({})
