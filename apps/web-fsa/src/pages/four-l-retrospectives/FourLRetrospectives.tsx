import { Link, useParams } from "react-router-dom";
import { Badge, Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { FOUR_L_STATUSES, type FourLStatus } from "@role-dashboard/contracts";
import {
  useGetFourLRetrospectiveQuery,
  useGetFourLRetrospectivesQuery,
} from "@/entities/retrospective/api/fourLApi";
import FourLForm from "@/entities/retrospective/ui/FourLForm";
import { useLanguage } from "@/features/language/model";
import EmptyState from "@/shared/ui/feedback/EmptyState";
import ErrorState from "@/shared/ui/feedback/ErrorState";
import LoadingScreen from "@/shared/ui/feedback/LoadingScreen";
import PageHeader from "@/shared/ui/layout/PageHeader";

const statusCopy: Record<
  "fa" | "en",
  Record<FourLStatus, { label: string; bg: string; color: string }>
> = {
  fa: {
    draft: {
      label: "در انتظار ثبت",
      bg: "var(--apple-warning-bg)",
      color: "var(--apple-warning-text)",
    },
    submitted_to_representative: {
      label: "در انتظار بازبینی",
      bg: "var(--apple-blue-soft)",
      color: "var(--apple-blue)",
    },
    changes_requested: {
      label: "نیازمند اصلاح",
      bg: "var(--apple-danger-bg)",
      color: "var(--apple-danger-text)",
    },
    representative_approved: {
      label: "تأیید نماینده",
      bg: "var(--apple-success-bg)",
      color: "var(--apple-success-text)",
    },
    sent_to_admin: {
      label: "ارسال‌شده برای ادمین",
      bg: "var(--apple-success-bg)",
      color: "var(--apple-success-text)",
    },
  },
  en: {
    draft: {
      label: "Awaiting submission",
      bg: "var(--apple-warning-bg)",
      color: "var(--apple-warning-text)",
    },
    submitted_to_representative: {
      label: "Awaiting review",
      bg: "var(--apple-blue-soft)",
      color: "var(--apple-blue)",
    },
    changes_requested: {
      label: "Changes requested",
      bg: "var(--apple-danger-bg)",
      color: "var(--apple-danger-text)",
    },
    representative_approved: {
      label: "Representative approved",
      bg: "var(--apple-success-bg)",
      color: "var(--apple-success-text)",
    },
    sent_to_admin: {
      label: "Sent to Admin",
      bg: "var(--apple-success-bg)",
      color: "var(--apple-success-text)",
    },
  },
};

function formatDate(value: string, language: "fa" | "en") {
  return new Intl.DateTimeFormat(language === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function FourLRetrospectives() {
  const { retrospectiveId } = useParams<{ retrospectiveId?: string }>();
  const { language } = useLanguage();
  const listQuery = useGetFourLRetrospectivesQuery(undefined, {
    skip: Boolean(retrospectiveId),
  });
  const itemQuery = useGetFourLRetrospectiveQuery(retrospectiveId || "", {
    skip: !retrospectiveId,
  });

  if (retrospectiveId) {
    if (itemQuery.isLoading || (itemQuery.isFetching && !itemQuery.currentData)) {
      return (
        <LoadingScreen
          text={
            language === "fa" ? "در حال بارگذاری فرم 4L…" : "Loading 4L retrospective…"
          }
        />
      );
    }
    if (itemQuery.error || !itemQuery.currentData) {
      return (
        <ErrorState error={itemQuery.error || new Error("4L retrospective not found")} />
      );
    }
    return (
      <FourLForm
        key={`${itemQuery.currentData.id}:${itemQuery.currentData.status}`}
        item={itemQuery.currentData}
      />
    );
  }

  if (listQuery.isLoading) {
    return (
      <LoadingScreen
        text={
          language === "fa" ? "در حال بارگذاری بازبینی‌ها…" : "Loading retrospectives…"
        }
      />
    );
  }
  if (listQuery.error) return <ErrorState error={listQuery.error} />;

  const items = listQuery.data || [];
  const pendingCount = items.filter((item) =>
    [
      FOUR_L_STATUSES.DRAFT,
      FOUR_L_STATUSES.CHANGES_REQUESTED,
      FOUR_L_STATUSES.SUBMITTED,
      FOUR_L_STATUSES.APPROVED,
    ].includes(item.status as typeof FOUR_L_STATUSES.DRAFT)
  ).length;

  return (
    <VStack align="stretch" gap={5}>
      <PageHeader
        eyebrow={
          language === "fa"
            ? `${pendingCount} مورد نیازمند اقدام`
            : `${pendingCount} items need action`
        }
        title={language === "fa" ? "بازبینی‌های 4L" : "4L Retrospectives"}
        description={
          language === "fa"
            ? "یادگیری‌های پروژه را ثبت، بازبینی و برای تصمیم‌گیری آینده آماده کنید."
            : "Capture project learning, complete reviews, and prepare insights for future decisions."
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title={language === "fa" ? "فرم 4L موجود نیست" : "No 4L retrospectives"}
          description={
            language === "fa"
              ? "پس از بسته‌شدن پروژه امنیتی، فرم مربوطه اینجا نمایش داده می‌شود."
              : "A form will appear here after an assigned security project closes."
          }
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
          {items.map((item) => {
            const status = statusCopy[language][item.status];
            return (
              <Box
                key={item.id}
                asChild
                border="1px solid"
                borderColor="var(--apple-border)"
                borderRadius="xl"
                bg="var(--apple-surface-raised)"
                boxShadow="var(--surface-shadow)"
                transition="transform 140ms ease, box-shadow 140ms ease"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 28px rgba(0,0,0,.1)",
                }}
              >
                <Link to={`/retrospectives/4l/${item.id}`}>
                  <VStack align="stretch" gap={3} p={5}>
                    <HStack justify="space-between" align="start" gap={3}>
                      <Box minW={0}>
                        <Text fontSize="lg" fontWeight="950" lineClamp={1}>
                          {item.project.name}
                        </Text>
                        <Text color="var(--apple-muted)" fontSize="xs">
                          {item.project.letterNumber || item.project.id}
                        </Text>
                      </Box>
                      <Badge
                        bg={status.bg}
                        color={status.color}
                        borderRadius="full"
                        px={2.5}
                        py={1}
                        textTransform="none"
                        flexShrink={0}
                      >
                        {status.label}
                      </Badge>
                    </HStack>
                    <Box h="1px" bg="var(--apple-border-soft)" />
                    <SimpleGrid columns={2} gap={2}>
                      <Box>
                        <Text color="var(--apple-muted)" fontSize="xs">
                          {language === "fa" ? "آزمونگر" : "Pentester"}
                        </Text>
                        <Text fontWeight="800" lineClamp={1}>
                          {item.pentester.name}
                        </Text>
                      </Box>
                      <Box>
                        <Text color="var(--apple-muted)" fontSize="xs">
                          {language === "fa" ? "بسته‌شدن پروژه" : "Project closed"}
                        </Text>
                        <Text fontWeight="800">
                          {formatDate(item.project.closedAt || item.createdAt, language)}
                        </Text>
                      </Box>
                    </SimpleGrid>
                    <Text color="var(--apple-blue)" fontWeight="850" fontSize="sm">
                      {language === "fa" ? "مشاهده و ادامه ←" : "Open and continue →"}
                    </Text>
                  </VStack>
                </Link>
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </VStack>
  );
}
