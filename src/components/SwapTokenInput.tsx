import * as React from "react"

import { Button, InputBase, TextField, Typography } from "@mui/material"
import { ArrowDropDown } from "@mui/icons-material"
import Autocomplete from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"
import ClickAwayListener from "@mui/material/ClickAwayListener"
import Popper from "@mui/material/Popper"
import Search from "@mui/icons-material/Search"
import SettingsIcon from "@mui/icons-material/Settings"
import { styled } from "@mui/material/styles"

const StyledPopper = styled(Popper)(({ theme }) => ({
  border: `1px solid ${theme.palette.mode === "light" ? "#e1e4e8" : "#30363d"}`,
  borderRadius: "6px",
  width: 300,
  zIndex: theme.zIndex.modal,
  fontSize: 13,
  color: theme.palette.mode === "light" ? "#24292e" : "#c9d1d9",
  backgroundColor: theme.palette.mode === "light" ? "#fff" : "#1c2128",
}))

// interface Props {
//   tokens: TokenOption[]
//   selected: string
//   inputValue: string
//   inputValueUSD: BigNumber
//   isSwapFrom: boolean
//   onSelect?: (tokenSymbol: string) => void
//   onChangeAmount?: (value: string) => void
// }

export default function SwapTokenInput() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [value, setValue] = React.useState<string>()
  const [inputValue, setInputValue] = React.useState<string>("")

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    if (anchorEl) {
      anchorEl.focus()
    }
    setAnchorEl(null)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const re = /^[0-9]*[.,]?[0-9]*$/
    // if value is not blank, then test the regex
    if (e.target.value === "" || re.test(e.target.value)) {
      setInputValue(e.target.value)
    }
  }

  const handleFocus = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  ) => {
    event.target.select()
  }

  const open = Boolean(anchorEl)

  return (
    <React.Fragment>
      <Box
        display="flex"
        alignItems="center"
        padding={1}
        borderRadius="6px"
        border="1px solid #F00"
      >
        <Box paddingRight={1}>
          <SettingsIcon />
        </Box>
        <Box flexWrap="nowrap">
          <Button
            disableRipple
            onClick={handleClick}
            endIcon={<ArrowDropDown />}
          >
            <span> {value || "Choose"} </span>
          </Button>
          <Typography noWrap paddingLeft={1}>
            Wrapped BTC
          </Typography>
        </Box>
        <Box flex={1}>
          <InputBase
            placeholder="0.0"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            value={inputValue}
            onChange={handleInputChange}
            inputProps={{ style: { textAlign: "end" } }}
            onFocus={handleFocus}
            fullWidth
          />
          <Typography color="text.secondary" textAlign="end">
            ~$1,1234,5678,90
          </Typography>
        </Box>
      </Box>

      <StyledPopper open={open} anchorEl={anchorEl} placement="bottom-start">
        <ClickAwayListener onClickAway={handleClose}>
          <Box height="100%" borderRadius="6px" padding={2}>
            <Autocomplete
              open={open}
              options={top100Films}
              popupIcon={null}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  ref={params.InputProps.ref}
                  InputProps={{
                    startAdornment: <Search />,
                  }}
                  inputProps={params.inputProps}
                  placeholder="movie"
                  autoFocus
                />
              )}
              onChange={(event, newValue, reason) => {
                if (
                  event.type === "keydown" &&
                  (event as React.KeyboardEvent).key === "Backspace" &&
                  reason === "removeOption"
                ) {
                  return
                }
                setValue(newValue?.label || "")
                setAnchorEl(null)
              }}
              renderOption={(props, option) => (
                <li
                  {...props}
                  style={{ paddingLeft: 0, borderBottom: "1px solid #000" }}
                >
                  {console.log(option)}
                  <Box>{option.label}</Box>
                </li>
              )}
              PopperComponent={(props) => <div {...props}></div>}
              PaperComponent={(props) => <Box {...props} overflow="hidden" />}
            />
          </Box>
        </ClickAwayListener>
      </StyledPopper>
    </React.Fragment>
  )
}

// From https://github.com/abdonrd/github-labels
const top100Films = [
  { label: "The Shawshank Redemption", year: 1994 },
  { label: "The Godfather", year: 1972 },
  { label: "The Godfather: Part II", year: 1974 },
  { label: "The Dark Knight", year: 2008 },
  { label: "12 Angry Men", year: 1957 },
  { label: "Schindler's List", year: 1993 },
  { label: "Pulp Fiction", year: 1994 },
  {
    label: "The Lord of the Rings: The Return of the King",
    year: 2003,
  },
  { label: "The Good, the Bad and the Ugly", year: 1966 },
  { label: "Fight Club", year: 1999 },
  {
    label: "The Lord of the Rings: The Fellowship of the Ring",
    year: 2001,
  },
  {
    label: "Star Wars: Episode V - The Empire Strikes Back",
    year: 1980,
  },
  { label: "Forrest Gump", year: 1994 },
  { label: "Inception", year: 2010 },
  {
    label: "The Lord of the Rings: The Two Towers",
    year: 2002,
  },
  { label: "One Flew Over the Cuckoo's Nest", year: 1975 },
  { label: "Goodfellas", year: 1990 },
  { label: "The Matrix", year: 1999 },
  { label: "Seven Samurai", year: 1954 },
  {
    label: "Star Wars: Episode IV - A New Hope",
    year: 1977,
  },
  { label: "City of God", year: 2002 },
  { label: "Se7en", year: 1995 },
  { label: "The Silence of the Lambs", year: 1991 },
  { label: "It's a Wonderful Life", year: 1946 },
  { label: "Life Is Beautiful", year: 1997 },
  { label: "The Usual Suspects", year: 1995 },
  { label: "Léon: The Professional", year: 1994 },
  { label: "Spirited Away", year: 2001 },
  { label: "Saving Private Ryan", year: 1998 },
  { label: "Once Upon a Time in the West", year: 1968 },
  { label: "American History X", year: 1998 },
  { label: "Interstellar", year: 2014 },
  { label: "Casablanca", year: 1942 },
  { label: "City Lights", year: 1931 },
  { label: "Psycho", year: 1960 },
  { label: "The Green Mile", year: 1999 },
  { label: "The Intouchables", year: 2011 },
  { label: "Modern Times", year: 1936 },
  { label: "Raiders of the Lost Ark", year: 1981 },
  { label: "Rear Window", year: 1954 },
  { label: "The Pianist", year: 2002 },
  { label: "The Departed", year: 2006 },
  { label: "Terminator 2: Judgment Day", year: 1991 },
  { label: "Back to the Future", year: 1985 },
  { label: "Whiplash", year: 2014 },
  { label: "Gladiator", year: 2000 },
  { label: "Memento", year: 2000 },
  { label: "The Prestige", year: 2006 },
  { label: "The Lion King", year: 1994 },
  { label: "Apocalypse Now", year: 1979 },
  { label: "Alien", year: 1979 },
  { label: "Sunset Boulevard", year: 1950 },
  {
    label:
      "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb",
    year: 1964,
  },
  { label: "The Great Dictator", year: 1940 },
  { label: "Cinema Paradiso", year: 1988 },
  { label: "The Lives of Others", year: 2006 },
  { label: "Grave of the Fireflies", year: 1988 },
  { label: "Paths of Glory", year: 1957 },
  { label: "Django Unchained", year: 2012 },
  { label: "The Shining", year: 1980 },
  { label: "WALL·E", year: 2008 },
  { label: "American Beauty", year: 1999 },
  { label: "The Dark Knight Rises", year: 2012 },
  { label: "Princess Mononoke", year: 1997 },
  { label: "Aliens", year: 1986 },
  { label: "Oldboy", year: 2003 },
  { label: "Once Upon a Time in America", year: 1984 },
  { label: "Witness for the Prosecution", year: 1957 },
  { label: "Das Boot", year: 1981 },
  { label: "Citizen Kane", year: 1941 },
  { label: "North by Northwest", year: 1959 },
  { label: "Vertigo", year: 1958 },
  {
    label: "Star Wars: Episode VI - Return of the Jedi",
    year: 1983,
  },
  { label: "Reservoir Dogs", year: 1992 },
  { label: "Braveheart", year: 1995 },
  { label: "M", year: 1931 },
  { label: "Requiem for a Dream", year: 2000 },
  { label: "Amélie", year: 2001 },
  { label: "A Clockwork Orange", year: 1971 },
  { label: "Like Stars on Earth", year: 2007 },
  { label: "Taxi Driver", year: 1976 },
  { label: "Lawrence of Arabia", year: 1962 },
  { label: "Double Indemnity", year: 1944 },
  {
    label: "Eternal Sunshine of the Spotless Mind",
    year: 2004,
  },
  { label: "Amadeus", year: 1984 },
  { label: "To Kill a Mockingbird", year: 1962 },
  { label: "Toy Story 3", year: 2010 },
  { label: "Logan", year: 2017 },
  { label: "Full Metal Jacket", year: 1987 },
  { label: "Dangal", year: 2016 },
  { label: "The Sting", year: 1973 },
  { label: "2001: A Space Odyssey", year: 1968 },
  { label: "Singin' in the Rain", year: 1952 },
  { label: "Toy Story", year: 1995 },
  { label: "Bicycle Thieves", year: 1948 },
  { label: "The Kid", year: 1921 },
  { label: "Inglourious Basterds", year: 2009 },
  { label: "Snatch", year: 2000 },
  { label: "3 Idiots", year: 2009 },
  { label: "Monty Python and the Holy Grail", year: 1975 },
]
