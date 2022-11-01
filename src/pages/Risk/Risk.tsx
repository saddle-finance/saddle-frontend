import { Container, Link, Typography } from "@mui/material"
import React, { ReactElement } from "react"

import { useTranslation } from "react-i18next"

function Risk(): ReactElement {
  const { t } = useTranslation()

  return (
    <Container maxWidth="md" sx={{ pb: 16 }}>
      <Typography variant="h3" mt={5} mb={2}>
        Risk
      </Typography>
      <Typography variant="body1" data-testid="risk-intro">
        {t("riskIntro")}{" "}
        <Link href="https://github.com/saddle-finance/saddle-contract">
          {t("riskIntro2")}
        </Link>{" "}
        {t("riskIntro3")}
      </Typography>
      <Typography variant="h3" mt={5} mb={2}>
        {t("audits")}
      </Typography>
      <Typography variant="body1" data-testid="risk-audits">
        {t("riskAudits")}{" "}
        <Link href="https://github.com/saddle-finance/saddle-audits">
          {t("riskAudits2")}
        </Link>
        {"."}
        <br />
        <br />
        {t("riskAudits3")}
        <br />
        <br />
        {t("riskAudits4")}
      </Typography>
      <Typography variant="h3" mt={5} mb={2}>
        {t("adminKeys")}
      </Typography>
      <Typography variant="body1" data-testid="risk-adminkeys">
        {t("riskAdminKeys")}
      </Typography>
      <Typography variant="h3" mt={5} mb={2}>
        {t("lossOfPeg")}
      </Typography>
      <Typography variant="body1" data-testid="risk-lossofpeg">
        {t("riskLossOfPeg")}
      </Typography>
      <Typography variant="h3" mt={5} mb={2}>
        {t("unnecessaryApprovalAskQ")}
      </Typography>
      <p>
        {t("unnecessaryApprovalAskA")} <br />
        <br />
        <Link href="https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729">
          ERC: Token standard · Issue #20 · ethereum/EIPs
        </Link>
      </p>
      <Typography variant="h3" mt={5} mb={2}>
        {t("permissionlessPools")}
      </Typography>
      <Typography variant="body1" data-testid="risk-lossofpeg">
        {t("riskPermissionlessPools")}
      </Typography>
    </Container>
  )
}

export default Risk
