import { Components } from "@mui/material"
import NoeDisplayBoldEot from "../../assets/fonts/noe-display/noe-display-bold.eot"

import NoeDisplayBoldItalicEot from "../../assets/fonts/noe-display/noe-display-bold-italic.eot"
import NoeDisplayBoldItalicOtf from "../../assets/fonts/noe-display/noe-display-bold-italic.otf"
import NoeDisplayBoldItalicSvg from "../../assets/fonts/noe-display/noe-display-bold-italic.svg"
import NoeDisplayBoldItalicTtf from "../../assets/fonts/noe-display/noe-display-bold-italic.ttf"
import NoeDisplayBoldItalicWoff from "../../assets/fonts/noe-display/noe-display-bold-italic.woff"
import NoeDisplayBoldItalicWoff2 from "../../assets/fonts/noe-display/noe-display-bold-italic.woff2"

import NoeDisplayBoldOtf from "../../assets/fonts/noe-display/noe-display-bold.otf"
import NoeDisplayBoldSvg from "../../assets/fonts/noe-display/noe-display-bold.svg"
import NoeDisplayBoldTtf from "../../assets/fonts/noe-display/noe-display-bold.ttf"
import NoeDisplayBoldWoff from "../../assets/fonts/noe-display/noe-display-bold.woff"
import NoeDisplayBoldWoff2 from "../../assets/fonts/noe-display/noe-display-bold.woff2"

import NoeDisplayMediumEot from "../../assets/fonts/noe-display/NoeDisplay-Medium.eot"
import NoeDisplayMediumOtf from "../../assets/fonts/noe-display/NoeDisplay-Medium.otf"
import NoeDisplayMediumSvg from "../../assets/fonts/noe-display/NoeDisplay-Medium.svg"
import NoeDisplayMediumTtf from "../../assets/fonts/noe-display/NoeDisplay-Medium.ttf"
import NoeDisplayMediumWoff from "../../assets/fonts/noe-display/NoeDisplay-Medium.woff"
import NoeDisplayMediumWoff2 from "../../assets/fonts/noe-display/NoeDisplay-Medium.woff2"

// eot- /* IE9 Compat Modes*/
// otf- /* Open Type Font */
// svg- /* Legacy iOS */
// ttf- /* Safari, Android, iOS */
// woff- /* Modern Browsers */
// woff2- /* Modern Browsers */

export function CssBaseLine(): Components {
  return {
    MuiCssBaseline: {
      styleOverrides: `
            @font-face {
                font-family: "Noe Display";
                src: url(${NoeDisplayMediumEot as string}); 
                src: url(${NoeDisplayMediumOtf as string}) format("opentype"),
                    url(${NoeDisplayMediumSvg}) format("svg"),
                    url(${NoeDisplayMediumTtf as string}) format("truetype"),
                    url(${NoeDisplayMediumWoff as string}) format("woff"),
                    url(${NoeDisplayMediumWoff2 as string}) format("woff2"); 
                font-weight: 500;
                font-style: normal;
            }
            
            @font-face {
                font-family: "Noe Display";
                src: url(${NoeDisplayBoldEot as string}); 
                src: url(${NoeDisplayBoldOtf as string}) format("opentype"),
                    url(${NoeDisplayBoldSvg}) format("svg"), 
                    url(${NoeDisplayBoldTtf as string}) format("truetype"),
                    url(${NoeDisplayBoldWoff as string}) format("woff"),
                    url(${NoeDisplayBoldWoff2 as string}) format("woff2"); 
                font-weight: 700;
                font-style: normal;
            }
            
            @font-face {
                font-family: "Noe Display";
                src: url(${NoeDisplayBoldItalicEot as string}); 
                src: 
                    url(${
                      NoeDisplayBoldItalicOtf as string
                    }) format("opentype"),
                    url(${NoeDisplayBoldItalicSvg}) format("svg"), 
                    url(${
                      NoeDisplayBoldItalicTtf as string
                    }) format("truetype"), 
                    url(${NoeDisplayBoldItalicWoff as string}) format("woff"), 
                    url(${
                      NoeDisplayBoldItalicWoff2 as string
                    }) format("woff2"); 
                font-weight: 700;
                font-style: italic;
            }
        `,
    },
  }
}
