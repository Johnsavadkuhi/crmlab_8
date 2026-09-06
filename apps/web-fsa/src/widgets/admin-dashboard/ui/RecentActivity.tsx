import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { Activity, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { AdminAnalytics } from "@/entities/admin-analytics/model/types";
import type { Language } from "@/features/language/model";
import EmptyState from "@/shared/ui/feedback/EmptyState";
import AnalyticsPanel from "./AnalyticsPanel";
import { formatDateTime, humanize } from "../lib/formatters";

export default function RecentActivity({ activity, language }: { activity: AdminAnalytics["recentActivity"]; language: Language }) {
  return (
    <AnalyticsPanel title="Recent lab activity" description="Latest successful, auditable events in the selected period.">
      {activity.length ? <VStack align="stretch" gap={0}>
        {activity.map((item, index) => {
          const path = item.project?.id ? `/projects/${item.project.id}` : undefined;
          return <HStack key={item.id} align="start" gap={3} py={3.5} borderBottom={index === activity.length - 1 ? "0" : "1px solid"} borderColor="var(--apple-border-soft)">
            <Box boxSize="30px" borderRadius="full" display="grid" placeItems="center" bg="var(--apple-blue-soft)" color="var(--apple-blue)" flex="none"><Activity size={14} /></Box>
            <Box minW={0} flex="1"><HStack gap={2} flexWrap="wrap"><Text fontSize="sm" fontWeight="850">{item.actor?.name || "System"}</Text><Text fontSize="sm" color="var(--apple-secondary)">{humanize(item.action)}</Text>{item.project && <Text fontSize="sm" color="var(--apple-blue)" fontWeight="750">{item.project.name}</Text>}</HStack><Text fontSize="xs" color="var(--apple-muted)" mt={1} dir="ltr" textAlign={language === "fa" ? "right" : "left"}>{formatDateTime(item.createdAt, language)}</Text></Box>
            {path && <Box asChild color="var(--apple-muted)" _hover={{ color: "var(--apple-blue)" }}><Link to={path} aria-label={`Open ${item.project?.name}`}><ArrowUpRight size={16} /></Link></Box>}
          </HStack>;
        })}
      </VStack> : <EmptyState title="No recent activity" description="Auditable project and finding events will appear here." />}
    </AnalyticsPanel>
  );
}
