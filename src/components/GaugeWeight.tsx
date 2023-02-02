import { Box, CircularProgress, useTheme } from "@mui/material"
import React, { useContext, useMemo, useRef } from "react"

import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { GaugeContext } from "../providers/GaugeProvider"
import Highcharts from "highcharts"
import HighchartsExporting from "highcharts/modules/exporting"
import HighchartsReact from "highcharts-react-official"
import PieChart from "highcharts-react-official"
import { useSidechainGaugeWeightDataOnMainnet } from "../hooks/useSidechainGaugeWeightDataOnMainnet"

export type GaugeWeightData = {
  displayName: string
  gaugeRelativeWeight: BigNumber
}

function GaugeWeight({ ...props }: HighchartsReact.Props): JSX.Element {
  HighchartsExporting(Highcharts)
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)
  const basicPools = useContext(BasicPoolsContext)
  const { gauges } = useContext(GaugeContext)
  const { data: sidechainGaugesInfo } = useSidechainGaugeWeightDataOnMainnet()
  const theme = useTheme()

  const gaugesInfo = useMemo(
    () =>
      Object.values({ ...gauges })
        .map(({ gaugeName, gaugeRelativeWeight, poolAddress, isKilled }) => {
          if (isKilled) return
          const pool = Object.values(basicPools || {}).find(
            (pool) => pool.poolAddress === poolAddress,
          )
          return {
            displayName: pool?.poolName || gaugeName,
            gaugeRelativeWeight,
          }
        })
        .filter(Boolean) as GaugeWeightData[],
    [gauges, basicPools],
  )

  const sidechainGauges = useMemo(
    () =>
      (sidechainGaugesInfo?.gauges
        .map((gauge) => {
          if (gauge.isKilled) {
            return
          }

          return {
            name: gauge.displayName,
            y: gauge.gaugeRelativeWeight
              .div(BigNumber.from(10).pow(14))
              .toNumber(),
          }
        })
        .filter(Boolean) as {
        name: string
        y: number
      }[]) || [],
    [sidechainGaugesInfo],
  )

  const mainnetGauges = useMemo(
    () =>
      gaugesInfo.map(({ displayName, gaugeRelativeWeight }) => {
        const y = gaugeRelativeWeight.div(BigNumber.from(10).pow(14)).toNumber()
        return {
          name: displayName,
          y,
        }
      }),
    [gaugesInfo],
  )

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
        data: mainnetGauges.concat(sidechainGauges),
      },
    ],
  }

  if (!basicPools) {
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
export default GaugeWeight
