import { useState } from "react";
import { Box, Grid, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { useGetAdminAnalyticsQuery } from "@/entities/admin-analytics/api/adminAnalyticsApi";
import type { AnalyticsKpiId, AnalyticsQuery } from "@/entities/admin-analytics/model/types";
import { useLanguage } from "@/features/language/model";
import Button from "@/shared/ui/primitives/Button";
import ErrorState from "@/shared/ui/feedback/ErrorState";
import PageHeader from "@/shared/ui/layout/PageHeader";
import AnalyticsCharts from "./AnalyticsCharts";
import AnalyticsPanel from "./AnalyticsPanel";
import DashboardFilters, { type DatePreset } from "./DashboardFilters";
import KpiGrid, { KpiGridSkeleton } from "./KpiGrid";
import RecentActivity from "./RecentActivity";
import TesterAnalytics from "./TesterAnalytics";
import ProjectAnalyticsTables from "./ProjectAnalyticsTables";
import { formatDateTime, humanize } from "../lib/formatters";

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function presetDates(preset: DatePreset) {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  let from = new Date(today);
  let to = new Date(today);
  if (preset === "7d") from.setUTCDate(from.getUTCDate() - 6);
  if (preset === "30d") from.setUTCDate(from.getUTCDate() - 29);
  if (preset === "month") from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  if (preset === "lastMonth") {
    from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
    to = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0));
  }
  if (preset === "quarter") from = new Date(Date.UTC(today.getUTCFullYear(), Math.floor(today.getUTCMonth() / 3) * 3, 1));
  if (preset === "year") from = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
  return { from: isoDate(from), to: isoDate(to) };
}

const initialDates = presetDates("30d");
const initialQuery: AnalyticsQuery = { ...initialDates, granularity: "day" };

const copy = {
  en: {
    eyebrow: "Admin · Security intelligence",
    title: "Laboratory analytics",
    description: "A live executive view of project throughput, security exposure and tester performance.",
    refresh: "Refresh analytics",
    updated: "Updated",
    filters: "Global analytics filters",
    period: "Date period", from: "From date", to: "To date", project: "Project", tester: "Tester", severity: "Severity", findingStatus: "Finding status", projectStatus: "Project status", granularity: "Granularity", all: "All", reset: "Reset filters",
    presets: { today: "Today", "7d": "Last 7 days", "30d": "Last 30 days", month: "This month", lastMonth: "Last month", quarter: "This quarter", year: "This year", custom: "Custom range" },
    empty: "No analytics for this period",
    loadError: "Analytics could not be loaded",
    retry: "Retry",
    resolution: "Resolution time by severity",
    resolutionDescription: "Mean time from finding creation to its latest closed-state timestamp.",
    sample: "closed findings in sample",
  },
  fa: {
    eyebrow: "مدیر · هوشمندی امنیت",
    title: "تحلیل جامع آزمایشگاه",
    description: "نمای زنده مدیریتی از جریان پروژه‌ها، ریسک امنیتی و عملکرد آزمونگران.",
    refresh: "به‌روزرسانی تحلیل‌ها",
    updated: "آخرین به‌روزرسانی",
    filters: "فیلترهای سراسری تحلیل",
    period: "بازه زمانی", from: "از تاریخ", to: "تا تاریخ", project: "پروژه", tester: "آزمونگر", severity: "شدت", findingStatus: "وضعیت یافته", projectStatus: "وضعیت پروژه", granularity: "دانه‌بندی", all: "همه", reset: "پاک‌کردن فیلترها",
    presets: { today: "امروز", "7d": "۷ روز اخیر", "30d": "۳۰ روز اخیر", month: "ماه جاری", lastMonth: "ماه گذشته", quarter: "فصل جاری", year: "سال جاری", custom: "بازه دلخواه" },
    empty: "در این بازه داده‌ای وجود ندارد",
    loadError: "دریافت تحلیل‌ها ناموفق بود",
    retry: "تلاش دوباره",
    resolution: "زمان رفع بر اساس شدت",
    resolutionDescription: "میانگین زمان ایجاد یافته تا آخرین زمان ثبت وضعیت بسته.",
    sample: "یافته بسته در نمونه",
  },
} as const;

const kpiLabels: Record<"en" | "fa", Record<AnalyticsKpiId, string>> = {
  en: { totalProjects: "Total projects", activeProjects: "Active projects", completedProjects: "Completed projects", totalFindings: "Total findings", criticalFindings: "Critical findings", highFindings: "High findings", openFindings: "Open findings", closedFindings: "Closed findings", activeTesters: "Active testers", averageFindingsPerProject: "Avg. findings / project", closureRate: "Closure rate", mttr: "Mean time to resolve" },
  fa: { totalProjects: "کل پروژه‌ها", activeProjects: "پروژه‌های فعال", completedProjects: "پروژه‌های تکمیل‌شده", totalFindings: "کل یافته‌ها", criticalFindings: "یافته‌های بحرانی", highFindings: "یافته‌های پرخطر", openFindings: "یافته‌های باز", closedFindings: "یافته‌های بسته", activeTesters: "آزمونگران فعال", averageFindingsPerProject: "میانگین یافته / پروژه", closureRate: "نرخ بسته‌شدن", mttr: "میانگین زمان رفع" },
};

function DashboardBodySkeleton() {
  return <VStack align="stretch" gap={4}><KpiGridSkeleton /><Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={4}>{Array.from({ length: 4 }, (_, index) => <Box key={index} bg="var(--apple-surface-raised)" border="1px solid" borderColor="var(--apple-border-soft)" borderRadius="xl" p={5}><Skeleton h="18px" w="42%" mb={5} /><Skeleton h="280px" /></Box>)}</Grid></VStack>;
}

export default function AdminAnalyticsDashboard() {
  const { language, dir } = useLanguage();
  const text = copy[language];
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [query, setQuery] = useState<AnalyticsQuery>(initialQuery);
  const { data, isLoading, isFetching, error, refetch } = useGetAdminAnalyticsQuery(query);

  const onPresetChange = (nextPreset: DatePreset) => {
    setPreset(nextPreset);
    if (nextPreset !== "custom") setQuery((current) => ({ ...current, ...presetDates(nextPreset) }));
  };
  const onQueryChange = (patch: Partial<AnalyticsQuery>) => {
    if ("from" in patch || "to" in patch) setPreset("custom");
    setQuery((current) => ({ ...current, ...patch }));
  };
  const generatedAt = data?.meta.generatedAt
    ? formatDateTime(data.meta.generatedAt, language)
    : "—";

  return (
    <VStack align="stretch" gap={{ base: 4, md: 5 }} dir={dir}>
      <PageHeader eyebrow={text.eyebrow} title={text.title} description={text.description} meta={<HStack gap={2} flexWrap="wrap"><HStack gap={1.5} color="var(--apple-muted)"><ShieldCheck size={14} /><Text fontSize="xs" fontWeight="750">{text.updated}: <Box as="span" dir="ltr">{generatedAt}</Box></Text></HStack><Button size="sm" variant="secondary" onClick={() => refetch()} disabled={isFetching} aria-label={text.refresh}><HStack gap={1.5}><RefreshCw size={14} className={isFetching ? "analytics-spin" : undefined} /><Text>{text.refresh}</Text></HStack></Button></HStack>} />

      <DashboardFilters query={query} preset={preset} options={data?.filters} language={language} copy={text} onQueryChange={onQueryChange} onPresetChange={onPresetChange} onReset={() => { setPreset("30d"); setQuery(initialQuery); }} />

      {isLoading && <DashboardBodySkeleton />}
      {!isLoading && error && <Box bg="var(--apple-surface-raised)" border="1px solid" borderColor="var(--apple-border-soft)" borderRadius="xl" p={4}><ErrorState error={error} title={text.loadError} /><Button mt={3} variant="secondary" onClick={() => refetch()}>{text.retry}</Button></Box>}
      {!isLoading && !error && data && <VStack align="stretch" gap={4} opacity={isFetching ? 0.72 : 1} transition="opacity 150ms ease" aria-busy={isFetching}>
        <KpiGrid kpis={data.kpis} labels={kpiLabels[language]} language={language} projectTrend={data.completionTrend} findingTrend={data.findingTrend} />
        <AnalyticsCharts data={data} language={language} emptyMessage={text.empty} />
        <TesterAnalytics testers={data.testerPerformance} language={language} onSelectTester={(tester) => onQueryChange({ tester })} />
        <ProjectAnalyticsTables data={data} />
        <Grid templateColumns={{ base: "1fr", xl: "minmax(0, .65fr) minmax(0, 1.35fr)" }} gap={4}>
          <AnalyticsPanel title={text.resolution} description={text.resolutionDescription}>
            <VStack align="stretch" gap={3} mt={2}>{["critical", "high", "medium"].map((severity) => <HStack key={severity} justify="space-between" p={3} bg="var(--apple-surface-subtle)" borderRadius="lg"><Text fontSize="sm" fontWeight="800">{humanize(severity)}</Text><Text dir="ltr" fontWeight="850">{data.resolution.bySeverity[severity] === undefined ? "—" : `${data.resolution.bySeverity[severity]}h`}</Text></HStack>)}<Text fontSize="xs" color="var(--apple-muted)" dir="ltr">n={data.resolution.sampleSize} {text.sample}</Text></VStack>
          </AnalyticsPanel>
          <RecentActivity activity={data.recentActivity} language={language} />
        </Grid>
      </VStack>}
    </VStack>
  );
}
