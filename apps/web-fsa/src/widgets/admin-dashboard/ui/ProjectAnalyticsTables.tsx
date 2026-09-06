import { Box, Grid, HStack, Table, Text } from "@chakra-ui/react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { AdminAnalytics } from "@/entities/admin-analytics/model/types";
import EmptyState from "@/shared/ui/feedback/EmptyState";
import AnalyticsPanel from "./AnalyticsPanel";

export default function ProjectAnalyticsTables({ data }: { data: AdminAnalytics }) {
  return (
    <Grid templateColumns={{ base: "1fr", xl: "repeat(2, minmax(0, 1fr))" }} gap={4}>
      <AnalyticsPanel title="Findings by project" description="Top 15 projects with severity mix and defensible weighted risk.">
        {data.projectRisk.length ? <Box overflowX="auto" border="1px solid" borderColor="var(--apple-border-soft)" borderRadius="lg">
          <Table.Root size="sm" minW="700px" interactive>
            <Table.Header><Table.Row bg="var(--apple-surface-subtle)"><Table.ColumnHeader>Project</Table.ColumnHeader><Table.ColumnHeader textAlign="end">Total</Table.ColumnHeader><Table.ColumnHeader textAlign="end">Critical</Table.ColumnHeader><Table.ColumnHeader textAlign="end">High</Table.ColumnHeader><Table.ColumnHeader textAlign="end">Medium</Table.ColumnHeader><Table.ColumnHeader textAlign="end">Low</Table.ColumnHeader><Table.ColumnHeader textAlign="end">Risk</Table.ColumnHeader></Table.Row></Table.Header>
            <Table.Body>{data.projectRisk.map((project) => <Table.Row key={project.id}><Table.Cell><Box asChild color="var(--apple-text)" fontWeight="800" _hover={{ color: "var(--apple-blue)" }}><Link to={`/projects/${project.id}/bugs`}><HStack gap={1.5}>{project.name}<ArrowUpRight size={13} /></HStack></Link></Box></Table.Cell><Table.Cell textAlign="end" fontWeight="850">{project.total}</Table.Cell><Table.Cell textAlign="end" color="var(--analytics-critical)">{project.critical}</Table.Cell><Table.Cell textAlign="end" color="var(--analytics-high)">{project.high}</Table.Cell><Table.Cell textAlign="end">{project.medium}</Table.Cell><Table.Cell textAlign="end">{project.low}</Table.Cell><Table.Cell textAlign="end" fontWeight="850">{project.riskScore}</Table.Cell></Table.Row>)}</Table.Body>
          </Table.Root>
        </Box> : <EmptyState title="No project findings" description="Project-level risk will appear after findings are submitted." />}
      </AnalyticsPanel>

      <AnalyticsPanel title="Project × tester activity" description="Heatmap-like activity detail from real finding submissions.">
        {data.testerProjectMatrix.length ? <Box maxH="430px" overflow="auto" border="1px solid" borderColor="var(--apple-border-soft)" borderRadius="lg">
          <Table.Root size="sm" minW="620px" interactive stickyHeader>
            <Table.Header><Table.Row bg="var(--apple-surface-subtle)"><Table.ColumnHeader>Tester</Table.ColumnHeader><Table.ColumnHeader>Project</Table.ColumnHeader><Table.ColumnHeader textAlign="end">Findings</Table.ColumnHeader><Table.ColumnHeader textAlign="end">Critical</Table.ColumnHeader><Table.ColumnHeader textAlign="end">High</Table.ColumnHeader></Table.Row></Table.Header>
            <Table.Body>{data.testerProjectMatrix.map((row) => <Table.Row key={`${row.testerId}:${row.projectId}`}><Table.Cell fontWeight="800">{row.testerName}</Table.Cell><Table.Cell><Box asChild _hover={{ color: "var(--apple-blue)" }}><Link to={`/projects/${row.projectId}/bugs`}>{row.projectName}</Link></Box></Table.Cell><Table.Cell textAlign="end"><Text as="span" display="inline-flex" minW="30px" justifyContent="center" py="2px" px={2} borderRadius="md" bg={`color-mix(in srgb, var(--analytics-blue) ${Math.min(70, 12 + row.findings * 5)}%, transparent)`} fontWeight="850">{row.findings}</Text></Table.Cell><Table.Cell textAlign="end" color="var(--analytics-critical)">{row.critical}</Table.Cell><Table.Cell textAlign="end" color="var(--analytics-high)">{row.high}</Table.Cell></Table.Row>)}</Table.Body>
          </Table.Root>
        </Box> : <EmptyState title="No tester-project activity" description="Finding submissions grouped by tester and project will appear here." />}
      </AnalyticsPanel>
    </Grid>
  );
}
