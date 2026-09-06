import {
  Box,
  CloseButton,
  Dialog,
  Grid,
  HStack,
  NativeSelect,
  Portal,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Eye, EyeOff, Pencil, RotateCcw, UserPlus } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { User } from "@/shared/types";
import Button from "@/shared/ui/primitives/Button";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import {
  useAssignAssetMutation,
  useGetAssetQuery,
  useRevealAssetLicenseMutation,
  useUnassignAssetMutation,
} from "../api/assetsApi";
import { AssetBadges } from "./AssetBadges";

function userName(
  user?: { firstName?: string; lastName?: string; username?: string } | null
) {
  return user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "—"
    : "—";
}

function FieldValue({
  label,
  value,
  dir,
}: {
  label: string;
  value: unknown;
  dir?: "ltr" | "rtl";
}) {
  const display = Array.isArray(value)
    ? value.join(" · ")
    : value instanceof Date
      ? value.toLocaleDateString()
      : value;
  return (
    <Box minW={0}>
      <Text color="var(--apple-muted)" fontSize="xs" fontWeight="800">
        {label}
      </Text>
      <Text mt={1} fontWeight="750" overflowWrap="anywhere" dir={dir}>
        {display === undefined || display === null || display === ""
          ? "—"
          : String(display)}
      </Text>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box
      p={4}
      bg="var(--apple-surface-subtle)"
      border="1px solid"
      borderColor="var(--apple-border-soft)"
      borderRadius="md"
    >
      <Text mb={3} fontWeight="900">
        {title}
      </Text>
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} gap={4}>
        {children}
      </SimpleGrid>
    </Box>
  );
}

export default function AssetDetailsDialog({
  id,
  users = [],
  language,
  onClose,
  onEdit,
}: {
  id: string;
  users?: User[];
  language: "en" | "fa";
  onClose: () => void;
  onEdit: () => void;
}) {
  const { data: asset, isLoading, error } = useGetAssetQuery(id);
  const [selectedUser, setSelectedUser] = useState("");
  const [revealedKey, setRevealedKey] = useState<string>();
  const [actionError, setActionError] = useState("");
  const [assign, assignState] = useAssignAssetMutation();
  const [unassign, unassignState] = useUnassignAssetMutation();
  const [reveal, revealState] = useRevealAssetLicenseMutation();
  const fa = language === "fa";
  const busy = assignState.isLoading || unassignState.isLoading;
  const run = async (action: () => Promise<unknown>) => {
    try {
      setActionError("");
      await action();
    } catch (cause) {
      setActionError(getApiErrorMessage(cause));
    }
  };

  return (
    <Dialog.Root
      open
      size="xl"
      placement="center"
      scrollBehavior="inside"
      onOpenChange={(details) => !details.open && onClose()}
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <Dialog.Positioner p={{ base: 2, md: 5 }}>
          <Dialog.Content
            maxW="1060px"
            maxH="calc(100dvh - 24px)"
            bg="var(--apple-surface-raised)"
            border="1px solid"
            borderColor="var(--apple-border)"
            borderRadius="md"
          >
            <Dialog.Header
              borderBottom="1px solid"
              borderColor="var(--apple-border-soft)"
            >
              <Box pe={8}>
                <Dialog.Title>
                  {asset?.name || (fa ? "جزئیات دارایی" : "Asset details")}
                </Dialog.Title>
                <Dialog.Description color="var(--apple-muted)">
                  {asset?.assetCode || id}
                </Dialog.Description>
              </Box>
            </Dialog.Header>
            <Dialog.Body>
              {isLoading && (
                <VStack align="stretch">
                  <Skeleton h="70px" />
                  <Skeleton h="180px" />
                  <Skeleton h="180px" />
                </VStack>
              )}
              {error && (
                <Box color="var(--apple-danger-text)">{getApiErrorMessage(error)}</Box>
              )}
              {actionError && (
                <Box
                  mb={3}
                  p={3}
                  bg="var(--apple-danger-bg)"
                  color="var(--apple-danger-text)"
                  borderRadius="md"
                >
                  {actionError}
                </Box>
              )}
              {asset && (
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between" flexWrap="wrap">
                    <AssetBadges
                      ownerType={asset.ownerType}
                      type={asset.type}
                      status={asset.status}
                      language={language}
                    />
                    {asset.permissions.canEdit && (
                      <Button variant="secondary" onClick={onEdit}>
                        <HStack>
                          <Pencil size={15} />
                          <Text>{fa ? "ویرایش" : "Edit"}</Text>
                        </HStack>
                      </Button>
                    )}
                  </HStack>
                  <Section title={fa ? "نمای کلی" : "Overview"}>
                    <FieldValue
                      label={fa ? "نام دارایی" : "Asset name"}
                      value={asset.name}
                    />
                    <FieldValue
                      label={fa ? "کد دارایی" : "Asset code"}
                      value={asset.assetCode}
                      dir="ltr"
                    />
                    <FieldValue label={fa ? "وضعیت" : "Status"} value={asset.status} />
                    <FieldValue
                      label={fa ? "دپارتمان" : "Departments"}
                      value={asset.departmentScope}
                    />
                    <FieldValue
                      label={fa ? "پلتفرم" : "Platforms"}
                      value={asset.platforms}
                    />
                    <FieldValue
                      label={fa ? "آخرین تغییر" : "Updated"}
                      value={
                        asset.updatedAt
                          ? new Date(asset.updatedAt).toLocaleString(
                              fa ? "fa-IR" : "en-US"
                            )
                          : undefined
                      }
                    />
                  </Section>
                  <Section title={fa ? "مالکیت و تخصیص" : "Ownership & assignment"}>
                    <FieldValue
                      label={fa ? "نوع مالکیت" : "Ownership"}
                      value={asset.ownerType}
                    />
                    <FieldValue
                      label={fa ? "مالک" : "Owner"}
                      value={
                        asset.ownerType === "user"
                          ? userName(asset.owner)
                          : asset.ownerType === "bank"
                            ? fa
                              ? "بانک"
                              : "Bank"
                            : fa
                              ? "آزمایشگاه"
                              : "Laboratory"
                      }
                    />
                    <FieldValue
                      label={fa ? "تخصیص‌یافته به" : "Assigned to"}
                      value={userName(asset.assignedTo)}
                    />
                    <FieldValue
                      label={fa ? "تاریخ تخصیص" : "Assigned date"}
                      value={
                        asset.assignedDate
                          ? new Date(asset.assignedDate).toLocaleDateString(
                              fa ? "fa-IR" : "en-US"
                            )
                          : undefined
                      }
                    />
                  </Section>
                  {asset.type === "hardware" ? (
                    <Section
                      title={fa ? "مشخصات فنی سخت‌افزار" : "Hardware technical details"}
                    >
                      <FieldValue label={fa ? "برند" : "Brand"} value={asset.brand} />
                      <FieldValue label={fa ? "مدل" : "Model"} value={asset.model} />
                      <FieldValue
                        label={fa ? "شماره سریال" : "Serial number"}
                        value={asset.serialNumber}
                        dir="ltr"
                      />
                      <FieldValue label="MAC" value={asset.macAddress} dir="ltr" />
                      <FieldValue label="IP" value={asset.ipAddress} dir="ltr" />
                      <FieldValue
                        label={fa ? "موقعیت" : "Location"}
                        value={asset.location}
                      />
                    </Section>
                  ) : (
                    <Section title={fa ? "لایسنس نرم‌افزار" : "Software licensing"}>
                      <FieldValue label={fa ? "نسخه" : "Version"} value={asset.version} />
                      <FieldValue
                        label={fa ? "نوع نرم‌افزار" : "Software type"}
                        value={asset.softwareType}
                      />
                      <FieldValue
                        label={fa ? "وضعیت لایسنس" : "License status"}
                        value={asset.licenseStatus}
                      />
                      <Grid
                        gridColumn={{ sm: "span 2", xl: "span 3" }}
                        templateColumns={{ base: "1fr", md: "1fr auto" }}
                        gap={2}
                        alignItems="end"
                      >
                        <FieldValue
                          label={fa ? "کلید لایسنس" : "License key"}
                          value={revealedKey || asset.licenseKey}
                          dir="ltr"
                        />
                        {asset.permissions.canRevealLicense && (
                          <Button
                            variant="secondary"
                            isLoading={revealState.isLoading}
                            onClick={() =>
                              revealedKey
                                ? setRevealedKey(undefined)
                                : run(async () =>
                                    setRevealedKey(
                                      (await reveal(asset.id).unwrap()).licenseKey
                                    )
                                  )
                            }
                          >
                            <HStack>
                              {revealedKey ? <EyeOff size={15} /> : <Eye size={15} />}
                              <Text>
                                {revealedKey
                                  ? fa
                                    ? "پنهان"
                                    : "Hide"
                                  : fa
                                    ? "نمایش امن"
                                    : "Reveal"}
                              </Text>
                            </HStack>
                          </Button>
                        )}
                      </Grid>
                      <FieldValue
                        label={fa ? "پایان لایسنس" : "License expiry"}
                        value={
                          asset.licenseExpiry
                            ? new Date(asset.licenseExpiry).toLocaleDateString(
                                fa ? "fa-IR" : "en-US"
                              )
                            : undefined
                        }
                      />
                      <FieldValue
                        label={fa ? "تعداد نصب مجاز" : "Allowed installations"}
                        value={asset.allowedInstallations}
                      />
                    </Section>
                  )}
                  <Section title={fa ? "خرید و چرخه عمر" : "Procurement & lifecycle"}>
                    <FieldValue
                      label={fa ? "تأمین‌کننده" : "Vendor"}
                      value={asset.vendor}
                    />
                    <FieldValue
                      label={fa ? "هزینه" : "Cost"}
                      value={asset.cost?.toLocaleString()}
                    />
                    <FieldValue
                      label={fa ? "تاریخ خرید" : "Purchase date"}
                      value={
                        asset.purchaseDate
                          ? new Date(asset.purchaseDate).toLocaleDateString(
                              fa ? "fa-IR" : "en-US"
                            )
                          : undefined
                      }
                    />
                    <FieldValue
                      label={fa ? "پایان گارانتی" : "Warranty expiry"}
                      value={
                        asset.warrantyExpiry
                          ? `${new Date(asset.warrantyExpiry).toLocaleDateString(fa ? "fa-IR" : "en-US")} · ${asset.lifecycleAlerts?.warranty}`
                          : undefined
                      }
                    />
                    <FieldValue
                      label={fa ? "نگهداری بعدی" : "Next maintenance"}
                      value={
                        asset.maintenanceSchedule
                          ? `${new Date(asset.maintenanceSchedule).toLocaleDateString(fa ? "fa-IR" : "en-US")} · ${asset.lifecycleAlerts?.maintenance}`
                          : undefined
                      }
                    />
                    {asset.type === "software" && (
                      <FieldValue
                        label={fa ? "هشدار لایسنس" : "License alert"}
                        value={asset.lifecycleAlerts?.license}
                      />
                    )}
                    <FieldValue label={fa ? "برچسب‌ها" : "Tags"} value={asset.tags} />
                  </Section>
                  {(asset.description || asset.permissions.canAssign) && (
                    <Box
                      p={4}
                      border="1px solid"
                      borderColor="var(--apple-border-soft)"
                      borderRadius="md"
                    >
                      {asset.description && (
                        <>
                          <Text fontWeight="900">{fa ? "توضیحات" : "Description"}</Text>
                          <Text
                            mt={2}
                            color="var(--apple-secondary)"
                            whiteSpace="pre-wrap"
                          >
                            {asset.description}
                          </Text>
                        </>
                      )}
                      {asset.permissions.canAssign && (
                        <Box
                          mt={asset.description ? 5 : 0}
                          pt={asset.description ? 4 : 0}
                          borderTop={asset.description ? "1px solid" : undefined}
                          borderColor="var(--apple-border-soft)"
                        >
                          <Text fontWeight="900" mb={2}>
                            {fa ? "مدیریت تخصیص" : "Assignment management"}
                          </Text>
                          <HStack align="end" flexWrap="wrap">
                            <NativeSelect.Root flex="1" minW="220px">
                              <NativeSelect.Field
                                value={selectedUser}
                                onChange={(event) => setSelectedUser(event.target.value)}
                                bg="var(--apple-surface)"
                                borderColor="var(--apple-border)"
                              >
                                <option value="">
                                  {fa ? "انتخاب کاربر..." : "Select user..."}
                                </option>
                                {users.map((user) => (
                                  <option key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName} · {user.username}
                                  </option>
                                ))}
                              </NativeSelect.Field>
                              <NativeSelect.Indicator />
                            </NativeSelect.Root>
                            <Button
                              disabled={!selectedUser}
                              isLoading={busy}
                              onClick={() =>
                                run(async () => {
                                  await assign({
                                    id: asset.id,
                                    assignedTo: selectedUser,
                                  }).unwrap();
                                  setSelectedUser("");
                                })
                              }
                            >
                              <HStack>
                                <UserPlus size={15} />
                                <Text>{fa ? "تخصیص" : "Assign"}</Text>
                              </HStack>
                            </Button>
                            {asset.assignedTo && (
                              <Button
                                variant="secondary"
                                isLoading={busy}
                                onClick={() => run(() => unassign(asset.id).unwrap())}
                              >
                                <HStack>
                                  <RotateCcw size={15} />
                                  <Text>{fa ? "لغو تخصیص" : "Unassign"}</Text>
                                </HStack>
                              </Button>
                            )}
                          </HStack>
                        </Box>
                      )}
                    </Box>
                  )}
                </VStack>
              )}
            </Dialog.Body>
            <Dialog.Footer borderTop="1px solid" borderColor="var(--apple-border-soft)">
              <Button variant="secondary" onClick={onClose}>
                {fa ? "بستن" : "Close"}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="3" insetEnd="3" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
