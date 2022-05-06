import React, { useContext, useRef } from "react"
import { BasicPoolsContext } from "../providers/BasicPoolsProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { CircularProgress } from "@mui/material"
import { Gauge } from "../providers/GaugeProvider"
import Highcharts from "highcharts"
import HighchartsExporting from "highcharts/modules/exporting"
import HighchartsReact from "highcharts-react-official"
import PieChart from "highcharts-react-official"

interface Props {
  gauges: { [poolAddress: string]: Gauge }
}

export default function GaugeWeight({
  gauges,
  ...props
}: Props & HighchartsReact.Props): JSX.Element {
  HighchartsExporting(Highcharts)
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)
  const pools = useContext(BasicPoolsContext)
  if (pools == undefined) return <CircularProgress color="secondary" />

  const gaugesInfo = Object.values(pools)
    .map((pool) => {
      if (!pool || !pool.poolAddress || !gauges[pool.poolAddress]) return
      const gaugePoolAddress = pool.poolAddress
      return {
        poolAddress: gaugePoolAddress,
        poolName: pool.poolName,
        gaugeRelativeWeight: gauges[gaugePoolAddress].gaugeRelativeWeight,
      }
    })
    .filter(
      (gaugeInfo) =>
        gaugeInfo != undefined && gauges[gaugeInfo.poolAddress] != null,
    )

  const data = gaugesInfo.map((g) => {
    return {
      name: g?.poolName,
      y: g?.gaugeRelativeWeight.div(BigNumber.from(10).pow(16)).toNumber(),
    }
  })

  const options: Highcharts.Options = {
    title: {
      text: "Gauge Relative Weight",
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
