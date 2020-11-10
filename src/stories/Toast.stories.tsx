// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from "@storybook/react/types-6-0"
import Toast, { ToastProps } from "../components/Toast"

import React from "react"
import ToastsProvider from "../providers/ToastsProvider"
import useToast from "../hooks/useToast"

const onClick = (): void => console.log("clicked onClick")
export default {
  title: "Overlays/Toast",
  component: Toast,
  argTypes: {
    onClick,
  },
} as Meta

function ToastMaker(): React.ReactElement | null {
  const { addToast } = useToast()

  React.useEffect(() => {
    let i = 0
    const titles = [
      "Aut necessitatibus aliquid libero.",
      "Unde molestiae qui aperiam dolore aut molestias.",
      "Excepturi fugiat expedita magni",
      "Laboriosam libero quo deserunt. Sit nulla rem est quisquam aut nemo neque.",
    ]
    addToast(
      { title: "You'll have to click me to get rid of me", type: "error" },
      { autoDismiss: false },
    )
    // eslint-disable-next-line prefer-const
    let interval: ReturnType<typeof setInterval>

    const createToast = (): void => {
      if (i === titles.length) return clearInterval(interval)
      addToast({ title: titles[i++], type: i % 2 === 0 ? "success" : "error" })
    }
    interval = setInterval(createToast, 1000)
  }, [addToast])
  return null
}
export const ManyToasts: Story<{}> = () => (
  <ToastsProvider>
    <ToastMaker />
  </ToastsProvider>
)

const Template: Story<ToastProps> = (args) => <Toast {...args} />

export const Confirmation = Template.bind({})
Confirmation.args = {
  title: "Here's a toast 🏄‍♂️",
  type: "success",
}

export const Warning = Template.bind({})
Warning.args = {
  title: "Here's another toast 😬",
  type: "error",
}
