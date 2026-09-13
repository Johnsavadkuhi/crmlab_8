import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Box,
  Checkbox,
  Field,
  HStack,
  Input,
  NativeSelect,
  RadioGroup,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
  chakra,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import {
  FOUR_L_CATEGORIES,
  FOUR_L_STATUSES,
  type FourLActionItemContract,
  type FourLCategory,
  type FourLDraftInputContract,
  type FourLRating,
  type FourLRetrospectiveContract,
  type FourLSectionContract,
} from "@role-dashboard/contracts";
import {
  useApproveFourLMutation,
  useReopenFourLMutation,
  useRequestFourLChangesMutation,
  useSaveFourLDraftMutation,
  useSendFourLToAdminMutation,
  useSubmitFourLMutation,
} from "@/entities/retrospective/api/fourLApi";
import { useLanguage } from "@/features/language/model";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import Button from "@/shared/ui/primitives/Button";

const copy = {
  fa: {
    title: "فرم بازبینی 4L – تیم آزمونگران",
    subtitle: "یاد بگیریم، بهتر شویم، ارزش تحویل دهیم.",
    purposeTitle: "هدف این فرم یادگیری و بهبود مستمر است.",
    purpose: "بازخورد شما مستقیماً به اقدام‌های عملی و بهبود تیم تبدیل می‌شود.",
    quick: "ارزیابی سریع پروژه",
    quickHint: "وضعیت کلی این پروژه از نگاه شما چگونه بود؟",
    smooth: "روان",
    smoothHint: "عالی پیش رفت",
    acceptable: "قابل قبول",
    acceptableHint: "همکاری و کنترل متوسط",
    difficult: "دشوار",
    difficultHint: "چالش‌های زیاد",
    repeat: "آیا قبل از تکرار این پروژه، چیزی را تغییر می‌دهید؟",
    yes: "بله",
    no: "خیر",
    projectInfo: "اطلاعات پروژه (از سیستم)",
    projectId: "شناسه پروژه",
    projectName: "نام پروژه",
    pentester: "آزمونگر",
    registrationDate: "تاریخ ثبت فرم",
    saved: "اطلاعات به‌صورت خودکار ذخیره می‌شود.",
    saving: "در حال ذخیره خودکار…",
    saveError: "ذخیره خودکار ناموفق بود؛ با تغییر بعدی یا ثبت نهایی دوباره تلاش می‌شود.",
    liked: "دوست داشتیم (Liked)",
    likedHint: "چه چیزهایی عالی پیش رفت؟",
    lacked: "کمبود داشتیم (Lacked)",
    lackedHint: "چه ابزار، دسترسی یا نیرویی کم بود؟",
    learned: "آموختیم (Learned)",
    learnedHint: "چه مهارت یا دانش جدیدی کسب کردید؟",
    longed: "مشتاقیم (Longed For)",
    longedHint: "چه آرزویی برای پروژه بعدی دارید؟",
    placeholder: "توضیحات خود را اینجا بنویسید…",
    none: "موردی ندارم",
    followUp: "نیاز به پیگیری یا هشدار دارد؟",
    followUpHint: "آیا این موضوع نیاز به پیگیری در سطح مدیریت دارد؟",
    followUpYes: "بله، لطفاً پیگیری شود",
    category: "دسته‌بندی موضوع (حداکثر چهار مورد)",
    obstacle: "بزرگ‌ترین مانع پروژه",
    obstacleHint: "مهم‌ترین مانعی که بیشترین تأثیر منفی را داشت چه بود؟",
    actions: "اقدام‌های عملیاتی (Action Items)",
    actionsHint: "اقدام‌های مشخص را ثبت کنید تا پیگیری و حل شوند.",
    description: "شرح اقدام",
    owner: "مسئول",
    priority: "اولویت",
    due: "مهلت انجام",
    status: "وضعیت",
    addAction: "افزودن اقدام جدید",
    delete: "حذف",
    duplicate: "تکثیر",
    acknowledgement: "تأیید نهایی",
    acknowledgementText: "تأیید می‌کنم اطلاعات را با دقت و به‌صورت واقعی ثبت کرده‌ام.",
    retro: "یادآوری",
    retroText: "پس از ثبت، جلسه بازبینی تیمی برای اقدام‌های این فرم برنامه‌ریزی شود.",
    submit: "ثبت نهایی و ارسال برای نماینده",
    submitHint: "پس از ارسال، ویرایش فقط در صورت درخواست اصلاح نماینده ممکن است.",
    back: "بازگشت به فهرست 4L",
    review: "بازبینی نماینده آزمایشگاه",
    reviewNote: "یادداشت بازبینی",
    reviewPlaceholder: "نتیجه بازبینی یا اصلاحات لازم را بنویسید…",
    requestChanges: "درخواست اصلاح",
    approve: "تأیید فرم",
    sendAdmin: "ارسال برای ادمین آزمایشگاه",
    reopen: "بازگشایی برای اصلاح",
    readOnly: "این فرم در وضعیت فعلی فقط قابل مشاهده است.",
    low: "پایین",
    medium: "متوسط",
    high: "بالا",
    open: "باز",
    inProgress: "در حال انجام",
    done: "انجام‌شده",
    submitSuccess: "فرم برای نماینده آزمایشگاه ارسال شد.",
    transitionSuccess: "وضعیت فرم با موفقیت به‌روزرسانی شد.",
  },
  en: {
    title: "4L Retrospective – Testing Team",
    subtitle: "Learn, improve, and deliver value.",
    purposeTitle: "This form supports continuous learning and improvement.",
    purpose: "Your feedback becomes practical actions and measurable team improvements.",
    quick: "Quick project assessment",
    quickHint: "How did this project feel overall?",
    smooth: "Smooth",
    smoothHint: "Went very well",
    acceptable: "Acceptable",
    acceptableHint: "Manageable collaboration",
    difficult: "Difficult",
    difficultHint: "Many challenges",
    repeat: "Would you change anything before repeating this project?",
    yes: "Yes",
    no: "No",
    projectInfo: "Project information (from system)",
    projectId: "Project ID",
    projectName: "Project name",
    pentester: "Pentester",
    registrationDate: "Form created",
    saved: "Your information is saved automatically.",
    saving: "Saving automatically…",
    saveError: "Autosave failed; it will retry after the next change.",
    liked: "Liked",
    likedHint: "What went especially well?",
    lacked: "Lacked",
    lackedHint: "What tools, access, or support were missing?",
    learned: "Learned",
    learnedHint: "What new skill or knowledge did you gain?",
    longed: "Longed For",
    longedHint: "What would you wish for next time?",
    placeholder: "Write your response here…",
    none: "Not applicable",
    followUp: "Needs escalation or follow-up?",
    followUpHint: "Does management need to follow this up?",
    followUpYes: "Yes, please follow up",
    category: "Topic categories (up to four)",
    obstacle: "Biggest project obstacle",
    obstacleHint: "What had the greatest negative impact?",
    actions: "Action Items",
    actionsHint: "Record concrete actions so they can be owned and resolved.",
    description: "Action",
    owner: "Owner",
    priority: "Priority",
    due: "Due date",
    status: "Status",
    addAction: "Add action item",
    delete: "Delete",
    duplicate: "Duplicate",
    acknowledgement: "Final confirmation",
    acknowledgementText: "I confirm that this information is accurate and complete.",
    retro: "Reminder",
    retroText: "Schedule a team retrospective to follow up on these actions.",
    submit: "Submit to Lab Representative",
    submitHint: "After submission, editing is possible only if changes are requested.",
    back: "Back to 4L list",
    review: "Lab Representative review",
    reviewNote: "Review note",
    reviewPlaceholder: "Write the review outcome or requested changes…",
    requestChanges: "Request changes",
    approve: "Approve form",
    sendAdmin: "Send to Lab Admin",
    reopen: "Reopen for changes",
    readOnly: "This form is read-only in its current status.",
    low: "Low",
    medium: "Medium",
    high: "High",
    open: "Open",
    inProgress: "In progress",
    done: "Done",
    submitSuccess: "The form was sent to the Lab Representative.",
    transitionSuccess: "The form status was updated.",
  },
} as const;

const categoryLabels = {
  fa: {
    process: "فرآیندها / رویه‌ها",
    access_environment: "دسترسی / محیط",
    documentation: "مستندات",
    tools_automation: "ابزارها / اتوماسیون",
    security_testing: "تست امنیتی",
    test_data: "داده‌های تست",
    other: "سایر",
  },
  en: {
    process: "Process / procedure",
    access_environment: "Access / environment",
    documentation: "Documentation",
    tools_automation: "Tools / automation",
    security_testing: "Security testing",
    test_data: "Test data",
    other: "Other",
  },
} satisfies Record<"fa" | "en", Record<FourLCategory, string>>;

const statusLabels = {
  fa: {
    draft: "در انتظار ثبت",
    submitted_to_representative: "در انتظار بازبینی نماینده",
    changes_requested: "نیازمند اصلاح",
    representative_approved: "تأییدشده توسط نماینده",
    sent_to_admin: "ارسال‌شده برای ادمین",
  },
  en: {
    draft: "Awaiting submission",
    submitted_to_representative: "Awaiting representative review",
    changes_requested: "Changes requested",
    representative_approved: "Representative approved",
    sent_to_admin: "Sent to Admin",
  },
} as const;

function initialDraft(item: FourLRetrospectiveContract): FourLDraftInputContract {
  return {
    rating: item.rating,
    wouldChange: item.wouldChange,
    liked: item.liked,
    lacked: item.lacked,
    learned: item.learned,
    longedFor: item.longedFor,
    needsFollowUp: item.needsFollowUp,
    categories: item.categories,
    biggestObstacle: item.biggestObstacle,
    actionItems: item.actionItems.map(({ ownerName: _ownerName, ...action }) => action),
    acknowledged: item.acknowledged,
  };
}

function SectionCard({
  title,
  hint,
  accent,
  value,
  disabled,
  labels,
  onChange,
}: {
  title: string;
  hint: string;
  accent: string;
  value: FourLSectionContract;
  disabled: boolean;
  labels: (typeof copy)["fa"] | (typeof copy)["en"];
  onChange: (value: FourLSectionContract) => void;
}) {
  return (
    <VStack
      align="stretch"
      gap={2.5}
      p={4}
      border="1px solid"
      borderColor={accent}
      borderRadius="lg"
      bg="var(--apple-surface)"
    >
      <Box>
        <Text fontWeight="900" color="var(--apple-text)">
          {title}
        </Text>
        <Text color="var(--apple-muted)" fontSize="xs" mt={1}>
          {hint}
        </Text>
      </Box>
      <Textarea
        value={value.text}
        disabled={disabled || value.notApplicable}
        onChange={(event) => onChange({ ...value, text: event.target.value })}
        maxLength={1000}
        minH="130px"
        resize="vertical"
        placeholder={labels.placeholder}
        bg="var(--apple-surface-raised)"
      />
      <HStack justify="space-between">
        <Text color="var(--apple-muted)" fontSize="xs">
          {value.text.length} / 1000
        </Text>
        <Checkbox.Root
          checked={value.notApplicable}
          disabled={disabled}
          onCheckedChange={({ checked }) =>
            onChange({ ...value, notApplicable: checked === true })
          }
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label fontSize="xs">{labels.none}</Checkbox.Label>
        </Checkbox.Root>
      </HStack>
    </VStack>
  );
}

function ChoiceButton({
  active,
  disabled,
  emoji,
  label,
  hint,
  color,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  emoji: string;
  label: string;
  hint: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <chakra.button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      p={3}
      minH="104px"
      border="2px solid"
      borderColor={active ? color : "var(--apple-border-soft)"}
      borderRadius="lg"
      bg={active ? "var(--apple-surface-hover)" : "var(--apple-surface)"}
      opacity={disabled ? 0.7 : 1}
      cursor={disabled ? "default" : "pointer"}
    >
      <Text fontSize="2xl" aria-hidden="true">
        {emoji}
      </Text>
      <Text fontWeight="900" mt={1}>
        {label}
      </Text>
      <Text color="var(--apple-muted)" fontSize="11px">
        {hint}
      </Text>
    </chakra.button>
  );
}

function metadataDate(value: string, language: "fa" | "en") {
  return new Intl.DateTimeFormat(language === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function newAction(ownerId: string): FourLActionItemContract {
  const due = new Date();
  due.setDate(due.getDate() + 7);
  return {
    id: globalThis.crypto?.randomUUID?.() || `action-${Date.now()}`,
    description: "",
    ownerId,
    priority: "medium",
    dueDate: due.toISOString().slice(0, 10),
    status: "open",
  };
}

export default function FourLForm({ item }: { item: FourLRetrospectiveContract }) {
  const { language } = useLanguage();
  const labels = copy[language];
  const [draft, setDraft] = useState(() => initialDraft(item));
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [reviewNote, setReviewNote] = useState(item.reviewNote || "");
  const [saveDraft, saveResult] = useSaveFourLDraftMutation();
  const [submit, submitResult] = useSubmitFourLMutation();
  const [requestChanges, requestChangesResult] = useRequestFourLChangesMutation();
  const [approve, approveResult] = useApproveFourLMutation();
  const [sendAdmin, sendAdminResult] = useSendFourLToAdminMutation();
  const [reopen, reopenResult] = useReopenFourLMutation();
  const disabled = !item.capabilities.canEdit || submitting;
  const persistDraft = useCallback(
    (value: FourLDraftInputContract) => {
      const pending = saveQueue.current
        .catch(() => undefined)
        .then(() => saveDraft({ id: item.id, draft: value }).unwrap());
      saveQueue.current = pending;
      return pending;
    },
    [item.id, saveDraft]
  );
  const transitionLoading =
    submitResult.isLoading ||
    requestChangesResult.isLoading ||
    approveResult.isLoading ||
    sendAdminResult.isLoading ||
    reopenResult.isLoading;

  const update = <K extends keyof FourLDraftInputContract>(
    key: K,
    value: FourLDraftInputContract[K]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  useEffect(() => {
    if (!dirty || disabled) return undefined;
    let cancelled = false;
    const timer = globalThis.setTimeout(async () => {
      if (submittingRef.current) return;
      setSaveState("saving");
      try {
        await persistDraft(draft);
        if (!cancelled) {
          setDirty(false);
          setSaveState("saved");
        }
      } catch {
        if (!cancelled) setSaveState("error");
      }
    }, 900);
    return () => {
      cancelled = true;
      globalThis.clearTimeout(timer);
    };
  }, [dirty, disabled, draft, persistDraft]);

  const ratingOptions: Array<{
    value: FourLRating;
    emoji: string;
    label: string;
    hint: string;
    color: string;
  }> = [
    {
      value: "smooth",
      emoji: "😊",
      label: labels.smooth,
      hint: labels.smoothHint,
      color: "#36a269",
    },
    {
      value: "acceptable",
      emoji: "😐",
      label: labels.acceptable,
      hint: labels.acceptableHint,
      color: "#d89c18",
    },
    {
      value: "difficult",
      emoji: "😣",
      label: labels.difficult,
      hint: labels.difficultHint,
      color: "#d64545",
    },
  ];

  const mutateAction = (id: string, changes: Partial<FourLActionItemContract>) =>
    update(
      "actionItems",
      draft.actionItems.map((action) =>
        action.id === id ? { ...action, ...changes } : action
      )
    );

  const validateBeforeSubmit = () => {
    const sections = [draft.liked, draft.lacked, draft.learned, draft.longedFor];
    if (
      !draft.rating ||
      draft.wouldChange === undefined ||
      draft.needsFollowUp === undefined ||
      !draft.categories.length ||
      !draft.acknowledged ||
      sections.some(
        (section) => !section.notApplicable && section.text.trim().length < 3
      ) ||
      (draft.needsFollowUp && draft.actionItems.length === 0)
    ) {
      toast.error(
        language === "fa"
          ? "لطفاً همه بخش‌های الزامی فرم را کامل کنید."
          : "Please complete every required part of the form."
      );
      return false;
    }
    if (
      draft.actionItems.some(
        (action) =>
          action.description.trim().length < 2 || !action.ownerId || !action.dueDate
      )
    ) {
      toast.error(
        language === "fa"
          ? "اطلاعات همه اقدامات عملیاتی را کامل کنید."
          : "Complete every action item."
      );
      return false;
    }
    return true;
  };

  const submitForm = async () => {
    if (submittingRef.current || !validateBeforeSubmit()) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await persistDraft(draft);
      setDirty(false);
      setSaveState("saved");
      await submit(item.id).unwrap();
      toast.success(labels.submitSuccess);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const runReviewAction = async (action: "changes" | "approve" | "admin" | "reopen") => {
    if ((action === "changes" || action === "reopen") && reviewNote.trim().length < 3) {
      toast.error(
        language === "fa" ? "یادداشت بازبینی الزامی است." : "A review note is required."
      );
      return;
    }
    try {
      if (action === "changes") {
        await requestChanges({ id: item.id, note: reviewNote.trim() }).unwrap();
      } else if (action === "approve") {
        await approve({ id: item.id, note: reviewNote.trim() || undefined }).unwrap();
      } else if (action === "admin") {
        await sendAdmin(item.id).unwrap();
      } else {
        await reopen({ id: item.id, note: reviewNote.trim() }).unwrap();
      }
      toast.success(labels.transitionSuccess);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const saveMessage =
    saveState === "saving"
      ? labels.saving
      : saveState === "error"
        ? labels.saveError
        : labels.saved;
  const statusLabel = statusLabels[language][item.status];
  const selectedCategories = useMemo(() => new Set(draft.categories), [draft.categories]);

  return (
    <VStack align="stretch" gap={4} maxW="1500px" mx="auto" pb={8}>
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <Button asChild variant="secondary">
          <Link to="/retrospectives/4l">← {labels.back}</Link>
        </Button>
        <Badge
          bg={
            item.status === FOUR_L_STATUSES.CHANGES_REQUESTED
              ? "var(--apple-danger-bg)"
              : "var(--apple-blue-soft)"
          }
          color={
            item.status === FOUR_L_STATUSES.CHANGES_REQUESTED
              ? "var(--apple-danger-text)"
              : "var(--apple-blue)"
          }
          borderRadius="full"
          px={3}
          py={1.5}
          textTransform="none"
        >
          {statusLabel}
        </Badge>
      </HStack>

      <SimpleGrid
        columns={{ base: 1, lg: 3 }}
        gap={0}
        bg="#0d3f8f"
        color="white"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="var(--surface-shadow)"
      >
        <Box gridColumn={{ lg: "span 2" }} p={{ base: 5, md: 7 }}>
          <Text fontSize={{ base: "xl", md: "3xl" }} fontWeight="950">
            📋 {labels.title}
          </Text>
          <Text mt={2} fontSize={{ base: "sm", md: "lg" }} opacity={0.9}>
            {labels.subtitle}
          </Text>
        </Box>
        <Box
          m={3}
          p={4}
          border="1px solid"
          borderColor="whiteAlpha.300"
          borderRadius="lg"
          bg="whiteAlpha.100"
        >
          <Text fontWeight="900">ⓘ {labels.purposeTitle}</Text>
          <Text mt={1} fontSize="xs" opacity={0.9}>
            {labels.purpose}
          </Text>
        </Box>
      </SimpleGrid>

      {item.reviewNote && (
        <Box
          p={4}
          border="1px solid"
          borderColor="var(--apple-warning-border)"
          bg="var(--apple-warning-bg)"
          borderRadius="lg"
          role="alert"
        >
          <Text fontWeight="900" color="var(--apple-warning-text)">
            {labels.reviewNote}
          </Text>
          <Text mt={1} whiteSpace="pre-wrap">
            {item.reviewNote}
          </Text>
        </Box>
      )}

      <SimpleGrid
        columns={{ base: 1, xl: 2 }}
        gap={4}
        p={4}
        border="1px solid"
        borderColor="var(--apple-border)"
        borderRadius="xl"
        bg="var(--apple-surface-raised)"
      >
        <Box>
          <Text fontWeight="950" fontSize="lg">
            ⚡ {labels.quick}
          </Text>
          <Text color="var(--apple-muted)" fontSize="sm" mb={3}>
            {labels.quickHint}
          </Text>
          <SimpleGrid columns={3} gap={2}>
            {ratingOptions.map((option) => (
              <ChoiceButton
                key={option.value}
                active={draft.rating === option.value}
                disabled={disabled}
                {...option}
                onClick={() => update("rating", option.value)}
              />
            ))}
          </SimpleGrid>
        </Box>
        <VStack justify="center" align="stretch" p={{ base: 0, xl: 5 }}>
          <Text fontWeight="850">{labels.repeat}</Text>
          <RadioGroup.Root
            value={
              draft.wouldChange === undefined ? "" : draft.wouldChange ? "yes" : "no"
            }
            disabled={disabled}
            onValueChange={({ value }) => update("wouldChange", value === "yes")}
          >
            <HStack gap={5} mt={3}>
              {[
                { value: "yes", label: labels.yes },
                { value: "no", label: labels.no },
              ].map((option) => (
                <RadioGroup.Item key={option.value} value={option.value}>
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemControl />
                  <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
                </RadioGroup.Item>
              ))}
            </HStack>
          </RadioGroup.Root>
        </VStack>
      </SimpleGrid>

      <Box
        p={4}
        border="1px solid"
        borderColor="var(--apple-blue-border)"
        borderRadius="xl"
        bg="var(--apple-blue-soft)"
      >
        <Text fontWeight="950" mb={3}>
          🔒 {labels.projectInfo}
        </Text>
        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={2}>
          {[
            [labels.projectId, item.project.letterNumber || item.project.id],
            [labels.projectName, item.project.name],
            [labels.pentester, item.pentester.name],
            [labels.registrationDate, metadataDate(item.createdAt, language)],
          ].map(([label, value]) => (
            <Box
              key={label}
              p={3}
              border="1px solid"
              borderColor="var(--apple-blue-border)"
              borderRadius="lg"
              bg="var(--apple-surface-raised)"
            >
              <Text fontSize="xs" color="var(--apple-muted)">
                {label}
              </Text>
              <Text fontWeight="850" mt={1}>
                {value}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      <Box
        p={3}
        border="1px solid"
        borderColor={
          saveState === "error"
            ? "var(--apple-danger-border)"
            : "var(--apple-success-border)"
        }
        borderRadius="lg"
        bg={saveState === "error" ? "var(--apple-danger-bg)" : "var(--apple-success-bg)"}
        role="status"
      >
        <Text fontSize="sm" fontWeight="750">
          {saveState === "error" ? "⚠" : "✓"} {saveMessage}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
        <SectionCard
          title={labels.liked}
          hint={labels.likedHint}
          accent="#a8dbc0"
          value={draft.liked}
          disabled={disabled}
          labels={labels}
          onChange={(value) => update("liked", value)}
        />
        <SectionCard
          title={labels.lacked}
          hint={labels.lackedHint}
          accent="#ead39b"
          value={draft.lacked}
          disabled={disabled}
          labels={labels}
          onChange={(value) => update("lacked", value)}
        />
        <SectionCard
          title={labels.learned}
          hint={labels.learnedHint}
          accent="#a9c6ee"
          value={draft.learned}
          disabled={disabled}
          labels={labels}
          onChange={(value) => update("learned", value)}
        />
        <SectionCard
          title={labels.longed}
          hint={labels.longedHint}
          accent="#d9bde8"
          value={draft.longedFor}
          disabled={disabled}
          labels={labels}
          onChange={(value) => update("longedFor", value)}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 3 }} gap={4}>
        <Box
          p={4}
          border="1px solid"
          borderColor="var(--apple-blue-border)"
          borderRadius="lg"
        >
          <Text fontWeight="900">◉ {labels.followUp}</Text>
          <Text color="var(--apple-muted)" fontSize="xs" mb={3}>
            {labels.followUpHint}
          </Text>
          <RadioGroup.Root
            value={
              draft.needsFollowUp === undefined ? "" : draft.needsFollowUp ? "yes" : "no"
            }
            disabled={disabled}
            onValueChange={({ value }) => update("needsFollowUp", value === "yes")}
          >
            <VStack align="stretch">
              <RadioGroup.Item value="yes">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl />
                <RadioGroup.ItemText>{labels.followUpYes}</RadioGroup.ItemText>
              </RadioGroup.Item>
              <RadioGroup.Item value="no">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl />
                <RadioGroup.ItemText>{labels.no}</RadioGroup.ItemText>
              </RadioGroup.Item>
            </VStack>
          </RadioGroup.Root>
        </Box>
        <Box p={4} border="1px solid" borderColor="var(--apple-border)" borderRadius="lg">
          <Text fontWeight="900" mb={3}>
            {labels.category}
          </Text>
          <HStack gap={2} flexWrap="wrap">
            {FOUR_L_CATEGORIES.map((category) => {
              const active = selectedCategories.has(category);
              const limitReached = draft.categories.length >= 4 && !active;
              return (
                <chakra.button
                  key={category}
                  type="button"
                  disabled={disabled || limitReached}
                  onClick={() =>
                    update(
                      "categories",
                      active
                        ? draft.categories.filter((item) => item !== category)
                        : [...draft.categories, category]
                    )
                  }
                  px={2.5}
                  py={1.5}
                  border="1px solid"
                  borderColor={active ? "var(--apple-blue)" : "var(--apple-border)"}
                  borderRadius="full"
                  bg={active ? "var(--apple-blue-soft)" : "var(--apple-surface)"}
                  color={active ? "var(--apple-blue)" : "var(--apple-secondary)"}
                  fontSize="xs"
                  fontWeight="750"
                  opacity={limitReached ? 0.5 : 1}
                >
                  {categoryLabels[language][category]}
                </chakra.button>
              );
            })}
          </HStack>
        </Box>
        <Box
          p={4}
          border="1px solid"
          borderColor="var(--apple-danger-border)"
          borderRadius="lg"
          bg="var(--apple-danger-bg)"
        >
          <Text fontWeight="900" color="var(--apple-danger-text)">
            ♨ {labels.obstacle}
          </Text>
          <Text color="var(--apple-muted)" fontSize="xs" mb={2}>
            {labels.obstacleHint}
          </Text>
          <Textarea
            value={draft.biggestObstacle}
            disabled={disabled}
            onChange={(event) => update("biggestObstacle", event.target.value)}
            maxLength={500}
            minH="100px"
            bg="var(--apple-surface-raised)"
            placeholder={labels.placeholder}
          />
          <Text mt={1} fontSize="xs" color="var(--apple-muted)">
            {draft.biggestObstacle.length} / 500
          </Text>
        </Box>
      </SimpleGrid>

      <Box
        p={4}
        border="1px solid"
        borderColor="var(--apple-blue-border)"
        borderRadius="xl"
        bg="var(--apple-surface-raised)"
      >
        <Text fontWeight="950" fontSize="lg">
          ◆ {labels.actions}
        </Text>
        <Text color="var(--apple-muted)" fontSize="sm" mb={3}>
          {labels.actionsHint}
        </Text>
        <VStack align="stretch" gap={2}>
          {draft.actionItems.map((action, index) => (
            <SimpleGrid
              key={action.id}
              columns={{ base: 1, xl: 12 }}
              gap={2}
              p={3}
              border="1px solid"
              borderColor="var(--apple-border-soft)"
              borderRadius="lg"
              bg="var(--apple-surface-subtle)"
            >
              <Field.Root gridColumn={{ xl: "span 4" }}>
                <Field.Label fontSize="xs">
                  {index + 1}. {labels.description}
                </Field.Label>
                <Input
                  value={action.description}
                  disabled={disabled}
                  maxLength={500}
                  onChange={(event) =>
                    mutateAction(action.id, { description: event.target.value })
                  }
                />
              </Field.Root>
              <Field.Root gridColumn={{ xl: "span 2" }}>
                <Field.Label fontSize="xs">{labels.owner}</Field.Label>
                <NativeSelect.Root disabled={disabled}>
                  <NativeSelect.Field
                    value={action.ownerId}
                    onChange={(event) =>
                      mutateAction(action.id, { ownerId: event.target.value })
                    }
                  >
                    <option value="">—</option>
                    {item.participants.map((participant) => (
                      <option key={participant.id} value={participant.id}>
                        {participant.name}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
              <Field.Root gridColumn={{ xl: "span 2" }}>
                <Field.Label fontSize="xs">{labels.priority}</Field.Label>
                <NativeSelect.Root disabled={disabled}>
                  <NativeSelect.Field
                    value={action.priority}
                    onChange={(event) =>
                      mutateAction(action.id, {
                        priority: event.target
                          .value as FourLActionItemContract["priority"],
                      })
                    }
                  >
                    <option value="low">{labels.low}</option>
                    <option value="medium">{labels.medium}</option>
                    <option value="high">{labels.high}</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
              <Field.Root gridColumn={{ xl: "span 2" }}>
                <Field.Label fontSize="xs">{labels.due}</Field.Label>
                <Input
                  type="date"
                  value={action.dueDate.slice(0, 10)}
                  disabled={disabled}
                  onChange={(event) =>
                    mutateAction(action.id, { dueDate: event.target.value })
                  }
                />
              </Field.Root>
              <Field.Root gridColumn={{ xl: "span 2" }}>
                <Field.Label fontSize="xs">{labels.status}</Field.Label>
                <NativeSelect.Root disabled={disabled}>
                  <NativeSelect.Field
                    value={action.status}
                    onChange={(event) =>
                      mutateAction(action.id, {
                        status: event.target.value as FourLActionItemContract["status"],
                      })
                    }
                  >
                    <option value="open">{labels.open}</option>
                    <option value="in_progress">{labels.inProgress}</option>
                    <option value="done">{labels.done}</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
              {!disabled && (
                <HStack gridColumn={{ xl: "1 / -1" }} justify="end">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={draft.actionItems.length >= 20}
                    onClick={() =>
                      update("actionItems", [
                        ...draft.actionItems,
                        {
                          ...action,
                          id: globalThis.crypto?.randomUUID?.() || `action-${Date.now()}`,
                        },
                      ])
                    }
                  >
                    {labels.duplicate}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() =>
                      update(
                        "actionItems",
                        draft.actionItems.filter((item) => item.id !== action.id)
                      )
                    }
                  >
                    {labels.delete}
                  </Button>
                </HStack>
              )}
            </SimpleGrid>
          ))}
          {!disabled && (
            <Button
              type="button"
              variant="secondary"
              disabled={draft.actionItems.length >= 20}
              onClick={() =>
                update("actionItems", [
                  ...draft.actionItems,
                  newAction(item.participants[0]?.id || item.pentester.id),
                ])
              }
            >
              + {labels.addAction}
            </Button>
          )}
        </VStack>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={3}>
        <Box
          p={4}
          border="1px solid"
          borderColor="var(--apple-success-border)"
          borderRadius="lg"
          bg="var(--apple-success-bg)"
        >
          <Text fontWeight="900">🛡 {labels.acknowledgement}</Text>
          <Checkbox.Root
            mt={3}
            checked={draft.acknowledged}
            disabled={disabled}
            onCheckedChange={({ checked }) => update("acknowledged", checked === true)}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label fontSize="sm">{labels.acknowledgementText}</Checkbox.Label>
          </Checkbox.Root>
        </Box>
        <Box
          p={4}
          border="1px solid"
          borderColor="var(--apple-blue-border)"
          borderRadius="lg"
          bg="var(--apple-blue-soft)"
        >
          <Text fontWeight="900">♧ {labels.retro}</Text>
          <Text fontSize="sm" mt={2}>
            {labels.retroText}
          </Text>
        </Box>
        <VStack
          align="stretch"
          justify="center"
          p={4}
          borderRadius="lg"
          bg="#0d3f8f"
          color="white"
        >
          {item.capabilities.canSubmit ? (
            <>
              <Text fontSize="xs" opacity={0.85}>
                {labels.submitHint}
              </Text>
              <Button
                type="button"
                bg="white"
                color="#0d3f8f"
                isLoading={submitting || saveResult.isLoading || submitResult.isLoading}
                onClick={() => void submitForm()}
              >
                {labels.submit}
              </Button>
            </>
          ) : (
            <Text fontWeight="800">{labels.readOnly}</Text>
          )}
        </VStack>
      </SimpleGrid>

      {(item.capabilities.canRequestChanges ||
        item.capabilities.canApprove ||
        item.capabilities.canSendToAdmin ||
        item.capabilities.canReopen) && (
        <Box
          p={5}
          border="2px solid"
          borderColor="var(--apple-blue-border)"
          borderRadius="xl"
          bg="var(--apple-surface-raised)"
        >
          <Text fontSize="lg" fontWeight="950">
            🔎 {labels.review}
          </Text>
          {(item.capabilities.canRequestChanges ||
            item.capabilities.canApprove ||
            item.capabilities.canReopen) && (
            <Textarea
              mt={3}
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              maxLength={2000}
              minH="110px"
              placeholder={labels.reviewPlaceholder}
            />
          )}
          <HStack mt={3} gap={2} flexWrap="wrap">
            {item.capabilities.canRequestChanges && (
              <Button
                variant="danger"
                disabled={transitionLoading}
                onClick={() => void runReviewAction("changes")}
              >
                {labels.requestChanges}
              </Button>
            )}
            {item.capabilities.canApprove && (
              <Button
                disabled={transitionLoading}
                onClick={() => void runReviewAction("approve")}
              >
                {labels.approve}
              </Button>
            )}
            {item.capabilities.canSendToAdmin && (
              <Button
                disabled={transitionLoading}
                onClick={() => void runReviewAction("admin")}
              >
                {labels.sendAdmin}
              </Button>
            )}
            {item.capabilities.canReopen && (
              <Button
                variant="danger"
                disabled={transitionLoading}
                onClick={() => void runReviewAction("reopen")}
              >
                {labels.reopen}
              </Button>
            )}
          </HStack>
        </Box>
      )}

      <SimpleGrid
        columns={{ base: 2, lg: 4 }}
        gap={2}
        p={3}
        border="1px solid"
        borderColor="var(--apple-border)"
        borderRadius="lg"
      >
        <Box textAlign="center">
          <Text fontSize="xs" color="var(--apple-muted)">
            {labels.status}
          </Text>
          <Text fontWeight="850">{statusLabel}</Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize="xs" color="var(--apple-muted)">
            4L
          </Text>
          <Text fontWeight="850">{draft.acknowledged ? "✓" : "—"}</Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize="xs" color="var(--apple-muted)">
            {labels.actions}
          </Text>
          <Text fontWeight="850">{draft.actionItems.length}</Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize="xs" color="var(--apple-muted)">
            {labels.projectName}
          </Text>
          <Text fontWeight="850" lineClamp={1}>
            {item.project.name}
          </Text>
        </Box>
      </SimpleGrid>
    </VStack>
  );
}
