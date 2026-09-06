import {
  Box,
  Checkbox,
  CloseButton,
  Dialog,
  Field,
  Grid,
  HStack,
  NativeSelect,
  Portal,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { Building2, FlaskConical, UserRound } from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { User } from "@/shared/types";
import Button from "@/shared/ui/primitives/Button";
import Input from "@/shared/ui/primitives/Input";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useCreateAssetMutation, useUpdateAssetMutation } from "../api/assetsApi";
import { gregorianToJalaliDate, jalaliToGregorianDate } from "../model/jalaliDate";
import type { Asset, AssetInput, AssetOwnerType } from "../model/types";

type Props = {
  asset?: Asset;
  currentUserId?: string;
  canManageAll: boolean;
  users?: User[];
  language: "en" | "fa";
  onClose: () => void;
};

const copy = {
  en: {
    titleNew: "Register asset",
    titleEdit: "Edit asset",
    subtitle: "Legacy-compatible inventory record",
    basic: "Basic information",
    scope: "Scope",
    technical: "Technical information",
    ownership: "Ownership & assignment",
    procurement: "Procurement",
    lifecycle: "Lifecycle",
    additional: "Additional",
    name: "Asset name",
    type: "Asset type",
    ownerType: "Asset ownership",
    code: "Asset code",
    bank: "Bank",
    lab: "Laboratory",
    user: "Personal / user",
    requiredCode: "Asset code is required for bank and laboratory assets.",
    owner: "Personal owner",
    department: "Department scope",
    platform: "Platforms",
    description: "Description",
    tags: "Tags (comma separated)",
    save: "Save asset",
    cancel: "Cancel",
    hardware: "Hardware",
    software: "Software",
    status: "Status",
    brand: "Brand",
    model: "Model",
    version: "Version",
    serial: "Serial number",
    mac: "MAC address",
    ip: "IP address",
    location: "Location",
    vendor: "Vendor",
    cost: "Cost",
    purchase: "Purchase date",
    warranty: "Warranty expiry",
    maintenance: "Maintenance schedule",
    softwareType: "Software type",
    licenseStatus: "License status",
    licenseKey: "License key",
    licenseHint: "Leave blank to preserve the current key",
    licenseExpiry: "License expiry",
    installDate: "Install date",
    allowed: "Allowed installations",
    missingName: "Asset name is required.",
    missingOwner: "Select the owner of this personal asset.",
    invalidDate: "Enter a valid date.",
    jalaliHint: "Jalali date, for example ۱۴۰۵/۰۶/۱۵",
  },
  fa: {
    titleNew: "ثبت دارایی",
    titleEdit: "ویرایش دارایی",
    subtitle: "رکورد سازگار با داده‌های قدیمی انبار",
    basic: "اطلاعات پایه",
    scope: "دامنه استفاده",
    technical: "اطلاعات فنی",
    ownership: "مالکیت و تخصیص",
    procurement: "خرید و تأمین",
    lifecycle: "چرخه عمر",
    additional: "اطلاعات تکمیلی",
    name: "نام دارایی / ابزار",
    type: "نوع دارایی",
    ownerType: "مالکیت دارایی",
    code: "کد دارایی",
    bank: "بانک",
    lab: "آزمایشگاه",
    user: "شخصی / کاربر",
    requiredCode: "کد دارایی برای دارایی بانک و آزمایشگاه الزامی است.",
    owner: "مالک شخصی",
    department: "دامنه دپارتمان",
    platform: "پلتفرم‌ها",
    description: "توضیحات",
    tags: "برچسب‌ها (با ویرگول)",
    save: "ذخیره دارایی",
    cancel: "انصراف",
    hardware: "سخت‌افزار",
    software: "نرم‌افزار",
    status: "وضعیت",
    brand: "برند",
    model: "مدل",
    version: "نسخه",
    serial: "شماره سریال",
    mac: "آدرس MAC",
    ip: "آدرس IP",
    location: "موقعیت",
    vendor: "تأمین‌کننده",
    cost: "هزینه",
    purchase: "تاریخ خرید",
    warranty: "پایان گارانتی",
    maintenance: "زمان نگهداری",
    softwareType: "نوع نرم‌افزار",
    licenseStatus: "وضعیت لایسنس",
    licenseKey: "کلید لایسنس",
    licenseHint: "برای حفظ کلید فعلی خالی بگذارید",
    licenseExpiry: "پایان لایسنس",
    installDate: "تاریخ نصب",
    allowed: "تعداد نصب مجاز",
    missingName: "نام دارایی الزامی است.",
    missingOwner: "مالک این دارایی شخصی را انتخاب کنید.",
    invalidDate: "تاریخ شمسی واردشده معتبر نیست. نمونه صحیح: ۱۴۰۵/۰۶/۱۵",
    jalaliHint: "تاریخ شمسی، نمونه: ۱۴۰۵/۰۶/۱۵",
  },
} as const;

type FormState = {
  name: string;
  type: "hardware" | "software";
  ownerType: AssetOwnerType;
  owner: string;
  assetCode: string;
  departmentScope: string[];
  platforms: string[];
  status: string;
  description: string;
  brand: string;
  model: string;
  version: string;
  serialNumber: string;
  licenseKey: string;
  macAddress: string;
  ipAddress: string;
  location: string;
  purchaseDate: string;
  warrantyExpiry: string;
  maintenanceSchedule: string;
  cost: string;
  vendor: string;
  tags: string;
  softwareType: string;
  licenseStatus: string;
  licenseExpiry: string;
  installDate: string;
  allowedInstallations: string;
};

const dateValue = (value: string | null | undefined, language: Props["language"]) =>
  language === "fa" ? gregorianToJalaliDate(value) : value?.slice(0, 10) || "";
function stateFrom(
  asset: Asset | undefined,
  currentUserId: string | undefined,
  language: Props["language"]
): FormState {
  return {
    name: asset?.name || "",
    type: asset?.type || "hardware",
    ownerType: asset?.ownerType || "user",
    owner: asset?.owner?.id || currentUserId || "",
    assetCode: asset?.assetCode || "",
    departmentScope: asset?.departmentScope || [],
    platforms: asset?.platforms || [],
    status: asset?.status || "available",
    description: asset?.description || "",
    brand: asset?.brand || "",
    model: asset?.model || "",
    version: asset?.version || "",
    serialNumber: asset?.serialNumber || "",
    licenseKey: "",
    macAddress: asset?.macAddress || "",
    ipAddress: asset?.ipAddress || "",
    location: asset?.location || "",
    purchaseDate: dateValue(asset?.purchaseDate, language),
    warrantyExpiry: dateValue(asset?.warrantyExpiry, language),
    maintenanceSchedule: dateValue(asset?.maintenanceSchedule, language),
    cost: asset?.cost == null ? "" : String(asset.cost),
    vendor: asset?.vendor || "",
    tags: (asset?.tags || []).join(", "),
    softwareType: asset?.softwareType || "free",
    licenseStatus: asset?.licenseStatus || "licensed",
    licenseExpiry: dateValue(asset?.licenseExpiry, language),
    installDate: dateValue(asset?.installDate, language),
    allowedInstallations:
      asset?.allowedInstallations == null ? "" : String(asset.allowedInstallations),
  };
}

function toPayload(
  state: FormState,
  language: Props["language"]
): Partial<AssetInput> | null {
  const optional = (value: string) => value.trim() || null;
  const date = (value: string) => {
    if (!value.trim()) return null;
    return language === "fa" ? jalaliToGregorianDate(value) : value;
  };
  const purchaseDate = date(state.purchaseDate);
  const warrantyExpiry = date(state.warrantyExpiry);
  const maintenanceSchedule = date(state.maintenanceSchedule);
  const licenseExpiry = date(state.licenseExpiry);
  const installDate = date(state.installDate);
  if (
    (state.purchaseDate && !purchaseDate) ||
    (state.warrantyExpiry && !warrantyExpiry) ||
    (state.maintenanceSchedule && !maintenanceSchedule) ||
    (state.licenseExpiry && !licenseExpiry) ||
    (state.installDate && !installDate)
  )
    return null;

  return {
    name: state.name.trim(),
    type: state.type,
    ownerType: state.ownerType,
    owner: state.ownerType === "user" ? state.owner || null : null,
    assetCode: optional(state.assetCode),
    departmentScope: state.departmentScope as AssetInput["departmentScope"],
    platforms: state.platforms as AssetInput["platforms"],
    status: state.status as AssetInput["status"],
    description: optional(state.description),
    brand: optional(state.brand),
    model: optional(state.model),
    version: optional(state.version),
    serialNumber: optional(state.serialNumber),
    macAddress: optional(state.macAddress),
    ipAddress: optional(state.ipAddress),
    location: optional(state.location),
    purchaseDate,
    warrantyExpiry,
    maintenanceSchedule,
    cost: state.cost === "" ? null : Number(state.cost),
    vendor: optional(state.vendor),
    tags: state.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    ...(state.type === "software"
      ? {
          softwareType: state.softwareType as AssetInput["softwareType"],
          licenseStatus: state.licenseStatus as AssetInput["licenseStatus"],
          licenseExpiry,
          installDate,
          allowedInstallations:
            state.allowedInstallations === "" ? null : Number(state.allowedInstallations),
          ...(state.licenseKey.trim() ? { licenseKey: state.licenseKey.trim() } : {}),
        }
      : {}),
  };
}

function DateField({
  label,
  value,
  language,
  hint,
  onChange,
}: {
  label: string;
  value: string;
  language: Props["language"];
  hint: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      label={language === "fa" ? `${label} (شمسی)` : label}
      type={language === "fa" ? "text" : "date"}
      inputMode={language === "fa" ? "numeric" : undefined}
      placeholder={language === "fa" ? "۱۴۰۵/۰۶/۱۵" : undefined}
      aria-description={language === "fa" ? hint : undefined}
      dir="ltr"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box
      border="1px solid"
      borderColor="var(--apple-border-soft)"
      borderRadius="md"
      p={{ base: 4, md: 5 }}
    >
      <Text fontWeight="900" mb={4}>
        {title}
      </Text>
      {children}
    </Box>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <NativeSelect.Root disabled={disabled}>
        <NativeSelect.Field
          value={value}
          onChange={(event) => onChange(event.target.value)}
          bg="var(--apple-surface)"
          borderColor="var(--apple-border)"
        >
          {children}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Field.Root>
  );
}

function MultiChecks({
  values,
  selected,
  onChange,
}: {
  values: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <HStack gap={4} flexWrap="wrap">
      {values.map((item) => (
        <Checkbox.Root
          key={item.value}
          checked={selected.includes(item.value)}
          onCheckedChange={(details) =>
            onChange(
              details.checked
                ? [...selected, item.value]
                : selected.filter((value) => value !== item.value)
            )
          }
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>{item.label}</Checkbox.Label>
        </Checkbox.Root>
      ))}
    </HStack>
  );
}

export default function AssetFormDialog({
  asset,
  currentUserId,
  canManageAll,
  users = [],
  language,
  onClose,
}: Props) {
  const text = copy[language];
  const [state, setState] = useState(() => stateFrom(asset, currentUserId, language));
  const [formError, setFormError] = useState("");
  const [createAsset, createState] = useCreateAssetMutation();
  const [updateAsset, updateState] = useUpdateAssetMutation();
  const initialPayload = useMemo(
    () => toPayload(stateFrom(asset, currentUserId, language), language),
    [asset, currentUserId, language]
  );
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((current) => ({ ...current, [key]: value }));
  const busy = createState.isLoading || updateState.isLoading;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (!state.name.trim()) return setFormError(text.missingName);
    if (["bank", "lab"].includes(state.ownerType) && !state.assetCode.trim())
      return setFormError(text.requiredCode);
    if (canManageAll && state.ownerType === "user" && !state.owner)
      return setFormError(text.missingOwner);
    const payload = toPayload(state, language);
    if (!payload || !initialPayload) return setFormError(text.invalidDate);
    try {
      if (asset) {
        const changed = Object.fromEntries(
          Object.entries(payload).filter(
            ([key, value]) =>
              JSON.stringify(value) !==
              JSON.stringify(initialPayload[key as keyof AssetInput])
          )
        );
        if (Object.keys(changed).length)
          await updateAsset({ id: asset.id, body: changed }).unwrap();
      } else await createAsset(payload).unwrap();
      onClose();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  const ownershipOptions = [
    { value: "bank" as const, label: text.bank, icon: Building2 },
    { value: "lab" as const, label: text.lab, icon: FlaskConical },
    { value: "user" as const, label: text.user, icon: UserRound },
  ].filter((option) => canManageAll || option.value === "user");

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
            dir={language === "fa" ? "rtl" : "ltr"}
            textAlign="start"
            maxW="1120px"
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
              <Box>
                <Dialog.Title>{asset ? text.titleEdit : text.titleNew}</Dialog.Title>
                <Dialog.Description color="var(--apple-muted)">
                  {text.subtitle}
                </Dialog.Description>
              </Box>
            </Dialog.Header>
            <Dialog.Body>
              <Box as="form" id="asset-form" onSubmit={submit}>
                <VStack align="stretch" gap={4}>
                  {formError && (
                    <Box
                      p={3}
                      bg="var(--apple-danger-bg)"
                      color="var(--apple-danger-text)"
                      border="1px solid"
                      borderColor="var(--apple-danger-border)"
                      borderRadius="md"
                    >
                      {formError}
                    </Box>
                  )}
                  <Section title={text.basic}>
                    <VStack align="stretch" gap={4}>
                      <Grid templateColumns={{ base: "1fr", md: "1.4fr .6fr" }} gap={3}>
                        <Input
                          label={text.name}
                          required
                          value={state.name}
                          onChange={(event) => set("name", event.target.value)}
                        />
                        <SelectField
                          label={text.type}
                          value={state.type}
                          onChange={(value) => set("type", value as FormState["type"])}
                        >
                          <option value="hardware">{text.hardware}</option>
                          <option value="software">{text.software}</option>
                        </SelectField>
                      </Grid>
                      <Box>
                        <Text fontSize="sm" fontWeight="800" mb={2}>
                          {text.ownerType}
                        </Text>
                        <SimpleGrid
                          columns={{ base: 1, sm: ownershipOptions.length }}
                          gap={2}
                        >
                          {ownershipOptions.map(({ value, label, icon: Icon }) => (
                            <Box
                              asChild
                              key={value}
                              p={3}
                              textAlign="start"
                              border="1px solid"
                              borderColor={
                                state.ownerType === value
                                  ? "var(--apple-blue)"
                                  : "var(--apple-border)"
                              }
                              bg={
                                state.ownerType === value
                                  ? "var(--apple-blue-soft)"
                                  : "var(--apple-surface)"
                              }
                              borderRadius="md"
                            >
                              <button
                                type="button"
                                disabled={!canManageAll && value !== "user"}
                                onClick={() => set("ownerType", value)}
                              >
                                <HStack>
                                  <Icon size={18} />
                                  <Text fontWeight="850">{label}</Text>
                                </HStack>
                              </button>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>
                      <Input
                        label={text.code}
                        required={["bank", "lab"].includes(state.ownerType)}
                        value={state.assetCode}
                        onChange={(event) => set("assetCode", event.target.value)}
                      />
                      <Text color="var(--apple-muted)" fontSize="xs">
                        {text.requiredCode}
                      </Text>
                    </VStack>
                  </Section>
                  <Section title={text.scope}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                      <Field.Root>
                        <Field.Label>{text.department}</Field.Label>
                        <MultiChecks
                          selected={state.departmentScope}
                          onChange={(values) => set("departmentScope", values)}
                          values={[
                            {
                              value: "security",
                              label: language === "fa" ? "امنیت" : "Security",
                            },
                            {
                              value: "quality",
                              label: language === "fa" ? "کیفیت" : "Quality",
                            },
                          ]}
                        />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>{text.platform}</Field.Label>
                        <MultiChecks
                          selected={state.platforms}
                          onChange={(values) => set("platforms", values)}
                          values={["web", "mobile", "desktop", "api"].map((value) => ({
                            value,
                            label: value.toUpperCase(),
                          }))}
                        />
                      </Field.Root>
                    </SimpleGrid>
                  </Section>
                  <Section title={text.technical}>
                    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={3}>
                      {state.type === "hardware" ? (
                        <>
                          <Input
                            label={text.brand}
                            value={state.brand}
                            onChange={(e) => set("brand", e.target.value)}
                          />
                          <Input
                            label={text.model}
                            value={state.model}
                            onChange={(e) => set("model", e.target.value)}
                          />
                          <Input
                            label={text.serial}
                            value={state.serialNumber}
                            onChange={(e) => set("serialNumber", e.target.value)}
                          />
                          <Input
                            label={text.mac}
                            dir="ltr"
                            value={state.macAddress}
                            onChange={(e) => set("macAddress", e.target.value)}
                          />
                          <Input
                            label={text.ip}
                            dir="ltr"
                            value={state.ipAddress}
                            onChange={(e) => set("ipAddress", e.target.value)}
                          />
                          <Input
                            label={text.location}
                            value={state.location}
                            onChange={(e) => set("location", e.target.value)}
                          />
                        </>
                      ) : (
                        <>
                          <Input
                            label={text.version}
                            value={state.version}
                            onChange={(e) => set("version", e.target.value)}
                          />
                          <SelectField
                            label={text.softwareType}
                            value={state.softwareType}
                            onChange={(value) => set("softwareType", value)}
                          >
                            <option value="free">Free</option>
                            <option value="paid">Paid</option>
                          </SelectField>
                          <SelectField
                            label={text.licenseStatus}
                            value={state.licenseStatus}
                            onChange={(value) => set("licenseStatus", value)}
                          >
                            <option value="licensed">Licensed</option>
                            <option value="trial">Trial</option>
                            <option value="cracked">Cracked</option>
                          </SelectField>
                          <Input
                            label={text.licenseKey}
                            type="password"
                            placeholder={asset ? text.licenseHint : undefined}
                            value={state.licenseKey}
                            onChange={(e) => set("licenseKey", e.target.value)}
                          />
                          <Input
                            label={text.allowed}
                            type="number"
                            min={0}
                            value={state.allowedInstallations}
                            onChange={(e) => set("allowedInstallations", e.target.value)}
                          />
                        </>
                      )}
                    </SimpleGrid>
                  </Section>
                  <Section title={text.ownership}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                      {state.ownerType === "user" && canManageAll && (
                        <SelectField
                          label={text.owner}
                          value={state.owner}
                          onChange={(value) => set("owner", value)}
                        >
                          <option value="">—</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} · {user.username}
                            </option>
                          ))}
                        </SelectField>
                      )}
                      <SelectField
                        label={text.status}
                        value={state.status}
                        onChange={(value) => set("status", value)}
                      >
                        <option value="available">Available</option>
                        <option value="in-use">In use</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="retired">Retired</option>
                        <option value="lost">Lost</option>
                      </SelectField>
                    </SimpleGrid>
                  </Section>
                  <Section title={text.procurement}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                      <Input
                        label={text.vendor}
                        value={state.vendor}
                        onChange={(e) => set("vendor", e.target.value)}
                      />
                      <Input
                        label={text.cost}
                        type="number"
                        min={0}
                        step="any"
                        value={state.cost}
                        onChange={(e) => set("cost", e.target.value)}
                      />
                      <DateField
                        label={text.purchase}
                        language={language}
                        hint={text.jalaliHint}
                        value={state.purchaseDate}
                        onChange={(value) => set("purchaseDate", value)}
                      />
                    </SimpleGrid>
                  </Section>
                  <Section title={text.lifecycle}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                      {state.type === "hardware" ? (
                        <>
                          <DateField
                            label={text.warranty}
                            language={language}
                            hint={text.jalaliHint}
                            value={state.warrantyExpiry}
                            onChange={(value) => set("warrantyExpiry", value)}
                          />
                          <DateField
                            label={text.maintenance}
                            language={language}
                            hint={text.jalaliHint}
                            value={state.maintenanceSchedule}
                            onChange={(value) => set("maintenanceSchedule", value)}
                          />
                        </>
                      ) : (
                        <>
                          <DateField
                            label={text.licenseExpiry}
                            language={language}
                            hint={text.jalaliHint}
                            value={state.licenseExpiry}
                            onChange={(value) => set("licenseExpiry", value)}
                          />
                          <DateField
                            label={text.installDate}
                            language={language}
                            hint={text.jalaliHint}
                            value={state.installDate}
                            onChange={(value) => set("installDate", value)}
                          />
                        </>
                      )}
                    </SimpleGrid>
                  </Section>
                  <Section title={text.additional}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                      <Field.Root>
                        <Field.Label>{text.description}</Field.Label>
                        <Textarea
                          value={state.description}
                          onChange={(e) => set("description", e.target.value)}
                          bg="var(--apple-surface)"
                          borderColor="var(--apple-border)"
                          minH="110px"
                        />
                      </Field.Root>
                      <Input
                        label={text.tags}
                        value={state.tags}
                        onChange={(e) => set("tags", e.target.value)}
                      />
                    </SimpleGrid>
                  </Section>
                </VStack>
              </Box>
            </Dialog.Body>
            <Dialog.Footer borderTop="1px solid" borderColor="var(--apple-border-soft)">
              <Button variant="secondary" onClick={onClose}>
                {text.cancel}
              </Button>
              <Button type="submit" form="asset-form" isLoading={busy}>
                {text.save}
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
