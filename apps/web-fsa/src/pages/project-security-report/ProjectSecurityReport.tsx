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

    const oldOverride = doc.getElementById("original-report-fa-overrides");
    oldOverride?.remove();
    if (locale === "fa") {
      const override = doc.createElement("style");
      override.id = "original-report-fa-overrides";
      override.textContent = `
        body { direction: rtl; }
        .data-table th, .data-table td, .finding-head, .wstg-head { text-align: right; }
        .code-panel, .code-panel pre, code, pre { direction: ltr; text-align: left; unicode-bidi: isolate; }
        .cover-kicker, .section-heading p, .sidebar-foot, .eyebrow { letter-spacing: 0; }
      `;
      doc.head.appendChild(override);

      const translations = buildPersianTranslationMap();
      const translateTree = (root: Node) => {
        const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node: Node | null = walker.nextNode();
        while (node) {
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
  const [locale, setLocale] = useState<"en" | "fa">("en");

  if (isLoading) return <LoadingScreen text="Loading security report..." />;
  if (error) return <ErrorState error={error} />;
  if (!project) return <div>Project could not be loaded.</div>;

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
