import { ReportHandler } from "web-vitals"

const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    void import("web-vitals").then(
      ({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(onPerfEntry)
        getFID(onPerfEntry)
        getFCP(onPerfEntry)
        getLCP(onPerfEntry)
        getTTFB(onPerfEntry)
      },
    )
  }
}

export default reportWebVitals
