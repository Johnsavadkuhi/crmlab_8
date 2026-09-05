import { attackChains, categorySummary, executiveText, findings, rootCauses, wstgRecords } from "../reportData";

const staticPairs: [string, string][] = [
  ["Back to CRM", "بازگشت به CRM"],
  ["Full Report", "گزارش کامل"], ["Executive View", "نمای مدیریتی"], ["Technical Report", "گزارش فنی"], ["Evidence Annex", "پیوست شواهد"],
  ["Print / PDF", "چاپ / PDF"], ["Export", "خروجی"], ["Complete JSON", "JSON کامل"], ["Findings CSV", "CSV یافته‌ها"], ["WSTG CSV", "CSV آزمون‌های WSTG"], ["PoC CSV", "CSV اثبات مفهوم"], ["Evidence Manifest", "فهرست شواهد"], ["Standalone HTML", "HTML مستقل"], ["Markdown Summary", "خلاصه Markdown"],
  ["Controlled engineering record", "رکورد کنترل‌شده مهندسی"], ["Standards baseline", "خط مبنای استانداردها"],
  ["Document Control & Governance", "کنترل سند و حاکمیت"], ["Executive Summary", "خلاصه مدیریتی"], ["Assessment Context & Objectives", "زمینه و اهداف ارزیابی"], ["Scope & Rules of Engagement", "محدوده و قواعد اجرا"], ["Methodology & Scientific Assurance", "روش‌شناسی و اطمینان علمی"], ["Standards Baseline", "خط مبنای استانداردها"], ["Risk Assessment Method", "روش ارزیابی ریسک"], ["Security Coverage Matrix", "ماتریس پوشش امنیت"], ["Findings Summary", "خلاصه یافته‌ها"], ["Detailed Security Findings", "یافته‌های امنیتی تفصیلی"], ["OWASP WSTG Test Execution Register", "دفتر اجرای آزمون‌های OWASP WSTG"], ["Attack Chain Analysis", "تحلیل زنجیره حمله"], ["Systemic Root Cause Analysis", "تحلیل علل ریشه‌ای سیستمی"], ["Remediation Roadmap", "نقشه راه اصلاح"], ["Limitations & Assurance Statement", "محدودیت‌ها و بیانیه اطمینان"], ["Technical Evidence Annex", "پیوست فنی شواهد"], ["Registers, Glossary & Data Dictionary", "دفاتر، واژه‌نامه و فرهنگ داده"],
  ["Table of Contents", "فهرست مطالب"], ["Controlled report structure.", "ساختار کنترل‌شده گزارش."],
  ["Organization", "سازمان"], ["Laboratory", "آزمایشگاه"], ["Project", "پروژه"], ["Project ID", "شناسه پروژه"], ["Assessment ID", "شناسه ارزیابی"], ["Report ID", "شناسه گزارش"], ["Version", "نسخه"], ["Status", "وضعیت"], ["Assessment Period", "بازه ارزیابی"], ["Report Date", "تاریخ گزارش"], ["Classification", "طبقه‌بندی"], ["Prepared by", "تهیه‌کننده"], ["Reviewed by", "بازبینی‌کننده"], ["Approved by", "تأییدکننده"], ["Overall organizational risk", "ریسک کلی سازمانی"],
  ["Assessment Conclusion", "نتیجه ارزیابی"], ["Finding Distribution", "توزیع یافته‌ها"], ["Immediate Management Actions", "اقدامات فوری مدیریتی"], ["Key Findings", "یافته‌های کلیدی"], ["Business Context", "زمینه کسب‌وکار"], ["Security Context", "زمینه امنیتی"], ["Assessment Objectives", "اهداف ارزیابی"], ["Architecture & Trust Boundaries", "معماری و مرزهای اعتماد"], ["In-Scope Asset Register", "فهرست دارایی‌های داخل محدوده"], ["Roles Exercised", "نقش‌های آزموده‌شده"], ["Source Review Baseline", "خط مبنای بازبینی کد"], ["Out of Scope", "خارج از محدوده"], ["Stop Conditions", "شرایط توقف"], ["Rules of Engagement", "قواعد اجرا"],
  ["Scientific Security Reporting Principles", "اصول علمی گزارش‌دهی امنیت"], ["Traceability Backbone", "ستون فقرات قابلیت ردیابی"], ["Version Pinning Rule", "قاعده تثبیت نسخه استاندارد"], ["Tools & Instrumentation Register", "دفتر ابزارها و تجهیزات آزمون"], ["Core Rule", "قاعده اصلی"], ["Technical Severity", "شدت فنی"], ["Organizational Risk", "ریسک سازمانی"], ["Decision Factors", "عوامل تصمیم‌گیری"], ["Risk Acceptance Governance", "حاکمیت پذیرش ریسک"],
  ["WSTG Category Coverage", "پوشش دسته‌های WSTG"], ["Authorization Role × Technique Coverage", "پوشش نقش × تکنیک مجوزدهی"], ["PASS Semantics", "معنای PASS"], ["Closure Rule", "قاعده بستن یافته"], ["Limitations", "محدودیت‌ها"], ["Assumptions", "فرضیات"], ["Laboratory Assurance Statement", "بیانیه اطمینان آزمایشگاه"], ["Report-Level Audit Trail", "ردپای ممیزی سطح گزارش"],
  ["Applicability Rationale", "دلیل قابل‌اعمال بودن"], ["Test Hypotheses", "فرضیه‌های آزمون"], ["Objective", "هدف"], ["Not Applicable", "غیرقابل اعمال"], ["Hypothesis", "فرضیه"], ["Preconditions", "پیش‌شرط‌ها"], ["Procedure", "روش اجرا"], ["Expected Result", "نتیجه مورد انتظار"], ["Actual Result", "نتیجه واقعی"], ["Request Evidence", "شواهد Request"], ["Response Evidence", "شواهد Response"], ["Evidence Records", "رکوردهای شواهد"],
  ["Classification & Traceability", "طبقه‌بندی و قابلیت ردیابی"], ["Affected Asset", "دارایی متاثر"], ["Security Requirement", "الزام امنیتی"], ["Observation", "مشاهده"], ["Expected vs Actual", "مورد انتظار در برابر واقعی"], ["Reproduction Procedure", "روش بازتولید"], ["PoC & Evidence Linkage", "ارتباط PoC و شواهد"], ["Technical Analysis", "تحلیل فنی"], ["Root Cause", "علت ریشه‌ای"], ["Exploitability", "قابلیت بهره‌برداری"], ["Attack Path", "مسیر حمله"], ["Technical Impact", "اثر فنی"], ["Business Impact", "اثر کسب‌وکاری"], ["Technical Severity — CVSS", "شدت فنی — CVSS"], ["Threat / Exploitation Context", "زمینه تهدید / بهره‌برداری"], ["Confidence & Independent Validation", "اطمینان و اعتبارسنجی مستقل"], ["Remediation Engineering", "مهندسی اصلاح"], ["Secure Design Requirement", "الزام طراحی امن"], ["Verification Criteria", "معیارهای راستی‌آزمایی"], ["Detection & Monitoring", "کشف و پایش"], ["Retest Record", "رکورد Retest"], ["Residual Risk / Acceptance", "ریسک باقی‌مانده / پذیرش"], ["Finding Audit Trail", "ردپای ممیزی یافته"],
  ["Critical", "بحرانی"], ["High", "بالا"], ["Medium", "متوسط"], ["Low", "پایین"], ["Extreme", "بسیار شدید"], ["Moderate", "متوسط"], ["PASS", "موفق"], ["FAIL", "ناموفق"], ["PARTIAL", "ناقص"], ["N/A", "نامرتبط"], ["Applicable", "قابل اعمال"], ["Tester / Reviewer", "آزمونگر / بازبین"], ["Execution Date", "تاریخ اجرا"], ["Finding", "یافته"], ["PoCs", "PoCها"], ["Evidence", "شواهد"], ["Limitation", "محدودیت"], ["Confidence", "اطمینان"], ["Reproduction", "بازتولید"], ["Role", "نقش"], ["Endpoint", "Endpoint"],
  ["This report is a controlled engineering record.", "این گزارش یک رکورد مهندسی کنترل‌شده است."],
  ["A PASS means no vulnerable behavior was observed under the recorded test conditions. It does not mean the application is globally secure, and a PASS cannot be issued without a traceable execution record in this framework.", "PASS فقط یعنی در شرایط ثبت‌شده آزمون رفتار آسیب‌پذیر مشاهده نشده است؛ این نتیجه به معنای امنیت مطلق برنامه نیست و در این چارچوب بدون رکورد اجرای قابل ردیابی صادر نمی‌شود."],
];

export function buildPersianTranslationMap() {
  const map = new Map<string, string>(staticPairs);
  for (const c of categorySummary) map.set(c.name.en, c.name.fa);
  for (const w of wstgRecords) {
    map.set(w.title.en, w.title.fa); map.set(w.categoryName.en, w.categoryName.fa); map.set(w.objective.en, w.objective.fa); map.set(w.limitation.en, w.limitation.fa);
    for (const p of w.pocs) {
      map.set(p.hypothesis.en, p.hypothesis.fa); map.set(p.expected.en, p.expected.fa); map.set(p.actual.en, p.actual.fa);
      for (const x of p.procedure) map.set(x.en, x.fa);
    }
  }
  for (const f of findings) {
    map.set(f.title.en, f.title.fa); map.set(f.observation.en, f.observation.fa); map.set(f.expected.en, f.expected.fa); map.set(f.actual.en, f.actual.fa); map.set(f.rootCause.en, f.rootCause.fa); map.set(f.technicalAnalysis.en, f.technicalAnalysis.fa); map.set(f.businessImpact.en, f.businessImpact.fa); map.set(f.blastRadius.en, f.blastRadius.fa); map.set(f.remediation.en, f.remediation.fa);
    for (const x of f.verification) map.set(x.en, x.fa); for (const x of f.attackPath) map.set(x.en, x.fa);
  }
  for (const c of attackChains) { map.set(c.title.en, c.title.fa); map.set(c.impact.en, c.impact.fa); }
  for (const r of rootCauses) { map.set(r.title.en, r.title.fa); map.set(r.action.en, r.action.fa); }
  map.set(executiveText.purpose.en, executiveText.purpose.fa); map.set(executiveText.assurance.en, executiveText.assurance.fa);
  return map;
}
