import { ComponentMeta, ComponentStory } from "@storybook/react"
import FarmSkeleton from "./FarmSkeleton"
import React from "react"

export default {
  title: "Skeleton/Farm page skeleton",
} as ComponentMeta<typeof FarmSkeleton>

const Template: ComponentStory<typeof FarmSkeleton> = () => <FarmSkeleton />

export const Default = Template.bind({})
