import { ComponentMeta, ComponentStory } from "@storybook/react"
import PoolsSkeleton from "./PoolsSkeleton"
import React from "react"

export default {
  title: "Skeleton/Pools page skeleton",
  component: PoolsSkeleton,
} as ComponentMeta<typeof PoolsSkeleton>

const Template: ComponentStory<typeof PoolsSkeleton> = () => <PoolsSkeleton />

export const Default = Template.bind({})
