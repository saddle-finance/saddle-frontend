import { Box, CircularProgress, useTheme } from "@mui/material"
import React, { useContext, useRef } from "react"

import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { GaugeContext } from "../providers/GaugeProvider"
import Highcharts from "highcharts"
import HighchartsExporting from "highcharts/modules/exporting"
import HighchartsReact from "highcharts-react-official"
import PieChart from "highcharts-react-official"

export type GaugeWeightData = {
  displayName: string
  gaugeRelativeWeight: BigNumber
}

export default function GaugeWeight({
  ...props
}: HighchartsReact.Props): JSX.Element {
  HighchartsExporting(Highcharts)
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)
  const basicPools = useContext(BasicPoolsContext)
  const { gauges } = useContext(GaugeContext)
  const theme = useTheme()
  if (!basicPools)
    return (
      <Box
        display="flex"
        height="100%"
        width="100%"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress color="secondary" />
      </Box>
    )
  const gaugesInfo = Object.values(gauges)
    .map(({ gaugeName, gaugeRelativeWeight, poolAddress }) => {
      const pool = Object.values(basicPools || {}).find(
        (pool) => pool.poolAddress === poolAddress,
      )
      return {
        displayName: pool?.poolName || gaugeName,
        gaugeRelativeWeight,
      }
    })
    .filter(Boolean) as GaugeWeightData[]

  const data = gaugesInfo.map((g) => {
    return {
      name: g.displayName,
      y: g.gaugeRelativeWeight.div(BigNumber.from(10).pow(16)).toNumber(),
    }
  })

  const options: Highcharts.Options = {
    chart: {
      backgroundColor: theme.palette.background.paper,
    },
    title: {
      text: "Gauge Relative Weight",
      style: {
        color: theme.palette.text.primary,
      },
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: ["viewFullscreen"],
        },
      },
    },
    tooltip: {
      pointFormat: "Gauge relative weights: {point.percentage:.2f}%",
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "{point.name}",
        },
      },
    },
    yAxis: {
      allowDecimals: true,
    },
    series: [
      {
        type: "pie",
        data,
      },
    ],
  }

  return (
    <PieChart
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
      allowChartUpdate
      {...props}
    />
  )
}
