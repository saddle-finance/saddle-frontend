import { ComponentMeta, ComponentStory } from "@storybook/react"
import { IconButton, InputAdornment, TextField } from "@mui/material"
import { Delete } from "@mui/icons-material"
import React from "react"

// Check controls from https://storybook.js.org/docs/react/essentials/controls

export default {
  title: "Components/TextField",
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
  placeholder: "test",
  value: "",
  label: "label is here",
  helperText: "",
  fullWidth: false,
  disabled: false,
  error: false,
}

export const MuiTextNoLabel = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
MuiTextNoLabel.args = {
  variant: "outlined",
  name: "textField",
  placeholder: "test",
  value: "",
  helperText: "",
  fullWidth: false,
  disabled: false,
  error: false,
}
export const TextFieldWithIcon = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
TextFieldWithIcon.args = {
  variant: "outlined",
  name: "textField",
  placeholder: "test",
  value: "",
  helperText: "",
  fullWidth: false,
  disabled: false,
  error: false,
  InputProps: {
    endAdornment: (
      <InputAdornment position="end">
        <IconButton>
          <Delete />
        </IconButton>
      </InputAdornment>
    ),
  },
}
