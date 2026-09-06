import { useMemo, useState } from "react";
import { Avatar, Box, Grid, HStack, NativeSelect, Table, Text, VStack } from "@chakra-ui/react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TesterMetric } from "@/entities/admin-analytics/model/types";
import type { Language } from "@/features/language/model";
import Button from "@/shared/ui/primitives/Button";
import Input from "@/shared/ui/primitives/Input";
import EmptyState from "@/shared/ui/feedback/EmptyState";
import AnalyticsPanel from "./AnalyticsPanel";
import { formatDateTime } from "../lib/formatters";

type SortKey = "totalFindings" | "critical" | "high" | "confirmed";

export default function TesterAnalytics({
  testers,
  language,
  onSelectTester,
}: {
  testers: TesterMetric[];
  language: Language;
  onSelectTester: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("totalFindings");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return testers
      .filter((tester) => !needle || `${tester.name} ${tester.username || ""}`.toLowerCase().includes(needle))
      .sort((left, right) => right[sortBy] - left[sortBy]);
  }, [search, sortBy, testers]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((Math.min(page, totalPages) - 1) * pageSize, Math.min(page, totalPages) * pageSize);
  const ranking = filtered.slice(0, 8).map((tester) => ({ ...tester, shortName: tester.name.length > 17 ? `${tester.name.slice(0, 16)}…` : tester.name }));

  return (
    <Grid templateColumns={{ base: "1fr", xl: "minmax(0, .72fr) minmax(0, 1.28fr)" }} gap={4}>
      <AnalyticsPanel title="Top testers by findings" description="Select a tester to drill into the entire dashboard.">
        {ranking.length ? (
          <Box h="335px" dir="ltr" role="img" aria-label="Top tester ranking chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ranking} layout="vertical" margin={{ top: 8, right: 18, left: 30 }}>
                <CartesianGrid stroke="var(--apple-border-soft)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: "var(--apple-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="shortName" width={105} tick={{ fill: "var(--apple-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--apple-surface)", border: "1px solid var(--apple-border)", borderRadius: 8, color: "var(--apple-text)" }} />
                <Bar dataKey={sortBy} name={sortBy} fill="var(--analytics-blue)" radius={[0, 5, 5, 0]} maxBarSize={22} cursor="pointer" onClick={(_entry, index) => onSelectTester(ranking[index].id)} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : <EmptyState title="No tester activity" description="No findings were submitted in this period." />}
      </AnalyticsPanel>

      <AnalyticsPanel title="Tester performance overview" description="Search, rank, paginate and drill into individual activity.">
        <Grid templateColumns={{ base: "1fr", sm: "minmax(0, 1fr) 180px" }} gap={3} mb={4}>
          <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search tester or username" aria-label="Search tester performance" />
          <NativeSelect.Root>
            <NativeSelect.Field value={sortBy} onChange={(event) => { setSortBy(event.target.value as SortKey); setPage(1); }} bg="var(--apple-surface)" borderColor="var(--apple-border)" aria-label="Sort tester performance">
              <option value="totalFindings">Total findings</option><option value="critical">Critical findings</option><option value="high">High findings</option><option value="confirmed">Confirmed findings</option>
            </NativeSelect.Field><NativeSelect.Indicator />
          </NativeSelect.Root>
        </Grid>
        {visible.length ? <>
          <Box overflowX="auto" border="1px solid" borderColor="var(--apple-border-soft)" borderRadius="lg">
            <Table.Root size="sm" variant="line" minW="980px" interactive stickyHeader>
              <Table.Header><Table.Row bg="var(--apple-surface-subtle)">
                <Table.ColumnHeader>Tester</Table.ColumnHeader><Table.ColumnHeader textAlign="end">Projects</Table.ColumnHeader><Table.ColumnHeader textAlign="end">Total</Table.ColumnHeader><Table.ColumnHeader textAlign="end">Critical</Table.ColumnHeader><Table.ColumnHeader textAlign="end">High</Table.ColumnHeader><Table.ColumnHeader textAlign="end">Medium</Table.ColumnHeader><Table.ColumnHeader textAlign="end">Low</Table.ColumnHeader><Table.ColumnHeader textAlign="end">Confirmed</Table.ColumnHeader><Table.ColumnHeader textAlign="end">Closed / rejected</Table.ColumnHeader><Table.ColumnHeader>Last activity</Table.ColumnHeader>
              </Table.Row></Table.Header>
              <Table.Body>{visible.map((tester) => <Table.Row key={tester.id} _hover={{ bg: "var(--apple-blue-soft)" }}>
                <Table.Cell><Button variant="ghost" size="sm" onClick={() => onSelectTester(tester.id)} aria-label={`Filter analytics by ${tester.name}`}><HStack gap={2}><Avatar.Root size="xs"><Avatar.Fallback name={tester.name} /></Avatar.Root><VStack align="start" gap={0}><Text fontWeight="800">{tester.name}</Text>{tester.username && <Text fontSize="10px" color="var(--apple-muted)">@{tester.username}</Text>}</VStack></HStack></Button></Table.Cell>
                <Table.Cell textAlign="end">{tester.projects}</Table.Cell><Table.Cell textAlign="end" fontWeight="850">{tester.totalFindings}</Table.Cell><Table.Cell textAlign="end" color="var(--analytics-critical)">{tester.critical}</Table.Cell><Table.Cell textAlign="end" color="var(--analytics-high)">{tester.high}</Table.Cell><Table.Cell textAlign="end">{tester.medium}</Table.Cell><Table.Cell textAlign="end">{tester.low}</Table.Cell><Table.Cell textAlign="end">{tester.confirmed}</Table.Cell><Table.Cell textAlign="end">{tester.rejected}</Table.Cell><Table.Cell whiteSpace="nowrap" fontSize="xs" color="var(--apple-muted)">{tester.lastActivity ? formatDateTime(tester.lastActivity, language) : "—"}</Table.Cell>
              </Table.Row>)}</Table.Body>
            </Table.Root>
          </Box>
          <HStack justify="space-between" mt={3} flexWrap="wrap"><Text fontSize="xs" color="var(--apple-muted)">{filtered.length} testers · page {Math.min(page, totalPages)} of {totalPages}</Text><HStack><Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button></HStack></HStack>
        </> : <EmptyState title="No matching testers" description="Change the search or global analytics filters." />}
      </AnalyticsPanel>
    </Grid>
  );
}
