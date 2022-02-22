import { ComponentMeta, ComponentStory } from "@storybook/react"
import { Radio as MuiRadio } from "@mui/material"
import React from "react"

export default {
  title: "Light components/Button",
  component: MuiRadio,
  argTypes: {
    color: {
      options: ["primary", "secondary", "info", "mute", "error"],
      control: { type: "select" },
    },
  },
} as ComponentMeta<typeof MuiRadio>

const Template: ComponentStory<typeof MuiRadio> = (args) => (
  <MuiRadio {...args} />
)

export const Radio = Template.bind({})
Radio.args = {
  color: "secondary",
  checked: true,
}
