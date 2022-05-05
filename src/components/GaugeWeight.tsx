import React, { useRef } from "react"
import { BigNumber } from "@ethersproject/bignumber"
import { CircularProgress } from "@mui/material"
import { Gauge } from "../providers/GaugeProvider"
import Highcharts from "highcharts"
import HighchartsExporting from "highcharts/modules/exporting"
import HighchartsReact from "highcharts-react-official"
import PieChart from "highcharts-react-official"

interface Props {
  gauges: Gauge[] | undefined
}

export default function GaugeWeight({
  gauges,
  ...props
}: Props & HighchartsReact.Props): JSX.Element {
  HighchartsExporting(Highcharts)
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)
  const data = gauges?.map((g) => {
    return {
      name: g.name,
      y: g.gaugeRelativeWeight.div(BigNumber.from(10).pow(16)).toNumber(),
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

  if (!gauges?.length) {
    return <CircularProgress color="secondary" />
  } else {
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
}
