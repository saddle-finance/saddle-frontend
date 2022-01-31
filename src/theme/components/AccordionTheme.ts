import { Components } from "@mui/material"

export default function AccordionTheme(): Components {
  return {
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: "8px !important",
        },
      },
    },
  }
}
