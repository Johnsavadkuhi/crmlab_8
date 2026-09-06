import { Box, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminAnalytics, DistributionPoint } from "@/entities/admin-analytics/model/types";
import type { Language } from "@/features/language/model";
import EmptyState from "@/shared/ui/feedback/EmptyState";
import AnalyticsPanel from "./AnalyticsPanel";
import { formatPeriod, humanize } from "../lib/formatters";

const chartColors = {
  blue: "var(--analytics-blue)",
  cyan: "var(--analytics-cyan)",
  critical: "var(--analytics-critical)",
  high: "var(--analytics-high)",
  medium: "var(--analytics-medium)",
  low: "var(--analytics-low)",
  info: "var(--analytics-info)",
  success: "var(--analytics-success)",
};

const tooltipStyle = {
  background: "var(--apple-surface)",
  border: "1px solid var(--apple-border)",
  borderRadius: "8px",
  boxShadow: "0 12px 34px rgba(0,0,0,.13)",
  color: "var(--apple-text)",
  fontSize: "12px",
};

function ChartEmpty({ message }: { message: string }) {
  return <EmptyState title={message} description="Try another date range or clear the active filters." />;
}

function ChartFrame({ children, label }: { children: ReactNode; label: string }) {
  return <Box h={{ base: "260px", md: "310px" }} w="full" dir="ltr" role="img" aria-label={label}>{children}</Box>;
}

function TrendTooltip({ language }: { language: Language }) {
  return <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--apple-text)", fontWeight: 800 }} itemStyle={{ color: "var(--apple-secondary)" }} labelFormatter={(value) => formatPeriod(String(value), language, false)} />;
}

function DistributionList({ data, total }: { data: DistributionPoint[]; total: number }) {
  return (
    <VStack align="stretch" gap={2} mt={2}>
      {data.slice(0, 7).map((item, index) => (
        <HStack key={item.key} justify="space-between" fontSize="xs">
          <HStack gap={2} minW={0}>
            <Box boxSize="7px" borderRadius="full" bg={Object.values(chartColors)[index % Object.values(chartColors).length]} />
            <Text color="var(--apple-secondary)" lineClamp={1}>{humanize(item.key)}</Text>
          </HStack>
          <Text fontWeight="800" dir="ltr">{item.value} · {total ? ((item.value / total) * 100).toFixed(0) : 0}%</Text>
        </HStack>
      ))}
    </VStack>
  );
}

export default function AnalyticsCharts({ data, language, emptyMessage }: { data: AdminAnalytics; language: Language; emptyMessage: string }) {
  const totalSeverity = data.severityDistribution.reduce((sum, item) => sum + item.value, 0);
  const severityColors: Record<string, string> = {
    critical: chartColors.critical,
    high: chartColors.high,
    medium: chartColors.medium,
    low: chartColors.low,
    info: chartColors.info,
  };
  const findingStatusData = data.findingStatusDistribution.slice(0, 9);
  const projectRisk = data.projectRisk.slice(0, 10).map((item) => ({ ...item, shortName: item.name.length > 18 ? `${item.name.slice(0, 17)}…` : item.name }));

  return (
    <VStack align="stretch" gap={4}>
      <Grid templateColumns={{ base: "1fr", xl: "repeat(2, minmax(0, 1fr))" }} gap={4}>
        <AnalyticsPanel title="Projects created over time" description="New laboratory projects in the selected window.">
          {data.projectTrend.length ? <ChartFrame label="Projects created trend">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.projectTrend} margin={{ top: 16, right: 10, left: -20, bottom: 0 }}>
                <defs><linearGradient id="projectArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartColors.blue} stopOpacity={0.26}/><stop offset="95%" stopColor={chartColors.blue} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid stroke="var(--apple-border-soft)" vertical={false} />
                <XAxis dataKey="period" tickFormatter={(value) => formatPeriod(value, language)} tick={{ fill: "var(--apple-muted)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={28} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--apple-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <TrendTooltip language={language} />
                <Area type="monotone" dataKey="created" name="Projects created" stroke={chartColors.blue} strokeWidth={2.4} fill="url(#projectArea)" activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartFrame> : <ChartEmpty message={emptyMessage} />}
        </AnalyticsPanel>

        <AnalyticsPanel title="Findings submitted over time" description="Submission volume with severity mix.">
          {data.findingTrend.length ? <ChartFrame label="Findings submitted and severity trend">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.findingTrend} margin={{ top: 16, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--apple-border-soft)" vertical={false} />
                <XAxis dataKey="period" tickFormatter={(value) => formatPeriod(value, language)} tick={{ fill: "var(--apple-muted)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={28} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--apple-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <TrendTooltip language={language} /><Legend wrapperStyle={{ fontSize: 11 }} />
                {(["critical", "high", "medium", "low", "info"] as const).map((key) => <Area key={key} type="monotone" dataKey={key} stackId="severity" stroke={severityColors[key]} fill={severityColors[key]} fillOpacity={0.56} />)}
              </AreaChart>
            </ResponsiveContainer>
          </ChartFrame> : <ChartEmpty message={emptyMessage} />}
        </AnalyticsPanel>
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "minmax(0, .8fr) minmax(0, 1.2fr)" }} gap={4}>
        <AnalyticsPanel title="Findings by severity" description="Share of findings by normalized severity.">
          {data.severityDistribution.length ? <Grid templateColumns={{ base: "1fr", sm: "minmax(180px, .9fr) minmax(160px, 1fr)" }} alignItems="center" gap={2}>
            <Box h="250px" dir="ltr" role="img" aria-label="Finding severity donut chart">
              <ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip contentStyle={tooltipStyle} /><Pie data={data.severityDistribution} dataKey="value" nameKey="key" innerRadius="62%" outerRadius="84%" paddingAngle={2} stroke="var(--apple-surface)">
                {data.severityDistribution.map((item) => <Cell key={item.key} fill={severityColors[item.key] || chartColors.info} />)}
              </Pie><text x="50%" y="47%" textAnchor="middle" fill="var(--apple-text)" fontSize="25" fontWeight="800">{totalSeverity}</text><text x="50%" y="58%" textAnchor="middle" fill="var(--apple-muted)" fontSize="11">Total findings</text></PieChart></ResponsiveContainer>
            </Box><DistributionList data={data.severityDistribution} total={totalSeverity} />
          </Grid> : <ChartEmpty message={emptyMessage} />}
        </AnalyticsPanel>

        <AnalyticsPanel title="Finding lifecycle" description="Actual review states stored by the platform.">
          {findingStatusData.length ? <ChartFrame label="Finding lifecycle status distribution"><ResponsiveContainer width="100%" height="100%"><BarChart data={findingStatusData} layout="vertical" margin={{ top: 10, right: 20, left: 16, bottom: 0 }}>
            <CartesianGrid stroke="var(--apple-border-soft)" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={{ fill: "var(--apple-muted)", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="key" width={115} tickFormatter={humanize} tick={{ fill: "var(--apple-muted)", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, "Findings"]} /><Bar dataKey="value" fill={chartColors.cyan} radius={[0, 5, 5, 0]} maxBarSize={22} /></BarChart></ResponsiveContainer></ChartFrame> : <ChartEmpty message={emptyMessage} />}
        </AnalyticsPanel>
      </Grid>

      <Grid templateColumns={{ base: "1fr", xl: "repeat(2, minmax(0, 1fr))" }} gap={4}>
        <AnalyticsPanel title="Project throughput" description="Projects created versus completed.">
          {data.completionTrend.length ? <ChartFrame label="Created versus completed projects"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.completionTrend} margin={{ top: 16, right: 10, left: -20 }}><CartesianGrid stroke="var(--apple-border-soft)" vertical={false} /><XAxis dataKey="period" tickFormatter={(value) => formatPeriod(value, language)} tick={{ fill: "var(--apple-muted)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={28} /><YAxis allowDecimals={false} tick={{ fill: "var(--apple-muted)", fontSize: 11 }} axisLine={false} tickLine={false} /><TrendTooltip language={language} /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="created" stroke={chartColors.blue} strokeWidth={2.4} dot={false} /><Line type="monotone" dataKey="completed" stroke={chartColors.success} strokeWidth={2.4} dot={false} /></LineChart></ResponsiveContainer></ChartFrame> : <ChartEmpty message={emptyMessage} />}
        </AnalyticsPanel>
        <AnalyticsPanel title="Opened vs closed findings" description="Security intake and closure throughput.">
          {data.closureTrend.length ? <ChartFrame label="Opened versus closed findings"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.closureTrend} margin={{ top: 16, right: 10, left: -20 }}><CartesianGrid stroke="var(--apple-border-soft)" vertical={false} /><XAxis dataKey="period" tickFormatter={(value) => formatPeriod(value, language)} tick={{ fill: "var(--apple-muted)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={28} /><YAxis allowDecimals={false} tick={{ fill: "var(--apple-muted)", fontSize: 11 }} axisLine={false} tickLine={false} /><TrendTooltip language={language} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="opened" fill={chartColors.high} radius={[4,4,0,0]} /><Bar dataKey="closed" fill={chartColors.success} radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></ChartFrame> : <ChartEmpty message={emptyMessage} />}
        </AnalyticsPanel>
      </Grid>

      <Grid templateColumns={{ base: "1fr", xl: "1.35fr .65fr" }} gap={4}>
        <AnalyticsPanel title="Most vulnerable projects" description={`Severity-weighted risk · ${data.meta.riskFormula}`}>
          {projectRisk.length ? <ChartFrame label="Projects ranked by severity weighted risk"><ResponsiveContainer width="100%" height="100%"><BarChart data={projectRisk} layout="vertical" margin={{ top: 10, right: 24, left: 35 }}><CartesianGrid stroke="var(--apple-border-soft)" horizontal={false} /><XAxis type="number" tick={{ fill: "var(--apple-muted)", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="shortName" width={110} tick={{ fill: "var(--apple-muted)", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="riskScore" name="Risk score" fill={chartColors.critical} radius={[0,5,5,0]} maxBarSize={20} /></BarChart></ResponsiveContainer></ChartFrame> : <ChartEmpty message={emptyMessage} />}
        </AnalyticsPanel>
        <AnalyticsPanel title="Project status" description="Current stage distribution for projects created in-range.">
          {data.projectStatusDistribution.length ? <><Box h="225px" dir="ltr" role="img" aria-label="Project status donut chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip contentStyle={tooltipStyle} /><Pie data={data.projectStatusDistribution} dataKey="value" nameKey="key" innerRadius="55%" outerRadius="82%" paddingAngle={2} stroke="var(--apple-surface)">{data.projectStatusDistribution.map((item, index) => <Cell key={item.key} fill={Object.values(chartColors)[index % Object.values(chartColors).length]} />)}</Pie></PieChart></ResponsiveContainer></Box><DistributionList data={data.projectStatusDistribution} total={data.projectStatusDistribution.reduce((sum, item) => sum + item.value, 0)} /></> : <ChartEmpty message={emptyMessage} />}
        </AnalyticsPanel>
      </Grid>

      <AnalyticsPanel title="Top security categories" description="Based on the stored OWASP category field; no inferred categories.">
        {data.categories.length ? <Box h="240px" dir="ltr" role="img" aria-label="Top security finding categories"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.categories} margin={{ top: 12, right: 12, left: -15, bottom: 36 }}><CartesianGrid stroke="var(--apple-border-soft)" vertical={false} /><XAxis dataKey="key" angle={-18} textAnchor="end" interval={0} tick={{ fill: "var(--apple-muted)", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "var(--apple-muted)", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="value" name="Findings" fill={chartColors.blue} radius={[5,5,0,0]} maxBarSize={44} /></BarChart></ResponsiveContainer></Box> : <ChartEmpty message={emptyMessage} />}
      </AnalyticsPanel>
    </VStack>
  );
}
