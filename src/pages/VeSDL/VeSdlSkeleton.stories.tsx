import { ComponentMeta, ComponentStory } from "@storybook/react"
import React from "react"
import VeSdlSkeleton from "./VeSdlSkeleton"

export default {
  title: "Skeleton/VeSDL page skeleton",
  component: VeSdlSkeleton,
} as ComponentMeta<typeof VeSdlSkeleton>

const Template: ComponentStory<typeof VeSdlSkeleton> = () => <VeSdlSkeleton />

export const Default = Template.bind({})
