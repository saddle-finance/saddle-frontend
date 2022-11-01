import {
  Box,
  Button,
  Collapse,
  Drawer,
  IconButton,
  TextField,
  Typography,
} from "@mui/material"
import React, { useEffect, useState } from "react"

import CalculateIcon from "@mui/icons-material/Calculate"
import { IS_PRODUCTION } from "../../utils/environment"
import { JsonRpcProvider } from "@ethersproject/providers"
import { isNumberOrEmpty } from "../../utils"
import { useActiveWeb3React } from "../../hooks"

type BlockState = {
  blockNumber: number
  blockTimestamp: number
  error: string | null
}

export default function DevTool() {
  const { library } = useActiveWeb3React()
  // const library = getDefaultProvider()
  const [stateBefore, setStateBefore] = useState<BlockState | null>(null)
  const [stateAfter, setStateAfter] = useState<BlockState | null>(null)

  const [skippingTime, setSkippingTime] = useState<string>("")
  const [openTool, setOpenTool] = useState<boolean>(false)

  useEffect(() => {
    const getTBlockAndTime = async () => {
      if (!library) {
        setStateBefore({
          blockNumber: 0,
          blockTimestamp: 0,
          error: "Error fetching current block, provider undefined",
        })
        return
      }
      try {
        const block = await library.getBlock("latest")
        setStateBefore({
          blockNumber: block.number,
          blockTimestamp: block.timestamp,
          error: null,
        })
      } catch {
        setStateBefore({
          blockNumber: 0,
          blockTimestamp: 0,
          error: "Error fetching current block",
        })
      }
    }
    void getTBlockAndTime()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [library])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (isNumberOrEmpty(event.target.value)) {
      setSkippingTime(event.target.value)
    }
  }

  const handleSubmit = async () => {
    try {
      if (!library) {
        setStateAfter({
          blockNumber: 0,
          blockTimestamp: 0,
          error: "Error, provider undefined",
        })
        return
      }
      await (library as JsonRpcProvider).send("evm_increaseTime", [
        +skippingTime,
      ])
      await (library as JsonRpcProvider).send("evm_mine", [])
      const block = await library.getBlock("latest")
      setStateAfter({
        blockNumber: block.number,
        blockTimestamp: block.timestamp,
        error: null,
      })
    } catch (error) {
      setStateAfter({
        blockNumber: 0,
        blockTimestamp: 0,
        error: (error as Error).message,
      })
    }
  }

  return (
    <Box>
      <Drawer open={openTool} anchor="right" onClose={() => setOpenTool(false)}>
        <Box width={300} mx="12px" mt="24px">
          <Box>
            <Typography>Block number: {stateBefore?.blockNumber}</Typography>
            <Typography>Timestamp: {stateBefore?.blockTimestamp}</Typography>
            {stateBefore?.error ? (
              <Typography>{stateBefore?.error}</Typography>
            ) : null}
          </Box>
          <Box my="20px">
            <TextField
              fullWidth
              value={skippingTime}
              placeholder="Enter seconds"
              onChange={handleChange}
            />
          </Box>
          <Button
            color="primary"
            variant="contained"
            fullWidth
            onClick={() => void handleSubmit()}
          >
            Submit
          </Button>
          <Collapse in={!!stateAfter}>
            <Box mt="12px">
              <Typography>
                Updated block number: {stateAfter?.blockNumber}
              </Typography>
              <Typography>
                Updated block Timestamp: {stateAfter?.blockTimestamp}
              </Typography>
              {stateAfter?.error ? (
                <Typography>Error: {stateAfter?.error}</Typography>
              ) : null}
            </Box>
          </Collapse>
        </Box>
      </Drawer>
      <Box>
        {!IS_PRODUCTION && (
          <IconButton
            onClick={() => setOpenTool((prev) => !prev)}
            sx={{ position: "fixed", bottom: 24, right: 24 }}
          >
            <CalculateIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  )
}
