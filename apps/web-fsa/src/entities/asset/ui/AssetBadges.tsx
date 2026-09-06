import { Badge, HStack } from "@chakra-ui/react";
import type { AssetOwnerType, AssetStatus, AssetType } from "../model/types";

const labels = {
  en: {
    owner: { bank: "Bank", lab: "Laboratory", user: "Personal" },
    status: {
      available: "Available",
      "in-use": "In use",
      maintenance: "Maintenance",
      retired: "Retired",
      lost: "Lost",
    },
    type: { hardware: "Hardware", software: "Software" },
  },
  fa: {
    owner: { bank: "بانک", lab: "آزمایشگاه", user: "شخصی" },
    status: {
      available: "آماده",
      "in-use": "در حال استفاده",
      maintenance: "تعمیرات",
      retired: "از رده خارج",
      lost: "مفقود",
    },
    type: { hardware: "سخت‌افزار", software: "نرم‌افزار" },
  },
} as const;

export function OwnershipBadge({
  value,
  language,
}: {
  value: AssetOwnerType;
  language: "en" | "fa";
}) {
  return (
    <Badge
      colorPalette={value === "bank" ? "blue" : value === "lab" ? "purple" : "teal"}
      variant="subtle"
      borderRadius="full"
    >
      {labels[language].owner[value]}
    </Badge>
  );
}

export function StatusBadge({
  value,
  language,
}: {
  value?: AssetStatus;
  language: "en" | "fa";
}) {
  if (!value) return <Badge variant="outline">—</Badge>;
  const palette =
    value === "available"
      ? "green"
      : value === "in-use"
        ? "blue"
        : value === "maintenance"
          ? "orange"
          : value === "lost"
            ? "red"
            : "gray";
  return (
    <Badge colorPalette={palette} variant="subtle" borderRadius="full">
      {labels[language].status[value]}
    </Badge>
  );
}

export function AssetTypeBadge({
  value,
  language,
}: {
  value: AssetType;
  language: "en" | "fa";
}) {
  return (
    <Badge variant="outline" borderRadius="full">
      {labels[language].type[value]}
    </Badge>
  );
}

export function AssetBadges({
  ownerType,
  status,
  type,
  language,
}: {
  ownerType: AssetOwnerType;
  status?: AssetStatus;
  type: AssetType;
  language: "en" | "fa";
}) {
  return (
    <HStack gap={1.5} flexWrap="wrap">
      <OwnershipBadge value={ownerType} language={language} />
      <StatusBadge value={status} language={language} />
      <AssetTypeBadge value={type} language={language} />
    </HStack>
  );
}
