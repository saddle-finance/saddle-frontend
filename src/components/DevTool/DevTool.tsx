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
import { getNetworkLibrary } from "../../connectors"
import { isNumberOrEmpty } from "../../utils"

export default function DevTool() {
  const provider = getNetworkLibrary() as JsonRpcProvider
  const [blockNumBefore, setBlockNumBefore] = useState<number | null>(null)
  const [blockTimeBefore, setBlockTimeBefore] = useState<number | null>(null)
  const [updatedBlockNum, setUpdatedBlockNum] = useState<number | null>(null)
  const [updatedBlockTime, setUpdatedBlockTime] = useState<number | null>(null)
  const [skippingTime, setSkippingTime] = useState<string>("")
  const [openCollapse, setOpenCollapse] = useState(false)
  const [openTool, setOpenTool] = useState<boolean>(false)

  useEffect(() => {
    const getTBlockAndTime = async () => {
      const blockNum = await provider.getBlockNumber()
      const blockTime = (await provider.getBlock(blockNum)).timestamp

      setBlockNumBefore(blockNum)
      setBlockTimeBefore(blockTime)
    }
    void getTBlockAndTime()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (isNumberOrEmpty(event.target.value)) {
      setSkippingTime(event.target.value)
    }
  }

  const handleSubmit = async () => {
    try {
      await provider.send("evm_increaseTime", [+skippingTime])
      await provider.send("evm_mine", [])
      const blockNumber = await provider.getBlockNumber()
      const blockTime = (await provider.getBlock(blockNumber)).timestamp
      setUpdatedBlockNum(blockNumber)
      setUpdatedBlockTime(blockTime)
      setOpenCollapse(true)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Box>
      <Drawer open={openTool} anchor="right" onClose={() => setOpenTool(false)}>
        <Box width={300} mx="12px" mt="24px">
          <Box>
            <Typography>Block number: {blockNumBefore}</Typography>
            <Typography>Timestamp: {blockTimeBefore}</Typography>
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
          <Collapse in={openCollapse}>
            <Box mt="12px">
              <Typography>Updated block number: {updatedBlockNum}</Typography>
              <Typography>
                Updated block Timestamp: {updatedBlockTime}
              </Typography>
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
