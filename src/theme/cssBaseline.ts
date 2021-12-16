import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
} from "@mui/material"

export const cssBaseline: {
  defaultProps?: ComponentsProps["MuiCssBaseline"]
  styleOverrides?: ComponentsOverrides["MuiCssBaseline"]
  variants?: ComponentsVariants["MuiCssBaseline"]
} = {
  styleOverrides: `
    @font-face {
      font-family: "Noe Display";
      src: url("../assets/fonts/noe-display/NoeDisplay-Medium.eot"); /* IE9 Compat Modes */
      src: url("../assets/fonts/noe-display/NoeDisplay-Medium.eot?#iefix")
          format("embedded-opentype"),
           url("../assets/fonts/noe-display/NoeDisplay-Medium.otf")
          format("opentype"),
          url("../assets/fonts/noe-display/NoeDisplay-Medium.svg") format("svg"),
          url("../assets/fonts/noe-display/NoeDisplay-Medium.ttf")
          format("truetype"),
          url("../assets/fonts/noe-display/NoeDisplay-Medium.woff") format("woff"),
          url("../assets/fonts/noe-display/NoeDisplay-Medium.woff2") format("woff2"); /* Modern Browsers */
      font-weight: 500;
      font-style: normal;
    }
    
    @font-face {
      font-family: "Noe Display";
      src: url("../assets/fonts/noe-display/noe-display-bold.eot"); /* IE9 Compat Modes */
      src: url("../assets/fonts/noe-display/noe-display-bold.eot?#iefix")
          format("embedded-opentype"),
        /* IE6-IE8 */ url("../assets/fonts/noe-display/noe-display-bold.otf")
          format("opentype"),
        /* Open Type Font */ url("../assets/fonts/noe-display/noe-display-bold.svg")
          format("svg"),
        /* Legacy iOS */ url("../assets/fonts/noe-display/noe-display-bold.ttf")
          format("truetype"),
        /* Safari, Android, iOS */
          url("../assets/fonts/noe-display/noe-display-bold.woff") format("woff"),
        /* Modern Browsers */
          url("../assets/fonts/noe-display/noe-display-bold.woff2") format("woff2"); /* Modern Browsers */
      font-weight: 700;
      font-style: normal;
    }
    
    @font-face {
      font-family: "Noe Display";
      src: url("../assets/fonts/noe-display/noe-display-bold-italic.eot"); /* IE9 Compat Modes */
      src: url("../assets/fonts/noe-display/noe-display-bold-italic.eot?#iefix")
          format("embedded-opentype"),
        /* IE6-IE8 */ url("../assets/fonts/noe-display/noe-display-bold-italic.otf")
          format("opentype"),
        /* Open Type Font */
          url("../assets/fonts/noe-display/noe-display-bold-italic.svg")
          format("svg"),
        /* Legacy iOS */
          url("../assets/fonts/noe-display/noe-display-bold-italic.ttf")
          format("truetype"),
        /* Safari, Android, iOS */
          url("../assets/fonts/noe-display/noe-display-bold-italic.woff")
          format("woff"),
        /* Modern Browsers */
          url("../assets/fonts/noe-display/noe-display-bold-italic.woff2")
          format("woff2"); /* Modern Browsers */
      font-weight: 700;
      font-style: italic;
    }
    
    // Camphor
    @font-face {
      font-family: "Camphor";
      font-weight: 700;
      font-style: normal;
      src: url("../assets/fonts/Camphor-Bold.eot"); /* IE9 Compat Modes */
      src: url("../assets/fonts/Camphor-Bold.eot?#iefix")
          format("embedded-opentype"),
        /* IE6-IE8 */ url("../assets/fonts/Camphor-Bold.woff") format("woff"),
        /* Modern Browsers */ url("../assets/fonts/Camphor-Bold.ttf")
          format("truetype"),
        /* Safari, Android, iOS */
          url("../assets/fonts/Camphor-Bold.svg#e37ef20b6d73827754050f31838d5c3f")
          format("svg"); /* Legacy iOS */
    }
    
    @font-face {
      font-family: "Camphor";
      font-weight: 500;
      font-style: normal;
      src: url("../assets/fonts/Camphor-Medium.eot"); /* IE9 Compat Modes */
      src: url("../assets/fonts/Camphor-Medium.eot?#iefix")
          format("embedded-opentype"),
        /* IE6-IE8 */ url("../assets/fonts/Camphor-Medium.woff") format("woff"),
        /* Modern Browsers */ url("../assets/fonts/Camphor-Medium.ttf")
          format("truetype"),
        /* Safari, Android, iOS */ url("../assets/fonts/Camphor-Medium.svg")
          format("svg"); /* Legacy iOS */
    }
    
    @font-face {
      font-family: "Camphor";
      font-weight: 400;
      font-style: normal;
      src: url("../assets/fonts/Camphor-Regular.eot"); /* IE9 Compat Modes */
      src: url("../assets/fonts/Camphor-Regular.eot?#iefix")
          format("embedded-opentype"),
        /* IE6-IE8 */ url("../assets/fonts/Camphor-Regular.woff") format("woff"),
        /* Modern Browsers */ url("../assets/fonts/Camphor-Regular.ttf")
          format("truetype"),
        /* Safari, Android, iOS */ url("../assets/fonts/Camphor-Regular.svg")
          format("svg"); /* Legacy iOS */
    }
    
    @font-face {
      font-family: "Camphor";
      font-weight: 400;
      font-style: italic;
      src: url("../assets/fonts/Camphor-Italic.eot"); /* IE9 Compat Modes */
      src: url("../assets/fonts/Camphor-Italic.eot?#iefix")
          format("embedded-opentype"),
        /* IE6-IE8 */ url("../assets/fonts/Camphor-Italic.woff") format("woff"),
        /* Modern Browsers */ url("../assets/fonts/Camphor-Italic.ttf")
          format("truetype"),
        /* Safari, Android, iOS */ url("../assets/fonts/Camphor-Italic.svg")
          format("svg"); /* Legacy iOS */
    }
    
    // Avenir Next
    @font-face {
      font-family: "Avenir Next";
      font-weight: 700;
      font-style: normal;
      src: url("../assets/fonts/Avenir-Next-Bold.eot"); /* IE9 Compat Modes */
      src: url("../assets/fonts/Avenir-Next-Bold.eot?#iefix")
          format("embedded-opentype"),
        /* IE6-IE8 */ url("../assets/fonts/Avenir-Next-Bold.woff") format("woff"),
        /* Modern Browsers */ url("../assets/fonts/Avenir-Next-Bold.ttf")
          format("truetype"),
        /* Safari, Android, iOS */ url("../assets/fonts/Avenir-Next-Bold.svg")
          format("svg"); /* Legacy iOS */
    }
    
    @font-face {
      font-family: "Avenir Next";
      font-weight: 500;
      font-style: normal;
      src: url("../assets/fonts/Avenir-Next-Medium.eot"); /* IE9 Compat Modes */
      src: url("../assets/fonts/Avenir-Next-Medium.eot?#iefix")
          format("embedded-opentype"),
        /* IE6-IE8 */ url("../assets/fonts/Avenir-Next-Medium.woff") format("woff"),
        /* Modern Browsers */ url("../assets/fonts/Avenir-Next-Medium.ttf")
          format("truetype"),
        /* Safari, Android, iOS */ url("../assets/fonts/Avenir-Next-Medium.svg")
          format("svg"); /* Legacy iOS */
    }
    
    @font-face {
      font-family: "Avenir Next";
      font-weight: 400;
      font-style: normal;
      src: url("../assets/fonts/Avenir-Next-Regular.eot"); /* IE9 Compat Modes */
      src: url("../assets/fonts/Avenir-Next-Regular.eot?#iefix")
          format("embedded-opentype"),
        /* IE6-IE8 */ url("../assets/fonts/Avenir-Next-Regular.woff") format("woff"),
        /* Modern Browsers */ url("../assets/fonts/Avenir-Next-Regular.ttf")
          format("truetype"),
        /* Safari, Android, iOS */ url("../assets/fonts/Avenir-Next-Regular.svg")
          format("svg"); /* Legacy iOS */
    }
    
    @font-face {
      font-family: "Avenir Next";
      font-weight: 400;
      font-style: italic;
      src: url("../assets/fonts/Avenir-Next-Italic.eot"); /* IE9 Compat Modes */
      src: url("../assets/fonts/Avenir-Next-Italic.eot?#iefix")
          format("embedded-opentype"),
        /* IE6-IE8 */ url("../assets/fonts/Avenir-Next-Italic.woff") format("woff"),
        /* Modern Browsers */ url("../assets/fonts/Avenir-Next-Italic.ttf")
          format("truetype"),
        /* Safari, Android, iOS */ url("../assets/fonts/Avenir-Next-Italic.svg")
          format("svg"); /* Legacy iOS */
    }
`,
}
