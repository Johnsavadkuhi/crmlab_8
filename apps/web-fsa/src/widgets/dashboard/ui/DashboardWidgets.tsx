import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Box,
  Grid,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  CalendarClock,
  ArrowUpRight,
  CheckCircle2,
  FolderKanban,
  History,
  Server,
  ShieldAlert,
} from "lucide-react";
import { PERMISSIONS } from "@/entities/permission/model/permissions";
import {
  useGetBaseDashboardQuery,
  useGetDevopsDashboardQuery,
  useGetQaDashboardQuery,
  useGetQualityDashboardQuery,
  useGetRepresentativeDashboardQuery,
  useGetSecurityDashboardQuery,
  useGetTestingDashboardQuery,
} from "@/entities/personal-dashboard/api/personalDashboardApi";
import type {
  PersonalActivity,
  PersonalProject,
  PersonalTask,
  WorkDashboardData,
} from "@/entities/personal-dashboard/model/types";
import { useLanguage } from "@/features/language/model";
import PermissionGate from "@/features/access-control/ui/PermissionGate";
import Button from "@/shared/ui/primitives/Button";
import EmptyState from "@/shared/ui/feedback/EmptyState";
import ErrorState from "@/shared/ui/feedback/ErrorState";
import type { DashboardWidgetId } from "@/widgets/dashboard/model/dashboardWidgetRegistry";

const chartTooltip = {
  background: "var(--apple-surface)",
  border: "1px solid var(--apple-border)",
  borderRadius: "8px",
  color: "var(--apple-text)",
};

function Frame({
  title,
  eyebrow,
  children,
  action,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Box
      bg="var(--apple-surface-raised)"
      border="1px solid"
      borderColor="var(--apple-border-soft)"
      borderRadius="xl"
      overflow="hidden"
    >
      <HStack
        justify="space-between"
        align="start"
        gap={3}
        px={{ base: 4, md: 5 }}
        pt={{ base: 4, md: 5 }}
        pb={4}
      >
        <Box>
          <Text
            color="var(--apple-blue)"
            fontSize="10px"
            fontWeight="900"
            letterSpacing=".09em"
            textTransform="uppercase"
          >
            {eyebrow}
          </Text>
          <Heading size="md" mt={1} fontWeight="880">
            {title}
          </Heading>
        </Box>
        {action}
      </HStack>
      <Box px={{ base: 4, md: 5 }} pb={{ base: 4, md: 5 }}>
        {children}
      </Box>
    </Box>
  );
}

function WidgetLoading() {
  return (
    <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap={3}>
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} h="92px" borderRadius="lg" />
      ))}
    </Grid>
  );
}

function Metric({
  label,
  value,
  tone = "blue",
}: {
  label: string;
  value: number | string;
  tone?: "blue" | "red" | "green" | "orange";
}) {
  const colors = {
    blue: "var(--apple-blue)",
    red: "var(--analytics-critical)",
    green: "var(--analytics-success)",
    orange: "var(--analytics-high)",
  };
  return (
    <Box
      p={3.5}
      bg="var(--apple-surface-subtle)"
      border="1px solid"
      borderColor="var(--apple-border-soft)"
      borderRadius="lg"
    >
      <Text fontSize="xs" color="var(--apple-muted)" fontWeight="750">
        {label}
      </Text>
      <Text mt={1} dir="ltr" fontSize="2xl" fontWeight="880" color={colors[tone]}>
        {value}
      </Text>
    </Box>
  );
}

function ProjectRows({
  projects,
  devops = false,
}: {
  projects: PersonalProject[];
  devops?: boolean;
}) {
  if (!projects.length)
    return (
      <Text color="var(--apple-muted)" fontSize="sm">
        No assigned projects.
      </Text>
    );
  return (
    <VStack align="stretch" gap={0}>
      {projects.slice(0, 6).map((project, index) => (
        <HStack
          key={project.id}
          py={3}
          borderBottom={index === Math.min(projects.length, 6) - 1 ? "0" : "1px solid"}
          borderColor="var(--apple-border-soft)"
          gap={3}
        >
          <Box
            boxSize="30px"
            borderRadius="md"
            display="grid"
            placeItems="center"
            bg="var(--apple-blue-soft)"
            color="var(--apple-blue)"
          >
            {devops ? <Server size={14} /> : <FolderKanban size={14} />}
          </Box>
          <Box flex="1" minW={0}>
            <Text fontSize="sm" fontWeight="820" lineClamp={1}>
              {project.name}
            </Text>
            <Text fontSize="xs" color="var(--apple-muted)">
              {project.provisioningStatus || project.status || "—"}
            </Text>
          </Box>
          {devops && (
            <Badge colorPalette={project.environmentConfigured ? "green" : "orange"}>
              {project.environmentConfigured ? "Configured" : "Setup"}
            </Badge>
          )}
          <Box asChild color="var(--apple-muted)" _hover={{ color: "var(--apple-blue)" }}>
            <Link to={`/projects/${project.id}`} aria-label={`Open ${project.name}`}>
              <ArrowUpRight size={15} />
            </Link>
          </Box>
        </HStack>
      ))}
    </VStack>
  );
}

function TaskRows({ tasks }: { tasks: PersonalTask[] }) {
  if (!tasks.length)
    return (
      <Text color="var(--apple-muted)" fontSize="sm">
        No current tasks.
      </Text>
    );
  return (
    <VStack align="stretch" gap={2}>
      {tasks.slice(0, 5).map((task) => (
        <HStack
          key={task.id}
          p={3}
          borderRadius="lg"
          bg="var(--apple-surface-subtle)"
          justify="space-between"
        >
          <HStack minW={0}>
            <CheckCircle2 size={14} color="var(--apple-muted)" />
            <Text fontSize="sm" fontWeight="750" lineClamp={1}>
              {task.title}
            </Text>
          </HStack>
          <Badge
            colorPalette={
              task.priority === "critical"
                ? "red"
                : task.priority === "high"
                  ? "orange"
                  : "gray"
            }
          >
            {task.status}
          </Badge>
          {task.deadline && (
            <Text dir="ltr" fontSize="xs" color="var(--apple-muted)">
              {new Date(task.deadline).toLocaleDateString()}
            </Text>
          )}
        </HStack>
      ))}
    </VStack>
  );
}

function DeadlineRows({ projects }: { projects: PersonalProject[] }) {
  if (!projects.length)
    return (
      <Text color="var(--apple-muted)" fontSize="sm">
        No deadlines in the next 14 days.
      </Text>
    );
  return (
    <VStack align="stretch" gap={2}>
      {projects.slice(0, 5).map((project) => (
        <HStack key={project.id} p={3} bg="var(--apple-surface-subtle)" borderRadius="lg">
          <CalendarClock size={15} color="var(--analytics-high)" />
          <Text flex="1" minW={0} fontSize="sm" fontWeight="750" lineClamp={1}>
            {project.name}
          </Text>
          <Text dir="ltr" fontSize="xs" color="var(--apple-muted)">
            {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
}

function ActivityRows({ activity }: { activity: PersonalActivity[] }) {
  if (!activity.length)
    return (
      <Text color="var(--apple-muted)" fontSize="sm">
        No recent activity.
      </Text>
    );
  return (
    <VStack align="stretch" gap={2}>
      {activity.slice(0, 5).map((item) => (
        <HStack key={item.id} p={3} bg="var(--apple-surface-subtle)" borderRadius="lg">
          <History size={15} color="var(--apple-muted)" />
          <Box flex="1" minW={0}>
            <Text fontSize="sm" fontWeight="750" lineClamp={1}>
              {item.action}
            </Text>
            <Text fontSize="xs" color="var(--apple-muted)">
              {item.entityType}
            </Text>
          </Box>
          <Text dir="ltr" fontSize="xs" color="var(--apple-muted)">
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
}

function MyWorkWidget() {
  const { language } = useLanguage();
  const query = useGetBaseDashboardQuery();
  const fa = language === "fa";
  return (
    <Frame
      eyebrow={fa ? "کار من" : "Action required"}
      title={fa ? "فضای کاری شخصی" : "My work queue"}
      action={
        <Button asChild variant="secondary">
          <Link to="/tasks">{fa ? "همه وظایف" : "View tasks"}</Link>
        </Button>
      }
    >
      {query.isLoading ? (
        <WidgetLoading />
      ) : query.error ? (
        <VStack align="stretch">
          <ErrorState error={query.error} />
          <Button alignSelf="start" variant="secondary" onClick={() => query.refetch()}>
            Retry
          </Button>
        </VStack>
      ) : (
        query.data && (
          <VStack align="stretch" gap={5}>
            <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap={3}>
              <Metric
                label={fa ? "پروژه‌های تخصیص‌یافته" : "Assigned projects"}
                value={query.data.summary.assignedProjects}
              />
              <Metric
                label={fa ? "وظایف باز" : "Open tasks"}
                value={query.data.summary.openTasks}
                tone="orange"
              />
              <Metric
                label={fa ? "مهلت‌های نزدیک" : "Upcoming deadlines"}
                value={query.data.summary.upcomingDeadlines}
                tone="red"
              />
            </Grid>
            <Grid templateColumns={{ base: "1fr", lg: "1.1fr .9fr" }} gap={5}>
              <Box>
                <Text fontSize="xs" color="var(--apple-muted)" fontWeight="850" mb={2}>
                  {fa ? "پروژه‌های اخیر" : "RECENT PROJECTS"}
                </Text>
                <ProjectRows projects={query.data.projects} />
              </Box>
              <Box>
                <Text fontSize="xs" color="var(--apple-muted)" fontWeight="850" mb={2}>
                  {fa ? "اقدام لازم" : "ACTION REQUIRED"}
                </Text>
                <TaskRows
                  tasks={query.data.tasks.filter(
                    (task) => task.status !== "completed" && task.status !== "cancelled"
                  )}
                />
              </Box>
            </Grid>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5}>
              <Box>
                <Text fontSize="xs" color="var(--apple-muted)" fontWeight="850" mb={2}>
                  {fa ? "مهلت‌های ۱۴ روز آینده" : "UPCOMING DEADLINES"}
                </Text>
                <DeadlineRows projects={query.data.upcomingDeadlines} />
              </Box>
              <Box>
                <Text fontSize="xs" color="var(--apple-muted)" fontWeight="850" mb={2}>
                  {fa ? "فعالیت‌های اخیر من" : "MY RECENT ACTIVITY"}
                </Text>
                <ActivityRows activity={query.data.recentActivity} />
              </Box>
            </Grid>
          </VStack>
        )
      )}
    </Frame>
  );
}

function TestingInsightsWidget() {
  const { language } = useLanguage();
  const query = useGetTestingDashboardQuery();
  const fa = language === "fa";
  return (
    <Frame
      eyebrow={fa ? "آزمون امنیت" : "Security testing"}
      title={fa ? "یافته‌های من" : "My finding intelligence"}
      action={
        <PermissionGate permissions={[PERMISSIONS.PENTEST_VULNERABILITIES_CREATE]}>
          <Button asChild>
            <Link to="/projects">{fa ? "ثبت یافته" : "Submit finding"}</Link>
          </Button>
        </PermissionGate>
      }
    >
      {query.isLoading ? (
        <WidgetLoading />
      ) : query.error ? (
        <ErrorState error={query.error} />
      ) : (
        query.data && (
          <VStack align="stretch" gap={5}>
            <Grid
              templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }}
              gap={3}
            >
              <Metric label="Findings" value={query.data.summary.total} />
              <Metric label="Critical" value={query.data.summary.critical} tone="red" />
              <Metric label="High" value={query.data.summary.high} tone="orange" />
              <Metric label="Verified" value={query.data.summary.verified} tone="green" />
              <Metric
                label="Revision required"
                value={query.data.summary.revisionRequired}
                tone="orange"
              />
            </Grid>
            <Grid templateColumns={{ base: "1fr", lg: "1.1fr .9fr" }} gap={5}>
              <Box
                h="220px"
                dir="ltr"
                role="img"
                aria-label="My finding submission trend"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={query.data.trend}
                    margin={{ top: 12, right: 8, left: -28 }}
                  >
                    <defs>
                      <linearGradient id="myFindingArea" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--analytics-blue)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--analytics-blue)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="period"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      }
                      tick={{ fill: "var(--apple-muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={22}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "var(--apple-muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={chartTooltip} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--analytics-blue)"
                      fill="url(#myFindingArea)"
                      strokeWidth={2.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
              <VStack align="stretch" gap={2}>
                {query.data.severity.map((item) => (
                  <HStack
                    key={item.key}
                    justify="space-between"
                    p={3}
                    bg="var(--apple-surface-subtle)"
                    borderRadius="lg"
                  >
                    <HStack>
                      <ShieldAlert size={14} />
                      <Text fontSize="sm" fontWeight="750">
                        {item.key}
                      </Text>
                    </HStack>
                    <Text fontWeight="850">{item.value}</Text>
                  </HStack>
                ))}
              </VStack>
            </Grid>
            <Grid templateColumns={{ base: "1fr", lg: "1.1fr .9fr" }} gap={5}>
              <Box>
                <Text fontSize="xs" color="var(--apple-muted)" fontWeight="850" mb={2}>
                  {fa ? "یافته‌های اخیر من" : "MY RECENT FINDINGS"}
                </Text>
                {query.data.recentFindings.length ? (
                  <VStack align="stretch" gap={2}>
                    {query.data.recentFindings.slice(0, 5).map((finding) => (
                      <HStack
                        key={finding.id}
                        p={3}
                        bg="var(--apple-surface-subtle)"
                        borderRadius="lg"
                      >
                        <ShieldAlert size={15} color="var(--analytics-high)" />
                        <Box flex="1" minW={0}>
                          <Text fontSize="sm" fontWeight="780" lineClamp={1}>
                            {finding.title || "Finding"}
                          </Text>
                          <Text fontSize="xs" color="var(--apple-muted)" lineClamp={1}>
                            {finding.projectName || finding.state || "—"}
                          </Text>
                        </Box>
                        <Badge
                          colorPalette={
                            finding.severity === "critical"
                              ? "red"
                              : finding.severity === "high"
                                ? "orange"
                                : "gray"
                          }
                        >
                          {finding.severity}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                ) : (
                  <Text color="var(--apple-muted)" fontSize="sm">
                    No findings in your assigned scope.
                  </Text>
                )}
              </Box>
              <Box>
                <Text fontSize="xs" color="var(--apple-muted)" fontWeight="850" mb={2}>
                  {fa ? "دسته‌بندی‌های آزمون" : "TESTING CATEGORIES"}
                </Text>
                <VStack align="stretch" gap={2}>
                  {query.data.categories.slice(0, 6).map((item) => (
                    <HStack
                      key={item.key}
                      justify="space-between"
                      p={3}
                      bg="var(--apple-surface-subtle)"
                      borderRadius="lg"
                    >
                      <Text fontSize="sm" fontWeight="750" lineClamp={1}>
                        {item.key}
                      </Text>
                      <Text fontWeight="850">{item.value}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </Grid>
          </VStack>
        )
      )}
    </Frame>
  );
}

function WorkCapabilityView({
  data,
  flavor,
}: {
  data: WorkDashboardData;
  flavor: "qa" | "quality";
}) {
  const qa = flavor === "qa";
  return (
    <VStack align="stretch" gap={5}>
      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={3}>
        <Metric label="Assigned projects" value={data.summary.assignedProjects} />
        <Metric
          label="Active projects"
          value={data.summary.activeProjects}
          tone="green"
        />
        <Metric
          label="Pending actions"
          value={data.taskMetricsAvailable ? data.summary.pendingTasks : "—"}
          tone="orange"
        />
        <Metric
          label="Completed tasks"
          value={data.taskMetricsAvailable ? data.summary.completedTasks : "—"}
          tone="green"
        />
      </Grid>
      <Grid templateColumns={{ base: "1fr", lg: "1.1fr .9fr" }} gap={5}>
        <Box>
          <Text fontSize="xs" fontWeight="850" color="var(--apple-muted)" mb={2}>
            {qa ? "ASSIGNED QA PROJECTS" : "QUALITY PROJECTS"}
          </Text>
          <ProjectRows projects={data.projects} />
        </Box>
        <Box>
          <Text fontSize="xs" fontWeight="850" color="var(--apple-muted)" mb={2}>
            PENDING ACTIONS
          </Text>
          <TaskRows
            tasks={data.tasks.filter(
              (task) => task.status !== "completed" && task.status !== "cancelled"
            )}
          />
          {!data.taskMetricsAvailable && (
            <Text mt={3} fontSize="xs" color="var(--apple-muted)">
              Capability-specific tasks require a persisted task-to-project workflow.
            </Text>
          )}
          {!data.reviewMetricsAvailable && (
            <Text mt={3} fontSize="xs" color="var(--apple-muted)">
              Review decision metrics will activate when persistent review records are
              available.
            </Text>
          )}
        </Box>
      </Grid>
    </VStack>
  );
}

function QaWorkWidget() {
  const query = useGetQaDashboardQuery();
  return (
    <Frame
      eyebrow="Quality assurance"
      title="QA workspace"
      action={
        <PermissionGate permissions={[PERMISSIONS.QA_TEST_CASES_READ]}>
          <Button asChild variant="secondary">
            <Link to="/projects">Open QA projects</Link>
          </Button>
        </PermissionGate>
      }
    >
      {query.isLoading ? (
        <WidgetLoading />
      ) : query.error ? (
        <ErrorState error={query.error} />
      ) : (
        query.data && <WorkCapabilityView data={query.data} flavor="qa" />
      )}
    </Frame>
  );
}

function QualityControlWidget() {
  const query = useGetQualityDashboardQuery();
  return (
    <Frame
      eyebrow="Quality control"
      title="Quality oversight"
      action={
        <PermissionGate permissions={[PERMISSIONS.QUALITY_RESULTS_REVIEW]}>
          <Button asChild variant="secondary">
            <Link to="/projects">Open quality reviews</Link>
          </Button>
        </PermissionGate>
      }
    >
      {query.isLoading ? (
        <WidgetLoading />
      ) : query.error ? (
        <ErrorState error={query.error} />
      ) : (
        query.data && <WorkCapabilityView data={query.data} flavor="quality" />
      )}
    </Frame>
  );
}

function DevopsOperationsWidget() {
  const query = useGetDevopsDashboardQuery();
  return (
    <Frame
      eyebrow="DevOps"
      title="Environment operations"
      action={
        <PermissionGate permissions={[PERMISSIONS.DEVOPS_DEPLOYMENTS_READ]}>
          <Button asChild variant="secondary">
            <Link to="/devops">Open delivery</Link>
          </Button>
        </PermissionGate>
      }
    >
      {query.isLoading ? (
        <WidgetLoading />
      ) : query.error ? (
        <ErrorState error={query.error} />
      ) : (
        query.data && (
          <VStack align="stretch" gap={5}>
            <Grid
              templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }}
              gap={3}
            >
              <Metric label="Assigned" value={query.data.summary.assignedProjects} />
              <Metric
                label="Configured"
                value={query.data.summary.configuredEnvironments}
                tone="green"
              />
              <Metric
                label="Pending setup"
                value={query.data.summary.pendingSetup}
                tone="orange"
              />
              <Metric label="Blocked" value={query.data.summary.blocked} tone="red" />
              <Metric
                label="Tasks"
                value={
                  query.data.taskMetricsAvailable ? query.data.summary.pendingTasks : "—"
                }
              />
            </Grid>
            <Grid templateColumns={{ base: "1fr", lg: "1.2fr .8fr" }} gap={5}>
              <Box>
                <Text fontSize="xs" fontWeight="850" color="var(--apple-muted)" mb={2}>
                  INFRASTRUCTURE STATUS
                </Text>
                <ProjectRows projects={query.data.projects} devops />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="850" color="var(--apple-muted)" mb={2}>
                  OPERATIONAL TASKS
                </Text>
                <TaskRows tasks={query.data.tasks} />
                {!query.data.taskMetricsAvailable && (
                  <Text mt={3} fontSize="xs" color="var(--apple-muted)">
                    DevOps task metrics will activate after tasks are linked to projects.
                  </Text>
                )}
              </Box>
            </Grid>
          </VStack>
        )
      )}
    </Frame>
  );
}

function TechnicalManagementWidget() {
  const query = useGetSecurityDashboardQuery();
  return (
    <Frame
      eyebrow="Technical management"
      title="Assigned security portfolio"
      action={
        <PermissionGate permissions={[PERMISSIONS.SECURITY_PROJECTS_ASSIGN]}>
          <Button asChild variant="secondary">
            <Link to="/projects">Manage allocation</Link>
          </Button>
        </PermissionGate>
      }
    >
      {query.isLoading ? (
        <WidgetLoading />
      ) : query.error ? (
        <ErrorState error={query.error} />
      ) : (
        query.data && (
          <VStack align="stretch" gap={5}>
            <Grid
              templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
              gap={3}
            >
              <Metric
                label="Managed projects"
                value={query.data.summary.assignedProjects}
              />
              <Metric
                label="Active"
                value={query.data.summary.activeProjects}
                tone="green"
              />
              <Metric
                label="Need tester allocation"
                value={query.data.summary.projectsWithoutTesters}
                tone="orange"
              />
              {query.data.findings && (
                <>
                  <Metric label="Scoped findings" value={query.data.findings.total} />
                  <Metric
                    label="Critical"
                    value={query.data.findings.critical}
                    tone="red"
                  />
                  <Metric label="High" value={query.data.findings.high} tone="orange" />
                </>
              )}
            </Grid>
            <ProjectRows projects={query.data.projects} />
          </VStack>
        )
      )}
    </Frame>
  );
}

function RepresentativeWorkWidget() {
  const query = useGetRepresentativeDashboardQuery();
  return (
    <Frame
      eyebrow="Customer workspace"
      title="My customer projects"
      action={
        <PermissionGate permissions={[PERMISSIONS.REPRESENTATIVE_TICKETS_CREATE]}>
          <Button asChild>
            <Link to="/projects">Open projects</Link>
          </Button>
        </PermissionGate>
      }
    >
      {query.isLoading ? (
        <WidgetLoading />
      ) : query.error ? (
        <ErrorState error={query.error} />
      ) : query.data ? (
        <ProjectRows projects={query.data.projects} />
      ) : null}
    </Frame>
  );
}

export const dashboardWidgetComponents: Record<DashboardWidgetId, ComponentType> = {
  "my-work": MyWorkWidget,
  "testing-insights": TestingInsightsWidget,
  "qa-work": QaWorkWidget,
  "quality-control": QualityControlWidget,
  "devops-operations": DevopsOperationsWidget,
  "technical-management": TechnicalManagementWidget,
  "representative-work": RepresentativeWorkWidget,
};

export function EmptyDashboardState() {
  const { t } = useLanguage();
  return (
    <EmptyState
      title={t("dashboard.emptyTitle")}
      description={t("dashboard.emptyDescription")}
    />
  );
}
