import { ComponentMeta, ComponentStory } from "@storybook/react"
import DevTool from "./DevTool"
import React from "react"

export default {
  title: "Components/Dev tool",
  component: DevTool,
} as ComponentMeta<typeof DevTool>

const Template: ComponentStory<typeof DevTool> = () => <DevTool />

export const Primary = Template.bind({})
