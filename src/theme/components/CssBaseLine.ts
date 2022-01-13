import { Components } from "@mui/material"

export function CssBaseLine(): Components {
  return {
    MuiCssBaseline: {
      styleOverrides: `
            @font-face {
                font-family: "Noe Display";
                src: url("../../assets/fonts/noe-display/NoeDisplay-Medium.eot"); /* IE9 Compat Modes */
                src: url("../../assets/fonts/noe-display/NoeDisplay-Medium.eot?#iefix") format("embedded-opentype"),
                    url("../../assets/fonts/noe-display/NoeDisplay-Medium.otf") format("opentype"),
                    url("../../assets/fonts/noe-display/NoeDisplay-Medium.svg") format("svg"),
                    url("../../assets/fonts/noe-display/NoeDisplay-Medium.ttf") format("truetype"),
                    url("../../assets/fonts/noe-display/NoeDisplay-Medium.woff") format("woff"),
                    url("../../assets/fonts/noe-display/NoeDisplay-Medium.woff2") format("woff2"); /* Modern Browsers */
                font-weight: 500;
                font-style: normal;
            }
            
            @font-face {
                font-family: "Noe Display";
                src: url("../../assets/fonts/noe-display/noe-display-bold.eot"); /* IE9 Compat Modes */
                src: url("../../assets/fonts/noe-display/noe-display-bold.eot?#iefix") format("embedded-opentype"),/* IE6-IE8 */
                    url("../../assets/fonts/noe-display/noe-display-bold.otf") format("opentype"),/* Open Type Font */
                    url("../../assets/fonts/noe-display/noe-display-bold.svg") format("svg"), /* Legacy iOS */
                    url("../../assets/fonts/noe-display/noe-display-bold.ttf") format("truetype"),/* Safari, Android, iOS */
                    url("../../assets/fonts/noe-display/noe-display-bold.woff") format("woff"),/* Modern Browsers */
                    url("../../assets/fonts/noe-display/noe-display-bold.woff2") format("woff2"); /* Modern Browsers */
                font-weight: 700;
                font-style: normal;
            }
            
            @font-face {
                font-family: "Noe Display";
                src: url("../../assets/fonts/noe-display/noe-display-bold-italic.eot"); /* IE9 Compat Modes */
                src: url("../../assets/fonts/noe-display/noe-display-bold-italic.eot?#iefix") format("embedded-opentype"), /* IE6-IE8 */
                    url("../../assets/fonts/noe-display/noe-display-bold-italic.otf") format("opentype"), /* Open Type Font */
                    url("../../assets/fonts/noe-display/noe-display-bold-italic.svg") format("svg"), /* Legacy iOS */
                    url("../../assets/fonts/noe-display/noe-display-bold-italic.ttf") format("truetype"), /* Safari, Android, iOS */
                    url("../../assets/fonts/noe-display/noe-display-bold-italic.woff") format("woff"), /* Modern Browsers */
                    url("../../assets/fonts/noe-display/noe-display-bold-italic.woff2") format("woff2"); /* Modern Browsers */
                font-weight: 700;
                font-style: italic;
            }
        `,
    },
  }
}
