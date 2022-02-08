import { ComponentMeta, ComponentStory } from "@storybook/react"
import React from "react"
import { TextField } from "@mui/material"

// Check controls from https://storybook.js.org/docs/react/essentials/controls

export default {
  title: "Light components/TextField",
  component: TextField,
  argTypes: {
    variant: {
      options: ["standard", "outlined"],
      control: { type: "inline-radio" },
    },
    size: {
      options: ["small", "medium"],
      control: { type: "inline-radio" },
    },
  },
} as ComponentMeta<typeof TextField>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof TextField> = (args) => (
  <TextField {...args} />
)

export const MuiTextField = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
MuiTextField.args = {
  variant: "outlined",
  name: "textField",
  label: "",
  placeholder: "test",
  value: "",
  helperText: "",
  fullWidth: false,
  disabled: false,
  error: false,
}
