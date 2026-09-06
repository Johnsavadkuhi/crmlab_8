import { Box, HStack, NativeSelect, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import type { AdminAnalytics, AnalyticsGranularity, AnalyticsQuery } from "@/entities/admin-analytics/model/types";
import type { Language } from "@/features/language/model";
import Button from "@/shared/ui/primitives/Button";
import Input from "@/shared/ui/primitives/Input";
import { humanize } from "../lib/formatters";

export type DatePreset = "today" | "7d" | "30d" | "month" | "lastMonth" | "quarter" | "year" | "custom";

type Copy = {
  filters: string;
  period: string;
  from: string;
  to: string;
  project: string;
  tester: string;
  severity: string;
  findingStatus: string;
  projectStatus: string;
  granularity: string;
  all: string;
  reset: string;
  presets: Record<DatePreset, string>;
};

function SelectField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <VStack align="stretch" gap={1.5} minW={0}>
      <Text fontSize="xs" fontWeight="800" color="var(--apple-muted)">{label}</Text>
      {children}
    </VStack>
  );
}

export default function DashboardFilters({
  query,
  preset,
  options,
  language,
  copy,
  onQueryChange,
  onPresetChange,
  onReset,
}: {
  query: AnalyticsQuery;
  preset: DatePreset;
  options?: AdminAnalytics["filters"];
  language: Language;
  copy: Copy;
  onQueryChange: (patch: Partial<AnalyticsQuery>) => void;
  onPresetChange: (preset: DatePreset) => void;
  onReset: () => void;
}) {
  const selectStyles = {
    bg: "var(--apple-surface)",
    borderColor: "var(--apple-border)",
    color: "var(--apple-text)",
    fontSize: "sm",
  };
  return (
    <Box
      bg="var(--apple-surface-raised)"
      border="1px solid"
      borderColor="var(--apple-border-soft)"
      borderRadius="xl"
      p={{ base: 4, md: 5 }}
    >
      <HStack justify="space-between" mb={4} gap={3} flexWrap="wrap">
        <HStack gap={2}>
          <Box color="var(--apple-blue)" aria-hidden><SlidersHorizontal size={17} /></Box>
          <Text fontWeight="850" color="var(--apple-text)">{copy.filters}</Text>
        </HStack>
        <Button variant="ghost" size="sm" onClick={onReset} aria-label={copy.reset}>
          <HStack gap={1.5}><RotateCcw size={14} /><Text>{copy.reset}</Text></HStack>
        </Button>
      </HStack>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4, "2xl": 6 }} gap={3}>
        <SelectField label={copy.period}>
          <NativeSelect.Root>
            <NativeSelect.Field {...selectStyles} value={preset} onChange={(event) => onPresetChange(event.target.value as DatePreset)}>
              {(Object.keys(copy.presets) as DatePreset[]).map((value) => <option key={value} value={value}>{copy.presets[value]}</option>)}
            </NativeSelect.Field><NativeSelect.Indicator />
          </NativeSelect.Root>
        </SelectField>
        <SelectField label={copy.from}>
          <Input type="date" dir="ltr" value={query.from || ""} aria-label={copy.from} onChange={(event) => onQueryChange({ from: event.target.value })} />
        </SelectField>
        <SelectField label={copy.to}>
          <Input type="date" dir="ltr" value={query.to || ""} aria-label={copy.to} onChange={(event) => onQueryChange({ to: event.target.value })} />
        </SelectField>
        <SelectField label={copy.granularity}>
          <NativeSelect.Root><NativeSelect.Field {...selectStyles} value={query.granularity} onChange={(event) => onQueryChange({ granularity: event.target.value as AnalyticsGranularity })}>
            {(["day", "week", "month", "quarter", "year"] as const).map((value) => <option key={value} value={value}>{humanize(value)}</option>)}
          </NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root>
        </SelectField>
        <SelectField label={copy.project}>
          <NativeSelect.Root><NativeSelect.Field {...selectStyles} value={query.project || ""} onChange={(event) => onQueryChange({ project: event.target.value || undefined })}>
            <option value="">{copy.all}</option>{options?.projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root>
        </SelectField>
        <SelectField label={copy.tester}>
          <NativeSelect.Root><NativeSelect.Field {...selectStyles} value={query.tester || ""} onChange={(event) => onQueryChange({ tester: event.target.value || undefined })}>
            <option value="">{copy.all}</option>{options?.testers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root>
        </SelectField>
        <SelectField label={copy.severity}>
          <NativeSelect.Root><NativeSelect.Field {...selectStyles} value={query.severity || ""} onChange={(event) => onQueryChange({ severity: (event.target.value || undefined) as AnalyticsQuery["severity"] })}>
            <option value="">{copy.all}</option>{options?.severities.map((value) => <option key={value} value={value}>{humanize(value)}</option>)}
          </NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root>
        </SelectField>
        <SelectField label={copy.findingStatus}>
          <NativeSelect.Root><NativeSelect.Field {...selectStyles} value={query.findingStatus || ""} onChange={(event) => onQueryChange({ findingStatus: event.target.value || undefined })}>
            <option value="">{copy.all}</option>{options?.findingStatuses.map((value) => <option key={value} value={value}>{humanize(value)}</option>)}
          </NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root>
        </SelectField>
        <SelectField label={copy.projectStatus}>
          <NativeSelect.Root><NativeSelect.Field {...selectStyles} value={query.projectStatus || ""} onChange={(event) => onQueryChange({ projectStatus: event.target.value || undefined })}>
            <option value="">{copy.all}</option>{options?.projectStatuses.map((value) => <option key={value} value={value}>{humanize(value)}</option>)}
          </NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root>
        </SelectField>
      </SimpleGrid>
      <Text mt={3} fontSize="xs" color="var(--apple-muted)" dir="ltr" textAlign={language === "fa" ? "right" : "left"}>
        {query.from} → {query.to}
      </Text>
    </Box>
  );
}
