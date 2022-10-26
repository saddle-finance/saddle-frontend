import { Components } from "@mui/material"

export default function SkeletonTheme(): Components {
  return {
    MuiSkeleton: {
      styleOverrides: {
        root: {
          transform: "scale(1, 1)",
        },
      },
    },
  }
}
