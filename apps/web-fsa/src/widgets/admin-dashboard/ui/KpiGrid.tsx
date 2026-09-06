import { Box, Grid, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Gauge,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { AnalyticsKpi, AnalyticsKpiId, TrendPoint } from "@/entities/admin-analytics/model/types";
import type { Language } from "@/features/language/model";
import { formatMetric } from "../lib/formatters";

const iconById = {
  totalProjects: FolderKanban,
  activeProjects: Activity,
  completedProjects: CheckCircle2,
  totalFindings: ShieldAlert,
  criticalFindings: AlertTriangle,
  highFindings: AlertTriangle,
  openFindings: Gauge,
  closedFindings: CheckCircle2,
  activeTesters: Users,
  averageFindingsPerProject: Gauge,
  closureRate: CheckCircle2,
  mttr: Clock3,
} satisfies Record<AnalyticsKpiId, typeof Activity>;

const accentById: Partial<Record<AnalyticsKpiId, string>> = {
  criticalFindings: "#ff453a",
  highFindings: "#ff9f0a",
  openFindings: "#ffd60a",
  completedProjects: "#30d158",
  closedFindings: "#30d158",
  closureRate: "#30d158",
};

function sparklineData(kpi: AnalyticsKpi, projectTrend: TrendPoint[], findingTrend: TrendPoint[]) {
  const projectIds: AnalyticsKpiId[] = ["totalProjects", "activeProjects", "completedProjects"];
  const source = projectIds.includes(kpi.id) ? projectTrend : findingTrend;
  const key = kpi.id === "completedProjects" ? "completed" : kpi.id.includes("Project") || kpi.id === "totalProjects" ? "created" : "total";
  return source.slice(-14).map((point) => ({ value: Number(point[key] || 0) }));
}

export default function KpiGrid({
  kpis,
  labels,
  language,
  projectTrend,
  findingTrend,
}: {
  kpis: AnalyticsKpi[];
  labels: Record<AnalyticsKpiId, string>;
  language: Language;
  projectTrend: TrendPoint[];
  findingTrend: TrendPoint[];
}) {
  return (
    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" }} gap={3}>
      {kpis.map((kpi) => {
        const Icon = iconById[kpi.id];
        const accent = accentById[kpi.id] || "var(--apple-blue)";
        const trend = sparklineData(kpi, projectTrend, findingTrend);
        const positive = (kpi.changePercent || 0) >= 0;
        return (
          <Box
            key={kpi.id}
            bg="var(--apple-surface-raised)"
            border="1px solid"
            borderColor="var(--apple-border-soft)"
            borderRadius="xl"
            p={4}
            minH="152px"
            position="relative"
            overflow="hidden"
            transition="transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease"
            _hover={{ transform: "translateY(-2px)", borderColor: "var(--apple-blue-border)", boxShadow: "0 10px 30px rgba(0,0,0,.07)" }}
            title={`${labels[kpi.id]} — previous period: ${kpi.previous ?? "not available"}`}
          >
            <HStack justify="space-between" align="start" gap={3} position="relative" zIndex={1}>
              <VStack align="start" gap={2} minW={0}>
                <HStack gap={2} color="var(--apple-muted)">
                  <Box color={accent}><Icon size={16} strokeWidth={2.1} /></Box>
                  <Text fontSize="xs" fontWeight="800" lineClamp={1}>{labels[kpi.id]}</Text>
                </HStack>
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="880" letterSpacing="-.035em" dir="ltr">
                  {formatMetric(kpi.value, kpi.unit, language)}
                </Text>
                <HStack gap={1.5} minH="20px" dir="ltr">
                  {kpi.changePercent === null ? (
                    <Text fontSize="xs" color="var(--apple-muted)">No comparison</Text>
                  ) : (
                    <>
                      <Text fontSize="xs" fontWeight="850" color={positive ? "var(--apple-success-text)" : "var(--apple-danger-text)"}>
                        {positive ? "↑" : "↓"} {Math.abs(kpi.changePercent)}%
                      </Text>
                      <Text fontSize="xs" color="var(--apple-muted)">vs previous</Text>
                    </>
                  )}
                </HStack>
              </VStack>
              <Box w="84px" h="54px" mt={8} opacity={0.85} aria-hidden dir="ltr">
                {trend.length > 1 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend}>
                      <Area type="monotone" dataKey="value" stroke={accent} fill={accent} fillOpacity={0.1} strokeWidth={1.8} isAnimationActive />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </HStack>
          </Box>
        );
      })}
    </Grid>
  );
}

export function KpiGridSkeleton() {
  return (
    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" }} gap={3}>
      {Array.from({ length: 12 }, (_, index) => (
        <Box key={index} bg="var(--apple-surface-raised)" border="1px solid" borderColor="var(--apple-border-soft)" borderRadius="xl" p={4} minH="152px">
          <Skeleton height="14px" width="55%" mb={5} /><Skeleton height="34px" width="38%" mb={4} /><Skeleton height="12px" width="64%" />
        </Box>
      ))}
    </Grid>
  );
}
