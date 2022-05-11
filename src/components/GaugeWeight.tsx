import { BasicPool, BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { CircularProgress, useTheme } from "@mui/material"
import React, { useContext, useRef } from "react"
import { BigNumber } from "@ethersproject/bignumber"
import Highcharts from "highcharts"
import HighchartsExporting from "highcharts/modules/exporting"
import HighchartsReact from "highcharts-react-official"
import PieChart from "highcharts-react-official"
import { PoolAddressToGauge } from "../providers/GaugeProvider"

interface Props {
  gauges: PoolAddressToGauge
}

export type GaugeWeightData = {
  poolAddress: string
  poolName: string
  gaugeRelativeWeight: BigNumber
}

export default function GaugeWeight({
  gauges,
  ...props
}: Props & HighchartsReact.Props): JSX.Element {
  HighchartsExporting(Highcharts)
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)
  const pools = useContext(BasicPoolsContext)
  const theme = useTheme()
  if (pools == undefined) return <CircularProgress color="secondary" />

  const gaugesInfo = (Object.values(pools) as BasicPool[])
    .map((pool) => {
      const gaugePoolAddress = pool.poolAddress
      const gauge = gauges[gaugePoolAddress]
      return gauge
        ? {
            poolAddress: gaugePoolAddress,
            poolName: pool.poolName,
            gaugeRelativeWeight: gauge.gaugeRelativeWeight,
          }
        : null
    })
    .filter(Boolean) as GaugeWeightData[]

  const data = gaugesInfo.map((g) => {
    return {
      name: g.poolName,
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
