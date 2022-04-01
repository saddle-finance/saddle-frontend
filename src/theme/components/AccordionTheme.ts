import { Components, Theme } from "@mui/material"

export default function AccordionTheme(theme: Theme): Components {
  return {
    MuiAccordion: {},
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          // overriding padding of MuiAccordionSummary
          // reference https://github.com/mui-org/material-ui/blob/81492206a747c10f8b8015905fb1de6dcbcbe147/packages/mui-material/src/AccordionSummary/AccordionSummary.js#L38
          minHeight: 0,
          "&.Mui-expanded": {
            minHeight: 0,
          },
          padding: theme.spacing(0, 3),
        },
        content: {
          margin: theme.spacing(2, 0),
          "&.Mui-expanded": {
            margin: theme.spacing(2, 0, 1, 0),
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          // reference https://github.com/mui-org/material-ui/blob/81492206a747c10f8b8015905fb1de6dcbcbe147/packages/mui-material/src/AccordionDetails/AccordionDetails.js#L24
          padding: theme.spacing(2, 3, 2, 3),
        },
      },
    },
  }
}
