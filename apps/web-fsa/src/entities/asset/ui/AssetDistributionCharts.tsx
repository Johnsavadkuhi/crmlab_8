import { Box, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import type { AssetSummary } from "../model/types";

function Distribution({
  title,
  values,
}: {
  title: string;
  values: Record<string, number>;
}) {
  const maximum = Math.max(1, ...Object.values(values));
  return (
    <Box
      p={4}
      bg="var(--apple-surface-raised)"
      border="1px solid"
      borderColor="var(--apple-border-soft)"
      borderRadius="md"
    >
      <Text fontWeight="900" mb={4}>
        {title}
      </Text>
      <VStack align="stretch" gap={3}>
        {Object.entries(values).length ? (
          Object.entries(values)
            .sort((a, b) => b[1] - a[1])
            .map(([label, value]) => (
              <Box key={label}>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="sm" textTransform="capitalize">
                    {label}
                  </Text>
                  <Text fontSize="sm" fontWeight="900">
                    {value}
                  </Text>
                </HStack>
                <Box
                  h="7px"
                  bg="var(--apple-surface-subtle)"
                  borderRadius="full"
                  overflow="hidden"
                >
                  <Box
                    h="full"
                    w={`${Math.max(5, (value / maximum) * 100)}%`}
                    bg="var(--apple-blue)"
                    borderRadius="full"
                  />
                </Box>
              </Box>
            ))
        ) : (
          <Text color="var(--apple-muted)" fontSize="sm">
            —
          </Text>
        )}
      </VStack>
    </Box>
  );
}

export default function AssetDistributionCharts({
  summary,
  language,
}: {
  summary: AssetSummary;
  language: "en" | "fa";
}) {
  const fa = language === "fa";
  return (
    <Grid
      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }}
      gap={3}
    >
      <Distribution
        title={fa ? "دارایی بر اساس مالکیت" : "Assets by ownership"}
        values={summary.byOwnerType}
      />
      <Distribution
        title={fa ? "دارایی بر اساس وضعیت" : "Assets by status"}
        values={summary.byStatus}
      />
      <Distribution
        title={fa ? "دارایی بر اساس دپارتمان" : "Assets by department"}
        values={summary.byDepartment}
      />
      <Distribution
        title={fa ? "دارایی بر اساس پلتفرم" : "Assets by platform"}
        values={summary.byPlatform}
      />
    </Grid>
  );
}
