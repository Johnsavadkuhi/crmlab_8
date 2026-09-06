export type PersonalProject = {
  id: string;
  name: string;
  type?: string;
  status?: string;
  provisioningStatus?: string;
  deadline?: string;
  updatedAt?: string;
  environmentConfigured?: boolean;
  testerCount?: number;
};

export type PersonalTask = {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  deadline?: string;
};

export type PersonalActivity = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  projectId?: string;
  createdAt: string;
};

export type BaseDashboardData = {
  summary: { assignedProjects: number; openTasks: number; upcomingDeadlines: number };
  projects: PersonalProject[];
  tasks: PersonalTask[];
  upcomingDeadlines: PersonalProject[];
  recentActivity: PersonalActivity[];
};

export type TestingDashboardData = {
  summary: {
    total: number;
    critical: number;
    high: number;
    revisionRequired: number;
    verified: number;
  };
  severity: Array<{ key: string; value: number }>;
  status: Array<{ key: string; value: number }>;
  categories: Array<{ key: string; value: number }>;
  trend: Array<{ period: string; value: number }>;
  recentFindings: Array<{
    id: string;
    title?: string;
    severity?: string;
    state?: string;
    projectId: string;
    projectName?: string;
    createdAt?: string;
  }>;
  projects: PersonalProject[];
};

export type WorkDashboardData = {
  summary: {
    assignedProjects: number;
    activeProjects: number;
    pendingTasks: number;
    completedTasks: number;
  };
  projects: PersonalProject[];
  tasks: PersonalTask[];
  reviewMetricsAvailable: boolean;
  taskMetricsAvailable: boolean;
};

export type DevopsDashboardData = {
  summary: {
    assignedProjects: number;
    configuredEnvironments: number;
    pendingSetup: number;
    blocked: number;
    pendingTasks: number;
  };
  statusCounts: Record<string, number>;
  projects: PersonalProject[];
  tasks: PersonalTask[];
  taskMetricsAvailable: boolean;
};

export type SecurityDashboardData = {
  summary: {
    assignedProjects: number;
    activeProjects: number;
    projectsWithoutTesters: number;
  };
  projects: PersonalProject[];
  findings?: { total: number; critical: number; high: number };
};
