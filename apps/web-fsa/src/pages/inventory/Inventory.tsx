import {
  Box,
  HStack,
  NativeSelect,
  SimpleGrid,
  Skeleton,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FilterX, PackagePlus, RefreshCw, Search } from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { PERMISSIONS } from "@/entities/permission/model/permissions";
import { usePermission } from "@/features/access-control/model/usePermission";
import { useAuth } from "@/features/auth/model/useAuth";
import { useLanguage } from "@/features/language/model";
import { useGetUsersQuery } from "@/entities/user/api/usersApi";
import {
  useGetAssetsQuery,
  useGetAssetSummaryQuery,
} from "@/entities/asset/api/assetsApi";
import type { Asset, AssetFilters } from "@/entities/asset/model/types";
import { AssetBadges } from "@/entities/asset/ui/AssetBadges";
import AssetDetailsDialog from "@/entities/asset/ui/AssetDetailsDialog";
import AssetFormDialog from "@/entities/asset/ui/AssetFormDialog";
import InventoryAnalytics from "@/entities/asset/ui/InventoryAnalytics";
import AssetDistributionCharts from "@/entities/asset/ui/AssetDistributionCharts";
import Button from "@/shared/ui/primitives/Button";
import Card from "@/shared/ui/primitives/Card";
import Input from "@/shared/ui/primitives/Input";
import EmptyState from "@/shared/ui/feedback/EmptyState";
import ErrorState from "@/shared/ui/feedback/ErrorState";
import PageHeader from "@/shared/ui/layout/PageHeader";

const copy = {
  en: {
    eyebrow: "Inventory · Asset intelligence",
    title: "Asset & inventory management",
    description:
      "A secure, lifecycle-aware register for bank, laboratory and personal assets.",
    add: "Register asset",
    search: "Search assets",
    searchPlaceholder: "Name, model, vendor, tags…",
    all: "All assets",
    owned: "Owned by me",
    assigned: "Assigned to me",
    bank: "Bank assets",
    lab: "Laboratory assets",
    users: "User-owned",
    type: "Type",
    ownership: "Ownership",
    status: "Status",
    department: "Department",
    platform: "Platform",
    sort: "Sort",
    apply: "Apply",
    clear: "Clear filters",
    results: "assets",
    name: "Asset",
    owner: "Owner / assignee",
    scope: "Scope",
    updated: "Updated",
    actions: "Actions",
    view: "View",
    edit: "Edit",
    previous: "Previous",
    next: "Next",
    empty: "No assets found",
    emptyDescription: "Register an asset or adjust the filters.",
    error: "Inventory could not be loaded",
    allOption: "All",
    page: "Page",
  },
  fa: {
    eyebrow: "انبارداری · هوشمندی دارایی",
    title: "مدیریت دارایی‌ها و انبار",
    description: "رجیستری امن و چرخه‌عمرمحور برای دارایی‌های بانک، آزمایشگاه و کاربران.",
    add: "ثبت دارایی",
    search: "جست‌وجوی دارایی",
    searchPlaceholder: "نام، مدل، تأمین‌کننده، برچسب…",
    all: "همه دارایی‌ها",
    owned: "متعلق به من",
    assigned: "تخصیص‌یافته به من",
    bank: "دارایی بانک",
    lab: "دارایی آزمایشگاه",
    users: "دارایی کاربران",
    type: "نوع",
    ownership: "مالکیت",
    status: "وضعیت",
    department: "دپارتمان",
    platform: "پلتفرم",
    sort: "مرتب‌سازی",
    apply: "اعمال",
    clear: "پاک‌کردن فیلترها",
    results: "دارایی",
    name: "دارایی",
    owner: "مالک / استفاده‌کننده",
    scope: "دامنه",
    updated: "آخرین تغییر",
    actions: "عملیات",
    view: "مشاهده",
    edit: "ویرایش",
    previous: "قبلی",
    next: "بعدی",
    empty: "دارایی‌ای پیدا نشد",
    emptyDescription: "دارایی جدید ثبت کنید یا فیلترها را تغییر دهید.",
    error: "دریافت اطلاعات انبار ناموفق بود",
    allOption: "همه",
    page: "صفحه",
  },
} as const;

function person(
  value?: { firstName?: string; lastName?: string; username?: string } | null
) {
  return value
    ? `${value.firstName || ""} ${value.lastName || ""}`.trim() || value.username || "—"
    : "—";
}

function SelectFilter({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <Box>
      <Text mb={1.5} fontSize="sm" fontWeight="750">
        {label}
      </Text>
      <NativeSelect.Root>
        <NativeSelect.Field
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          bg="var(--apple-surface)"
          borderColor="var(--apple-border)"
        >
          {children}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Box>
  );
}

export default function Inventory() {
  const { language, dir } = useLanguage();
  const text = copy[language];
  const { user } = useAuth();
  const { hasAnyPermission } = usePermission();
  const canReadAll = hasAnyPermission([
    PERMISSIONS.ADMIN_SYSTEM_MANAGE,
    PERMISSIONS.ASSETS_READ_ALL,
    PERMISSIONS.ASSETS_MANAGE_ALL,
  ]);
  const canManageAll = hasAnyPermission([
    PERMISSIONS.ADMIN_SYSTEM_MANAGE,
    PERMISSIONS.ASSETS_UPDATE_ALL,
    PERMISSIONS.ASSETS_MANAGE_ALL,
  ]);
  const canReadUsers = hasAnyPermission([
    PERMISSIONS.ADMIN_SYSTEM_MANAGE,
    PERMISSIONS.ADMIN_USERS_READ,
  ]);
  const [query, setQuery] = useState<AssetFilters>({
    page: 1,
    pageSize: 20,
    view: canReadAll ? "all" : "owned",
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const [draftSearch, setDraftSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>();
  const [editingAsset, setEditingAsset] = useState<Asset>();
  const [formOpen, setFormOpen] = useState(false);
  const { data, isLoading, isFetching, error, refetch } = useGetAssetsQuery(query);
  const { data: summary, isLoading: summaryLoading } = useGetAssetSummaryQuery();
  const { data: users = [] } = useGetUsersQuery(undefined, { skip: !canReadUsers });
  const items = data?.items || [];
  const pageInfo = data?.pageInfo;
  const setFilter = <K extends keyof AssetFilters>(key: K, value: AssetFilters[K]) =>
    setQuery((current) => ({ ...current, [key]: value || undefined, page: 1 }));
  const hasFilters = useMemo(
    () =>
      Boolean(
        query.search ||
        query.type ||
        query.ownerType ||
        query.status ||
        query.department ||
        query.platform ||
        query.owner ||
        query.assignedTo ||
        query.brand ||
        query.vendor ||
        query.tag ||
        query.purchaseFrom ||
        query.purchaseTo ||
        query.warrantyExpiring ||
        query.licenseExpiring
      ),
    [query]
  );
  const openEdit = (asset: Asset) => {
    setSelectedId(undefined);
    setEditingAsset(asset);
    setFormOpen(true);
  };
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setFilter("search", draftSearch || undefined);
  };
  const reset = () => {
    setDraftSearch("");
    setQuery({
      page: 1,
      pageSize: 20,
      view: canReadAll ? "all" : "owned",
      sortBy: "updatedAt",
      sortOrder: "desc",
    });
  };

  const tabs = canReadAll
    ? [
        { label: text.all, query: { view: "all" as const, ownerType: undefined } },
        { label: text.bank, query: { view: "all" as const, ownerType: "bank" as const } },
        { label: text.lab, query: { view: "all" as const, ownerType: "lab" as const } },
        {
          label: text.users,
          query: { view: "all" as const, ownerType: "user" as const },
        },
        {
          label: text.assigned,
          query: { view: "assigned" as const, ownerType: undefined },
        },
      ]
    : [
        { label: text.owned, query: { view: "owned" as const, ownerType: undefined } },
        {
          label: text.assigned,
          query: { view: "assigned" as const, ownerType: undefined },
        },
      ];

  return (
    <VStack align="stretch" gap={5} maxW="1800px" mx="auto" dir={dir}>
      <PageHeader
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
        meta={
          <HStack>
            <Button
              variant="secondary"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="refresh"
            >
              <RefreshCw size={15} />
            </Button>
            <Button
              onClick={() => {
                setEditingAsset(undefined);
                setFormOpen(true);
              }}
            >
              <HStack>
                <PackagePlus size={16} />
                <Text>{text.add}</Text>
              </HStack>
            </Button>
          </HStack>
        }
      />
      <InventoryAnalytics
        summary={summary}
        loading={summaryLoading}
        personalized={!user?.roles?.includes("admin")}
        language={language}
      />
      {summary && <AssetDistributionCharts summary={summary} language={language} />}
      <Card>
        <VStack align="stretch" gap={4}>
          <HStack gap={2} overflowX="auto" pb={1}>
            {tabs.map((tab) => {
              const active =
                query.view === tab.query.view && query.ownerType === tab.query.ownerType;
              return (
                <Button
                  key={tab.label}
                  variant={active ? "primary" : "secondary"}
                  whiteSpace="nowrap"
                  onClick={() =>
                    setQuery((current) => ({ ...current, ...tab.query, page: 1 }))
                  }
                >
                  {tab.label}
                </Button>
              );
            })}
          </HStack>
          <Box as="form" onSubmit={submitSearch}>
            <HStack align="end">
              <Box flex="1">
                <Input
                  label={text.search}
                  value={draftSearch}
                  placeholder={text.searchPlaceholder}
                  onChange={(event) => setDraftSearch(event.target.value)}
                />
              </Box>
              <Button type="submit">
                <HStack>
                  <Search size={15} />
                  <Text>{text.apply}</Text>
                </HStack>
              </Button>
            </HStack>
          </Box>
          <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} gap={3}>
            <SelectFilter
              label={text.type}
              value={query.type}
              onChange={(value) => setFilter("type", value as AssetFilters["type"])}
            >
              <option value="">{text.allOption}</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
            </SelectFilter>
            {canReadAll && (
              <SelectFilter
                label={text.ownership}
                value={query.ownerType}
                onChange={(value) =>
                  setFilter("ownerType", value as AssetFilters["ownerType"])
                }
              >
                <option value="">{text.allOption}</option>
                <option value="bank">Bank</option>
                <option value="lab">Laboratory</option>
                <option value="user">Personal</option>
              </SelectFilter>
            )}
            <SelectFilter
              label={text.status}
              value={query.status}
              onChange={(value) => setFilter("status", value as AssetFilters["status"])}
            >
              <option value="">{text.allOption}</option>
              {["available", "in-use", "maintenance", "retired", "lost"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </SelectFilter>
            <SelectFilter
              label={text.department}
              value={query.department}
              onChange={(value) =>
                setFilter("department", value as AssetFilters["department"])
              }
            >
              <option value="">{text.allOption}</option>
              <option value="security">Security</option>
              <option value="quality">Quality</option>
            </SelectFilter>
            <SelectFilter
              label={text.platform}
              value={query.platform}
              onChange={(value) =>
                setFilter("platform", value as AssetFilters["platform"])
              }
            >
              <option value="">{text.allOption}</option>
              {["web", "mobile", "desktop", "api"].map((value) => (
                <option key={value} value={value}>
                  {value.toUpperCase()}
                </option>
              ))}
            </SelectFilter>
            <SelectFilter
              label={text.sort}
              value={`${query.sortBy}:${query.sortOrder}`}
              onChange={(value) => {
                const [sortBy, sortOrder] = value.split(":");
                setQuery((current) => ({
                  ...current,
                  sortBy: sortBy as AssetFilters["sortBy"],
                  sortOrder: sortOrder as AssetFilters["sortOrder"],
                  page: 1,
                }));
              }}
            >
              <option value="updatedAt:desc">Newest update</option>
              <option value="name:asc">Name A–Z</option>
              <option value="purchaseDate:desc">Purchase date</option>
              <option value="warrantyExpiry:asc">Warranty due</option>
              <option value="licenseExpiry:asc">License due</option>
              <option value="cost:desc">Highest cost</option>
            </SelectFilter>
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={3}>
            <Input
              label={language === "fa" ? "برند" : "Brand"}
              value={query.brand || ""}
              onChange={(event) => setFilter("brand", event.target.value || undefined)}
            />
            <Input
              label={language === "fa" ? "تأمین‌کننده" : "Vendor"}
              value={query.vendor || ""}
              onChange={(event) => setFilter("vendor", event.target.value || undefined)}
            />
            <Input
              label={language === "fa" ? "برچسب" : "Tag"}
              value={query.tag || ""}
              onChange={(event) => setFilter("tag", event.target.value || undefined)}
            />
            <Input
              type="date"
              label={language === "fa" ? "خرید از تاریخ" : "Purchased from"}
              value={query.purchaseFrom || ""}
              onChange={(event) =>
                setFilter("purchaseFrom", event.target.value || undefined)
              }
            />
            <Input
              type="date"
              label={language === "fa" ? "خرید تا تاریخ" : "Purchased to"}
              value={query.purchaseTo || ""}
              onChange={(event) =>
                setFilter("purchaseTo", event.target.value || undefined)
              }
            />
            {canReadAll && (
              <SelectFilter
                label={language === "fa" ? "مالک شخصی" : "Personal owner"}
                value={query.owner}
                onChange={(value) => setFilter("owner", value || undefined)}
              >
                <option value="">{text.allOption}</option>
                {users.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.firstName} {item.lastName}
                  </option>
                ))}
              </SelectFilter>
            )}
            {canReadAll && (
              <SelectFilter
                label={language === "fa" ? "کاربر تخصیص" : "Assigned user"}
                value={query.assignedTo}
                onChange={(value) => setFilter("assignedTo", value || undefined)}
              >
                <option value="">{text.allOption}</option>
                {users.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.firstName} {item.lastName}
                  </option>
                ))}
              </SelectFilter>
            )}
          </SimpleGrid>
          <HStack flexWrap="wrap">
            <Button
              variant={query.warrantyExpiring ? "primary" : "secondary"}
              onClick={() =>
                setFilter("warrantyExpiring", query.warrantyExpiring ? undefined : "true")
              }
            >
              {language === "fa" ? "گارانتی رو به پایان" : "Warranty expiring"}
            </Button>
            <Button
              variant={query.licenseExpiring ? "primary" : "secondary"}
              onClick={() =>
                setFilter("licenseExpiring", query.licenseExpiring ? undefined : "true")
              }
            >
              {language === "fa" ? "لایسنس رو به پایان" : "License expiring"}
            </Button>
            {hasFilters && (
              <Button variant="ghost" onClick={reset}>
                <HStack>
                  <FilterX size={15} />
                  <Text>{text.clear}</Text>
                </HStack>
              </Button>
            )}
          </HStack>
        </VStack>
      </Card>

      {isLoading && (
        <VStack align="stretch">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} h="64px" borderRadius="md" />
          ))}
        </VStack>
      )}
      {error && (
        <Card>
          <ErrorState error={error} title={text.error} />
          <Button mt={3} variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      )}
      {!isLoading && !error && items.length === 0 && (
        <Card>
          <EmptyState title={text.empty} description={text.emptyDescription} />
        </Card>
      )}
      {!isLoading && !error && items.length > 0 && (
        <Box
          overflow="hidden"
          bg="var(--apple-surface-raised)"
          border="1px solid"
          borderColor="var(--apple-border-soft)"
          borderRadius="md"
        >
          <HStack
            px={4}
            py={3}
            justify="space-between"
            borderBottom="1px solid"
            borderColor="var(--apple-border-soft)"
          >
            <Text fontWeight="900">
              {pageInfo?.total || 0} {text.results}
            </Text>
            {isFetching && (
              <Text color="var(--apple-muted)" fontSize="xs">
                Updating…
              </Text>
            )}
          </HStack>
          <Box display={{ base: "none", lg: "block" }}>
            <Table.ScrollArea>
              <Table.Root size="sm" interactive>
                <Table.Header>
                  <Table.Row bg="var(--apple-surface-subtle)">
                    <Table.ColumnHeader>{text.name}</Table.ColumnHeader>
                    <Table.ColumnHeader>{text.ownership}</Table.ColumnHeader>
                    <Table.ColumnHeader>{text.owner}</Table.ColumnHeader>
                    <Table.ColumnHeader>{text.status}</Table.ColumnHeader>
                    <Table.ColumnHeader>{text.scope}</Table.ColumnHeader>
                    <Table.ColumnHeader>{text.updated}</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">
                      {text.actions}
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {items.map((asset) => (
                    <Table.Row
                      key={asset.id}
                      _even={{ bg: "var(--apple-surface-subtle)" }}
                    >
                      <Table.Cell>
                        <Text fontWeight="900">{asset.name}</Text>
                        <HStack mt={1}>
                          <Text color="var(--apple-muted)" fontSize="xs" dir="ltr">
                            {asset.assetCode || "—"}
                          </Text>
                          <Text color="var(--apple-muted)" fontSize="xs">
                            · {asset.type}
                          </Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <AssetBadges
                          ownerType={asset.ownerType}
                          status={asset.status}
                          type={asset.type}
                          language={language}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontWeight="750">
                          {asset.ownerType === "user"
                            ? person(asset.owner)
                            : asset.ownerType === "bank"
                              ? text.bank
                              : text.lab}
                        </Text>
                        {asset.assignedTo && (
                          <Text color="var(--apple-blue)" fontSize="xs">
                            → {person(asset.assignedTo)}
                          </Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Text textTransform="capitalize">{asset.status || "—"}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="xs">
                          {asset.departmentScope?.join(" · ") || "—"}
                        </Text>
                        <Text color="var(--apple-muted)" fontSize="xs">
                          {asset.platforms?.join(" · ") || "—"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell whiteSpace="nowrap">
                        {asset.updatedAt
                          ? new Date(asset.updatedAt).toLocaleDateString(
                              language === "fa" ? "fa-IR" : "en-US"
                            )
                          : "—"}
                      </Table.Cell>
                      <Table.Cell textAlign="end">
                        <HStack justify="end">
                          <Button variant="ghost" onClick={() => setSelectedId(asset.id)}>
                            {text.view}
                          </Button>
                          {asset.permissions.canEdit && (
                            <Button variant="secondary" onClick={() => openEdit(asset)}>
                              {text.edit}
                            </Button>
                          )}
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </Box>
          <VStack display={{ base: "flex", lg: "none" }} align="stretch" gap={0}>
            {items.map((asset) => (
              <Box
                key={asset.id}
                p={4}
                borderBottom="1px solid"
                borderColor="var(--apple-border-soft)"
              >
                <HStack justify="space-between" align="start">
                  <Box>
                    <Text fontWeight="900">{asset.name}</Text>
                    <Text color="var(--apple-muted)" fontSize="xs" dir="ltr">
                      {asset.assetCode || "—"}
                    </Text>
                  </Box>
                  <AssetBadges
                    ownerType={asset.ownerType}
                    status={asset.status}
                    type={asset.type}
                    language={language}
                  />
                </HStack>
                <SimpleGrid columns={2} gap={3} mt={3}>
                  <Box>
                    <Text color="var(--apple-muted)" fontSize="xs">
                      {text.owner}
                    </Text>
                    <Text fontSize="sm">
                      {asset.ownerType === "user" ? person(asset.owner) : asset.ownerType}
                    </Text>
                  </Box>
                  <Box>
                    <Text color="var(--apple-muted)" fontSize="xs">
                      {text.scope}
                    </Text>
                    <Text fontSize="sm">{asset.departmentScope?.join(" · ") || "—"}</Text>
                  </Box>
                </SimpleGrid>
                <HStack mt={3}>
                  <Button
                    flex="1"
                    variant="secondary"
                    onClick={() => setSelectedId(asset.id)}
                  >
                    {text.view}
                  </Button>
                  {asset.permissions.canEdit && (
                    <Button flex="1" onClick={() => openEdit(asset)}>
                      {text.edit}
                    </Button>
                  )}
                </HStack>
              </Box>
            ))}
          </VStack>
          <HStack
            px={4}
            py={3}
            justify="space-between"
            borderTop="1px solid"
            borderColor="var(--apple-border-soft)"
            bg="var(--apple-surface-subtle)"
          >
            <Text color="var(--apple-muted)" fontSize="sm">
              {text.page} {pageInfo?.page || 1} / {pageInfo?.pages || 1}
            </Text>
            <HStack>
              <Button
                variant="secondary"
                disabled={(pageInfo?.page || 1) <= 1}
                onClick={() => setFilter("page", (pageInfo?.page || 1) - 1)}
              >
                {text.previous}
              </Button>
              <Button
                variant="secondary"
                disabled={(pageInfo?.page || 1) >= (pageInfo?.pages || 1)}
                onClick={() => setFilter("page", (pageInfo?.page || 1) + 1)}
              >
                {text.next}
              </Button>
            </HStack>
          </HStack>
        </Box>
      )}
      {selectedId && (
        <AssetDetailsDialog
          id={selectedId}
          users={users}
          language={language}
          onClose={() => setSelectedId(undefined)}
          onEdit={() => {
            const asset = items.find((item) => item.id === selectedId);
            if (asset) openEdit(asset);
          }}
        />
      )}
      {formOpen && (
        <AssetFormDialog
          asset={editingAsset}
          currentUserId={user?.id}
          canManageAll={canManageAll}
          users={users}
          language={language}
          onClose={() => {
            setFormOpen(false);
            setEditingAsset(undefined);
          }}
        />
      )}
    </VStack>
  );
}
