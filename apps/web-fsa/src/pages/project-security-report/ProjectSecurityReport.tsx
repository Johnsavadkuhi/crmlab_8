import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useGetProjectQuery } from "@/entities/project/api/projectsApi";
import LoadingScreen from "@/shared/ui/feedback/LoadingScreen";
import ErrorState from "@/shared/ui/feedback/ErrorState";
import OriginalSecurityReport from "./original/OriginalSecurityReport";
import originalReportCss from "./original/originalReport.css?inline";
import { buildPersianTranslationMap } from "./original/originalReportFaTranslations";

function OriginalReportFrame({ children, locale }: { children: ReactNode; locale: "en" | "fa" }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;

    const initialize = () => {
      const doc = frame.contentDocument;
      if (!doc) return;

      doc.open();
      doc.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Security Engineering Report</title></head><body><div id="original-security-report-root"></div></body></html>`);
      doc.close();

      const style = doc.createElement("style");
      style.id = "original-security-report-css";
      style.textContent = originalReportCss;
      doc.head.appendChild(style);

      setMountNode(doc.getElementById("original-security-report-root"));
    };

    initialize();
    return () => setMountNode(null);
  }, []);

  useEffect(() => {
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    if (!doc || !mountNode) return;

    doc.documentElement.lang = locale === "fa" ? "fa" : "en";
    doc.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
    doc.body.dir = locale === "fa" ? "rtl" : "ltr";
    doc.title = locale === "fa" ? "گزارش مهندسی امنیت" : "Security Engineering Report";

    const oldOverride = doc.getElementById("original-report-fa-overrides");
    oldOverride?.remove();
    if (locale === "fa") {
      const override = doc.createElement("style");
      override.id = "original-report-fa-overrides";
      override.textContent = `
        body {
          direction: rtl;
          font-family: Tahoma, "Vazirmatn", "Segoe UI", sans-serif;
        }
        .sidebar {
          inset: 0 0 0 auto;
          border-right: 0;
          border-left: 1px solid rgba(255,255,255,.06);
        }
        .sidebar-foot { right: 24px; left: auto; }
        .sidebar nav a, .brand, .topbar, .top-actions, .section-heading,
        .report-page, .meta, .card, .callout, .method, .principle,
        .finding-head, .wstg-head, .finding-body, .wstg-body,
        .table-wrap th, .table-wrap td, .kv dt, .kv dd { text-align: right; }
        .main { margin-left: 0; margin-right: 270px; }
        .export-popover { right: auto; left: 0; }
        .report-page ul, .report-page ol { padding-left: 0; padding-right: 18px; }
        .numbered li { padding: 0 30px 10px 0; }
        .numbered li:before { left: auto; right: 0; }
        .callout { border-left: 0; border-right: 3px solid #087f5b; }
        .requirement { border-left: 0; border-right: 3px solid #026aa2; }
        .metric { padding: 15px 52px 15px 14px; }
        .metric-icon { left: auto; right: 13px; }
        .metric-grid.compact .metric { padding-right: 14px; }
        .root-card>div:first-child { padding-right: 0; padding-left: 60px; }
        .root-card>.severity { right: auto; left: 12px; }
        .code-panel, .code-panel pre, code, pre, [dir="ltr"] {
          direction: ltr;
          text-align: left;
          unicode-bidi: isolate;
        }
        .cover-kicker, .section-heading p, .sidebar-foot, .eyebrow,
        .meta span, .cover-signoff span, .classification-strip { letter-spacing: 0; }
        .section-heading h2 { letter-spacing: 0; }
        @media(max-width:1050px) {
          .sidebar { transform: translateX(100%); }
          .sidebar.open { transform: none; }
          .main { margin-right: 0; margin-left: 0; width: 100%; }
        }
        @media print {
          .main { margin-right: 0 !important; margin-left: 0 !important; }
        }
      `;
      doc.head.appendChild(override);

      const translations = buildPersianTranslationMap();
      const translateTree = (root: Node) => {
        const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node: Node | null = walker.nextNode();
        while (node) {
          const parent = node.parentElement;
          if (parent?.closest('[data-source-literal="true"]')) {
            node = walker.nextNode();
            continue;
          }
          const raw = node.nodeValue || "";
          const key = raw.trim();
          const translated = translations.get(key);
          if (translated && key) node.nodeValue = raw.replace(key, translated);
          node = walker.nextNode();
        }
      };
      translateTree(mountNode);
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const added of Array.from(mutation.addedNodes)) translateTree(added);
        }
      });
      observer.observe(mountNode, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, [locale, mountNode]);

  return (
    <iframe
      ref={iframeRef}
      title="Security Engineering Report"
      style={{ width: "100%", height: "100vh", border: 0, display: "block", background: "#e9edf3" }}
    >
      {mountNode ? createPortal(children, mountNode) : null}
    </iframe>
  );
}

export default function ProjectSecurityReport() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useGetProjectQuery(projectId || "", { skip: !projectId });
  const [locale, setLocale] = useState<"en" | "fa">("fa");

  if (isLoading) return <LoadingScreen text="در حال بارگذاری گزارش امنیتی..." />;
  if (error) return <ErrorState error={error} />;
  if (!project) return <div dir="rtl">پروژه برای تولید گزارش قابل بارگذاری نیست.</div>;

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/projects");
  };

  const runtimeProjectMeta = {
    project: project.name,
    projectId: project.id,
    assessmentId: `ASM-${project.id}`,
    reportId: `SER-${project.id}`,
    client: project.name,
    version: project.version || "1.0",
    reportDate: new Date().toISOString().slice(0, 10),
    reportStatus: `FINAL — ${String(project.status || "PROJECT").toUpperCase()}`,
  };

  return (
    <OriginalReportFrame locale={locale}>
      <OriginalSecurityReport key={locale} projectMeta={runtimeProjectMeta} onBack={goBack} locale={locale} onToggleLocale={() => setLocale(locale === "en" ? "fa" : "en")} />
    </OriginalReportFrame>
  );
}
