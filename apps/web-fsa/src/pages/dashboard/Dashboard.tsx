import { Box, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { ROLES } from "@/entities/permission/model/roles";
import { usePermission } from "@/features/access-control/model/usePermission";
import { useLanguage } from "@/features/language/model";
import {
  dashboardCategoryOrder,
  getAllowedDashboardWidgets,
  type DashboardWidgetCategory,
} from "@/widgets/dashboard/model/dashboardWidgetRegistry";
import {
  dashboardWidgetComponents,
  EmptyDashboardState,
} from "@/widgets/dashboard/ui/DashboardWidgets";
import PageHeader from "@/shared/ui/layout/PageHeader";
import { useAuth } from "@/features/auth/model/useAuth";
import AdminAnalyticsDashboard from "@/widgets/admin-dashboard/ui/AdminAnalyticsDashboard";
import AssetDashboardWidget from "@/widgets/inventory-dashboard/ui/AssetDashboardWidget";

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { permissions } = usePermission();
  const { roles } = useAuth();
  // Admin intentionally remains on the system-wide dashboard; every non-admin
  // branch below is composed exclusively from the user's effective permissions.
  if (roles.includes(ROLES.ADMIN)) return <AdminAnalyticsDashboard />;
  const visibleWidgets = getAllowedDashboardWidgets(permissions);
  const categoryLabels: Record<DashboardWidgetCategory, { en: string; fa: string }> = {
    "my-work": { en: "My work", fa: "کارهای من" },
    management: { en: "Technical management", fa: "مدیریت فنی" },
    testing: { en: "Security testing", fa: "آزمون امنیت" },
    "quality-assurance": { en: "Quality assurance", fa: "تضمین کیفیت" },
    "quality-control": { en: "Quality control", fa: "کنترل کیفیت" },
    devops: { en: "DevOps operations", fa: "عملیات DevOps" },
    customer: { en: "Customer workspace", fa: "فضای کاری مشتری" },
  };
  const sections = dashboardCategoryOrder
    .map((category) => ({
      category,
      widgets: visibleWidgets.filter((widget) => widget.category === category),
    }))
    .filter((section) => section.widgets.length > 0);

  return (
    <VStack align="stretch" gap={6}>
      <PageHeader
        eyebrow={t("dashboard.badge")}
        title={t("dashboard.title")}
        description={t("dashboard.description")}
        meta={
          <Text color="var(--apple-muted)" fontSize="sm" fontWeight="700">
            {t("dashboard.visibleWidgets", { count: visibleWidgets.length })}
          </Text>
        }
      />

      <AssetDashboardWidget />

      {visibleWidgets.length === 0 ? (
        <EmptyDashboardState />
      ) : (
        sections.map(({ category, widgets }) => (
          <Box as="section" key={category} aria-labelledby={`dashboard-${category}`}>
            <Text
              id={`dashboard-${category}`}
              mb={3}
              color="var(--apple-muted)"
              fontSize="xs"
              fontWeight="900"
              letterSpacing=".08em"
              textTransform="uppercase"
            >
              {categoryLabels[category][language === "fa" ? "fa" : "en"]}
            </Text>
            <SimpleGrid
              columns={{ base: 1, xl: widgets.length > 1 ? 2 : 1 }}
              gap={5}
              alignItems="stretch"
            >
              {widgets.map((widget) => {
                const Widget = dashboardWidgetComponents[widget.component];
                return <Widget key={widget.id} />;
              })}
            </SimpleGrid>
          </Box>
        ))
      )}
    </VStack>
  );
}
