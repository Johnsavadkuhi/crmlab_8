import { Box, HStack, SimpleGrid, Skeleton, Text, VStack } from "@chakra-ui/react";
import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  Laptop,
  PackageCheck,
  UserCheck,
} from "lucide-react";
import type { AssetSummary } from "../model/types";

const cards = (summary: AssetSummary, language: "en" | "fa", personalized: boolean) => [
  {
    label: personalized
      ? language === "fa"
        ? "دارایی‌های من"
        : "My assets"
      : language === "fa"
        ? "کل دارایی‌ها"
        : "Total assets",
    value: summary.total,
    icon: Boxes,
    color: "var(--apple-blue)",
  },
  {
    label: language === "fa" ? "دارایی‌های شخصی" : "Personal assets",
    value: summary.owned,
    icon: PackageCheck,
    color: "var(--analytics-success)",
  },
  {
    label: language === "fa" ? "دارایی‌های تخصیص‌یافته" : "Assigned assets",
    value: summary.assigned,
    icon: UserCheck,
    color: "var(--analytics-cyan)",
  },
  {
    label: language === "fa" ? "سخت‌افزار / نرم‌افزار" : "Hardware / software",
    value: `${summary.byType.hardware || 0} / ${summary.byType.software || 0}`,
    icon: Laptop,
    color: "#7c3aed",
  },
  {
    label: language === "fa" ? "هشدارهای چرخه عمر" : "Lifecycle alerts",
    value: Object.values(summary.lifecycle).reduce((sum, value) => sum + value, 0),
    icon: AlertTriangle,
    color: "var(--analytics-high)",
  },
  ...(summary.totalCost === undefined
    ? []
    : [
        {
          label: language === "fa" ? "ارزش ثبت‌شده" : "Recorded value",
          value: summary.totalCost.toLocaleString(),
          icon: CircleDollarSign,
          color: "var(--analytics-low)",
        },
      ]),
];

export default function InventoryAnalytics({
  summary,
  loading = false,
  compact = false,
  personalized = false,
  language,
}: {
  summary?: AssetSummary;
  loading?: boolean;
  compact?: boolean;
  personalized?: boolean;
  language: "en" | "fa";
}) {
  if (loading)
    return (
      <SimpleGrid columns={{ base: 2, lg: compact ? 3 : 6 }} gap={3}>
        {Array.from({ length: compact ? 3 : 6 }, (_, index) => (
          <Skeleton key={index} h="94px" borderRadius="md" />
        ))}
      </SimpleGrid>
    );
  if (!summary) return null;
  const items = cards(summary, language, personalized).slice(0, compact ? 3 : 6);
  return (
    <SimpleGrid columns={{ base: 2, md: 3, xl: items.length }} gap={3}>
      {items.map(({ label, value, icon: Icon, color }) => (
        <Box
          key={label}
          p={4}
          bg="var(--apple-surface-raised)"
          border="1px solid"
          borderColor="var(--apple-border-soft)"
          borderRadius="md"
        >
          <HStack align="start" justify="space-between">
            <VStack align="start" gap={1}>
              <Text color="var(--apple-muted)" fontSize="xs" fontWeight="800">
                {label}
              </Text>
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" dir="ltr">
                {value}
              </Text>
            </VStack>
            <Box color={color}>
              <Icon size={19} />
            </Box>
          </HStack>
        </Box>
      ))}
    </SimpleGrid>
  );
}
