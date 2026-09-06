export type AnalyticsGranularity = "day" | "week" | "month" | "quarter" | "year";

export type AnalyticsQuery = {
  from?: string;
  to?: string;
  granularity: AnalyticsGranularity;
  project?: string;
  tester?: string;
  severity?: "critical" | "high" | "medium" | "low" | "info";
  findingStatus?: string;
  projectStatus?: string;
};

export type AnalyticsKpiId =
  | "totalProjects"
  | "activeProjects"
  | "completedProjects"
  | "totalFindings"
  | "criticalFindings"
  | "highFindings"
  | "openFindings"
  | "closedFindings"
  | "activeTesters"
  | "averageFindingsPerProject"
  | "closureRate"
  | "mttr";

export type AnalyticsKpi = {
  id: AnalyticsKpiId;
  value: number | null;
  previous: number | null;
  changePercent: number | null;
  unit: "count" | "percent" | "hours";
};

export type TrendPoint = { period: string } & Record<string, number | string>;
export type DistributionPoint = { key: string; value: number };

export type TesterMetric = {
  id: string;
  name: string;
  username?: string;
  projects: number;
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  confirmed: number;
  rejected: number;
  averagePerProject: number;
  lastActivity?: string;
};

export type ProjectRiskMetric = {
  id: string;
  name: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  riskScore: number;
};

export type AdminAnalytics = {
  meta: {
    from: string;
    to: string;
    previousFrom: string;
    previousTo: string;
    granularity: AnalyticsGranularity;
    generatedAt: string;
    riskFormula: string;
    limitations: string[];
  };
  filters: {
    projects: Array<{ id: string; name: string }>;
    testers: Array<{ id: string; name: string }>;
    severities: string[];
    findingStatuses: string[];
    projectStatuses: string[];
  };
  kpis: AnalyticsKpi[];
  projectTrend: TrendPoint[];
  findingTrend: TrendPoint[];
  severityDistribution: DistributionPoint[];
  findingStatusDistribution: DistributionPoint[];
  projectStatusDistribution: DistributionPoint[];
  completionTrend: TrendPoint[];
  closureTrend: TrendPoint[];
  resolution: {
    mttrHours: number | null;
    bySeverity: Record<string, number>;
    sampleSize: number;
  };
  testerPerformance: TesterMetric[];
  projectRisk: ProjectRiskMetric[];
  testerProjectMatrix: Array<{
    testerId: string;
    testerName: string;
    projectId: string;
    projectName: string;
    findings: number;
    critical: number;
    high: number;
  }>;
  categories: DistributionPoint[];
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId?: string;
    actor?: { id: string; name: string };
    project?: { id: string; name: string };
    createdAt: string;
  }>;
};
