import { ComponentMeta, ComponentStory } from "@storybook/react"
import React from "react"
import RiskSkeleton from "./RiskSkeleton"

export default {
  title: "Skeleton/Risk page skeleton",
  component: RiskSkeleton,
} as ComponentMeta<typeof RiskSkeleton>

const Template: ComponentStory<typeof RiskSkeleton> = () => <RiskSkeleton />

export const Default = Template.bind({})
