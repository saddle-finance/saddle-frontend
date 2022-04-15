import React, { useRef } from "react"
import Highcharts from "highcharts"
import HighchartsExporting from "highcharts/modules/exporting"
import HighchartsReact from "highcharts-react-official"
import PieChart from "highcharts-react-official"

interface GaugeWeight {
  name: string
  gauge_relative_weight: string
}

interface Props {
  gauges: GaugeWeight[]
}

export default function Gauge({ gauges }: Props): JSX.Element {
  HighchartsExporting(Highcharts)
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)
  const data = gauges.map((g) => {
    return {
      name: g.name,
      y: parseInt(g.gauge_relative_weight) / 1e16,
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
      pointFormat: "Gauge relative weights: {point.percentage:.3f}%",
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
    />
  )
}
