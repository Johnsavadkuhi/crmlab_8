import type { ReactNode } from "react";
import { Box, Heading, HStack, Text } from "@chakra-ui/react";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPanel({
  title,
  description,
  action,
  children,
  minH,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  minH?: string;
}) {
  return (
    <Box
      as="section"
      bg="var(--apple-surface-raised)"
      border="1px solid"
      borderColor="var(--apple-border-soft)"
      borderRadius="xl"
      minH={minH}
      overflow="hidden"
      boxShadow="0 1px 2px rgba(0,0,0,.035)"
    >
      <HStack
        justify="space-between"
        align="start"
        gap={4}
        px={{ base: 4, md: 5 }}
        pt={{ base: 4, md: 5 }}
        pb={3}
      >
        <HStack align="start" gap={3} minW={0}>
          <Box color="var(--apple-blue)" mt="2px" flex="none" aria-hidden>
            <BarChart3 size={17} strokeWidth={2.1} />
          </Box>
          <Box minW={0}>
            <Heading as="h2" size="sm" color="var(--apple-text)" fontWeight="850">
              {title}
            </Heading>
            {description && (
              <Text mt={1} color="var(--apple-muted)" fontSize="xs" lineHeight="1.55">
                {description}
              </Text>
            )}
          </Box>
        </HStack>
        {action}
      </HStack>
      <Box px={{ base: 3, md: 4 }} pb={{ base: 4, md: 5 }}>
        {children}
      </Box>
    </Box>
  );
}
