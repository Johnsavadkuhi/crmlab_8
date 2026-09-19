import React, { useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, Archive, BookOpen, CheckCircle2, ChevronDown, ChevronRight, ArrowLeft,
  ClipboardCheck, Download, FileJson, FileText, Fingerprint, Gauge, GitBranch,
  LockKeyhole, Menu, Printer, Search, ShieldAlert, ShieldCheck, Target,
  TestTube2, Network, Database, Eye, Wrench, RefreshCw, FileCheck2,
  ListChecks, Scale, Boxes, Radar, Workflow, FileSearch, UserCheck
} from 'lucide-react';
import {
  reportMeta, documentControl, assessmentContext, objectives, assets, scope,
  rulesOfEngagement, stopConditions, methodology, scientificPrinciples, standards,
  tools, riskMethodology, categories, wstgItems, testCaseRegister, evidenceIndex,
  findings, attackChains, systemicRootCauses, remediationRoadmap,
  authorizationCoverage, limitations, assumptions, assuranceStatement, glossary,
  dataDictionary, reportAuditTrail, exportBundle
} from './originalReportExtras';
import { buildPersianTranslationMap } from './originalReportFaTranslations';
import {
  officialDocumentProfile, reportQualityControl, assessmentPersonnelHistory, publicationRights,
  assessmentBasisAndRiskDefinitions, severityDefinitionRows, documentAccessControl,
  vulnerabilityIdentification, vulnerabilityIdentificationMethods,
  testItemStructureSource, testItemStructure, cvss31Reference,
  testOutcomeAndHardeningSource, penetrationTestApproachSource,
  iso15408_2026Baseline, iso15408_2026FunctionalClasses, iso15408LegacyBaseFamilyResults,
  iso15408LegacyExtendedRequirements, iso15408_2026StandardsResearchAudit,
  owaspWstgIso15408Crosswalk2026, owaspWstgIso15408CrosswalkAudit
} from './officialReportSourceData';

const slug = v => String(v || '').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
const verdictClass = v => `badge verdict-${slug(v)}`;
const severityClass = v => `severity severity-${slug(v)}`;
const riskClass = v => `risk-pill risk-${slug(v)}`;
const FA_TEXT = buildPersianTranslationMap();
const localize = (locale: 'en' | 'fa', value: unknown) => {
  const text = value == null ? '' : String(value);
  return locale === 'fa' ? (FA_TEXT.get(text) || text) : text;
};
const fromMap = (map: Record<string,string>, value: unknown) => {
  const key = String(value ?? '');
  return map[key] || key;
};
const faSeverity = (value: unknown) => fromMap({Critical:'بحرانی',High:'بالا',Medium:'متوسط',Low:'پایین'}, value);
const faRisk = (value: unknown) => fromMap({EXTREME:'بسیار شدید',Extreme:'بسیار شدید',HIGH:'بالا',High:'بالا',Moderate:'متوسط',MODERATE:'متوسط',Low:'پایین',LOW:'پایین'}, value);
const faStatus = (value: unknown) => fromMap({Open:'باز',Draft:'پیش‌نویس',Review:'بازبینی',Final:'نهایی',Prepared:'تهیه‌شده',Reviewed:'بازبینی‌شده',Approved:'تأییدشده',Acknowledged:'تأیید دریافت',Confirmed:'تأییدشده','NOT TESTED':'آزمون‌نشده','NOT REQUESTED':'درخواست‌نشده',PENDING:'در انتظار'}, value);
const faClassification = (value: unknown) => fromMap({CONFIDENTIAL:'محرمانه',Confidential:'محرمانه',RESTRICTED:'محدود',Restricted:'محدود',INTERNAL:'داخلی',Internal:'داخلی',PUBLIC:'عمومی',Public:'عمومی'}, value);

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function escapeCsv(value) {
  const s = value == null ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
}
function csvDownload(name, headers, rows) {
  const csv = [headers, ...rows].map(r=>r.map(escapeCsv).join(',')).join('\n');
  downloadBlob(name, csv, 'text/csv;charset=utf-8');
}

const TOC = [
  ['F1','Official Document Profile','official-document-profile'],
  ['F2','Report Quality Control','report-quality-control'],
  ['F3','Assessment Team & Timeline','assessment-team-timeline'],
  ['F4','Copyright & Publication Rights','publication-rights'],
  ['F5','Assessment Basis & Risk Definitions','assessment-basis-risk-definitions'],
  ['F6','Document Access Control & Vulnerability Identification','document-access-identification'],
  ['F7','Test Item Structure & CVSS Reference','test-structure-cvss'],
  ['F8','CVSS 3.1 Parameter Values','cvss31-parameter-values'],
  ['F9','Test Result, Evidence & Hardening','test-result-evidence-hardening'],
  ['F10','Penetration Test Approach & Assessment Team Location','penetration-test-approach-location'],
  ['F11','ISO/IEC 15408:2026 Functional Requirements Baseline','iso15408-2026-requirements'],
  ['F12','OWASP WSTG ↔ ISO/IEC 15408:2026 Traceability','wstg-iso15408-traceability'],
  ['01','Document Control & Governance','document-control'],['02','Executive Summary','executive'],
  ['03','Assessment Context & Objectives','context'],['04','Scope & Rules of Engagement','scope'],
  ['05','Methodology & Scientific Assurance','methodology'],['06','Standards Baseline','standards'],
  ['07','Risk Assessment Method','risk-method'],['08','Security Coverage Matrix','coverage-matrix'],
  ['09','Findings Summary','findings-summary'],['10','Detailed Findings','findings'],
  ['11','OWASP WSTG Test Execution Register','wstg'],['12','Attack Chain Analysis','attack-chains'],
  ['13','Systemic Root Causes','root-causes'],['14','Remediation Roadmap','roadmap'],
  ['15','Limitations & Assurance','limitations'],['A','Evidence Annex','evidence'],
  ['B','Registers & Data Dictionary','registers']
];

const MAIN_REPORT_TOC_IDS = new Set([
  'official-document-profile','report-quality-control','assessment-team-timeline','publication-rights',
  'assessment-basis-risk-definitions','document-access-identification','test-structure-cvss','cvss31-parameter-values',
  'test-result-evidence-hardening','penetration-test-approach-location','iso15408-2026-requirements','wstg-iso15408-traceability',
  'document-control','executive','risk-method','coverage-matrix','findings-summary','findings','limitations','registers'
]);
const EXECUTIVE_REPORT_TOC_IDS = new Set([
  'official-document-profile','report-quality-control','assessment-team-timeline','publication-rights',
  'document-control','executive','limitations'
]);
const ANNEX_TOC = [
  ['F1','Official Document Profile','official-document-profile'],
  ['A','Evidence Annex','evidence']
];
const MANAGEMENT_TOC = [
  ['F1','Official Document Profile','official-document-profile'],
  ['M1','Management Security Posture','management-posture'],
  ['M2','Priority Risks & Business Impact','management-risks'],
  ['M3','Assessment Coverage & Assurance','management-coverage'],
  ['M4','Management Action Plan','management-actions'],
  ['M5','Management Decisions & Risk Governance','management-decisions'],
  ['M6','Management Limitations & Assurance','management-assurance']
];

const ISO15408_LEGACY_PASS = new Set(iso15408LegacyBaseFamilyResults.pass);
const ISO15408_LEGACY_FAIL = new Set(iso15408LegacyBaseFamilyResults.fail);

function iso15408FamilyStatus(code: string, locale: 'en' | 'fa') {
  if (ISO15408_LEGACY_PASS.has(code)) return { label: locale === 'fa' ? 'PASS قدیمی — نیازمند بازتأیید 2026' : 'Legacy PASS — revalidation required', className: 'badge verdict-pass' };
  if (ISO15408_LEGACY_FAIL.has(code)) return { label: locale === 'fa' ? 'FAIL قدیمی — نیازمند بازتأیید 2026' : 'Legacy FAIL — revalidation required', className: 'badge verdict-fail' };
  return { label: locale === 'fa' ? 'نیازمند ارزیابی / تعیین قابلیت اعمال' : 'Assessment / applicability pending', className: 'badge verdict-na' };
}

export default function OriginalSecurityReport({ projectMeta, onBack, locale, onToggleLocale }: { projectMeta?: Record<string, unknown>; onBack: () => void; locale: "en" | "fa"; onToggleLocale: () => void }){
  const liveReportMeta = useMemo(() => ({ ...reportMeta, ...(projectMeta || {}) }), [projectMeta]);
  const [view,setView] = useState('full');
  const [sidebarOpen,setSidebarOpen] = useState(false);
  const [query,setQuery] = useState('');
  const [category,setCategory] = useState('ALL');
  const [verdict,setVerdict] = useState('ALL');
  const [expandedTests,setExpandedTests] = useState(new Set(['WSTG-ATHZ-04','WSTG-INPV-05']));
  const [expandedFindings,setExpandedFindings] = useState(new Set(['SEC-001']));

  const metrics = useMemo(()=>{
    const applicable = wstgItems.filter(x=>x.applicable==='YES');
    const executed = applicable.filter(x=>x.pocCount>0).length;
    return {
      total:wstgItems.length,
      applicable:applicable.length,
      executed,
      pass:wstgItems.filter(x=>x.verdict==='PASS').length,
      fail:wstgItems.filter(x=>x.verdict==='FAIL').length,
      partial:wstgItems.filter(x=>x.verdict==='PARTIAL').length,
      na:wstgItems.filter(x=>x.verdict==='N/A').length,
      pocs:wstgItems.reduce((n,x)=>n+x.pocCount,0),
      evidence:evidenceIndex.length,
      coverage:Math.round((executed/Math.max(applicable.length,1))*1000)/10,
      critical:findings.filter(x=>x.severity==='Critical').length,
      high:findings.filter(x=>x.severity==='High').length,
      medium:findings.filter(x=>x.severity==='Medium').length
    };
  },[]);

  const filteredTests = useMemo(()=>{
    const q=query.trim().toLowerCase();
    return wstgItems.filter(t=>{
      const hay=[t.id,t.versionedId,t.title,t.categoryName,t.asset,t.findingId,...t.pocs.map(p=>p.id),...t.hypotheses].filter(Boolean).join(' ').toLowerCase();
      return (!q||hay.includes(q)) && (category==='ALL'||t.category===category) && (verdict==='ALL'||t.verdict===verdict);
    });
  },[query,category,verdict]);

  const isAnnexReport = view==='annex';
  const isManagementReport = view==='management';
  const showCore = view==='full'||view==='executive'||view==='technical';
  const showPrimaryTechnical = view==='full'||view==='technical';
  const showSupplementaryTechnical = view==='technical';
  const showRegisters = view==='full'||view==='technical';
  const showAnnex = isAnnexReport;
  const visibleToc = isAnnexReport
    ? ANNEX_TOC
    : isManagementReport
      ? MANAGEMENT_TOC
      : view==='full'
        ? TOC.filter(([, , id])=>MAIN_REPORT_TOC_IDS.has(id))
        : view==='executive'
          ? TOC.filter(([, , id])=>EXECUTIVE_REPORT_TOC_IDS.has(id))
          : TOC.filter(([, , id])=>id!=='evidence');

  function toggleSet(setter,id){ setter(prev=>{const n=new Set(prev);if(n.has(id)) n.delete(id); else n.add(id);return n;}); }
  function exportJson(){downloadBlob(`${liveReportMeta.reportId}.json`,JSON.stringify({ ...exportBundle, reportMeta: liveReportMeta },null,2),'application/json');}
  function exportTestsCsv(){csvDownload('wstg-test-execution-register.csv',['WSTG ID','Versioned ID','Category','Title','Applicable','Asset','Tester','Reviewer','Date','Verdict','PoCs','Evidence','Finding','Limitation'],testCaseRegister.map(x=>[x.testId,x.versionedId,x.category,x.title,x.applicable,x.asset,x.tester,x.reviewer,x.date,x.verdict,x.pocs,x.evidence,x.finding,x.limitation]));}
  function exportPocsCsv(){csvDownload('poc-register.csv',['PoC ID','WSTG ID','Asset','Verdict','Hypothesis','Expected','Actual','Confidence','Reproduction','Finding'],wstgItems.flatMap(t=>t.pocs.map(p=>[p.id,t.id,t.asset,p.verdict,p.hypothesis,p.expected,p.actual,p.confidence,p.reproduction,t.findingId||''])));}
  function exportFindingsCsv(){csvDownload('findings-register.csv',['ID','Title','Severity','CVSS','Risk','CWE','WSTG','Asset','Endpoint','Status','Confidence','Priority','Target SLA'],findings.map(f=>[f.id,f.title,f.severity,f.cvssScore,f.organizationalRisk.riskRating,f.cwe,f.wstg,f.asset,f.endpoint,f.status,f.confidenceRecord.rating,f.priority,f.targetSla]));}
  function exportEvidenceCsv(){csvDownload('evidence-manifest.csv',['Evidence ID','Type','Timestamp','Collector','Source','Asset','WSTG','PoC','Finding','Verdict','SHA-256','Storage','Redaction'],evidenceIndex.map(e=>[e.id,e.type,e.timestamp,e.collector,e.source,e.asset,e.wstgId,e.pocId,e.findingId,e.verdict,e.sha256,e.storage,e.redaction]));}
  function exportMarkdown(){
    const md=[`# ${liveReportMeta.title}`,`**Report:** ${liveReportMeta.reportId} · **Version:** ${liveReportMeta.version} · **Classification:** ${liveReportMeta.classification}`,'',`## Executive Summary`,`Overall Risk: **HIGH**`, `WSTG: ${metrics.executed}/${metrics.applicable} applicable tests executed; ${metrics.pocs} PoCs; ${metrics.evidence} evidence artifacts.`, '', '## Findings', ...findings.map(f=>`- **${f.id} — ${f.title}** | ${f.severity} | CVSS ${f.cvssScore} | Risk ${f.organizationalRisk.riskRating} | ${f.cwe} | ${f.wstg}`),'','## Assurance Statement',assuranceStatement].join('\n');
    downloadBlob(`${liveReportMeta.reportId}.md`,md,'text/markdown;charset=utf-8');
  }
  function exportHtml(){
    const rows=findings.map(f=>`<tr><td>${f.id}</td><td>${f.title}</td><td>${f.severity}</td><td>${f.cvssScore}</td><td>${f.organizationalRisk.riskRating}</td><td>${f.cwe}</td><td>${f.wstg}</td></tr>`).join('');
    const testRows=wstgItems.map(t=>`<tr><td>${t.versionedId}</td><td>${t.title}</td><td>${t.asset}</td><td>${t.verdict}</td><td>${t.pocCount}</td><td>${t.evidenceCount}</td><td>${t.findingId||'—'}</td></tr>`).join('');
    const html=`<!doctype html><html><head><meta charset="utf-8"><title>${liveReportMeta.reportId}</title><style>body{font-family:Arial,sans-serif;color:#172033;max-width:1200px;margin:36px auto;padding:0 24px}h1{font-size:32px}h2{margin-top:36px;border-bottom:2px solid #172033;padding-bottom:8px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccd4df;padding:7px;text-align:left;vertical-align:top}th{background:#f0f3f7}.muted{color:#667085}</style></head><body><h1>${liveReportMeta.title}</h1><p class="muted">${liveReportMeta.reportId} · ${liveReportMeta.version} · ${liveReportMeta.classification}</p><h2>Executive Summary</h2><p>${assessmentContext.purpose}</p><p><b>WSTG execution:</b> ${metrics.executed}/${metrics.applicable}; <b>PoCs:</b> ${metrics.pocs}; <b>Evidence:</b> ${metrics.evidence}; <b>Findings:</b> ${findings.length}</p><h2>Findings</h2><table><tr><th>ID</th><th>Finding</th><th>Severity</th><th>CVSS</th><th>Risk</th><th>CWE</th><th>WSTG</th></tr>${rows}</table><h2>WSTG Register</h2><table><tr><th>ID</th><th>Test</th><th>Asset</th><th>Verdict</th><th>PoCs</th><th>Evidence</th><th>Finding</th></tr>${testRows}</table><h2>Assurance</h2><p>${assuranceStatement}</p></body></html>`;
    downloadBlob(`${liveReportMeta.reportId}.html`,html,'text/html;charset=utf-8');
  }

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen?'open':''}`}>
      <div className="brand"><div className="brand-mark"><ShieldCheck size={23}/></div><div><strong>SEVRF</strong><span>Security Engineering Verification & Evidence</span></div></div>
      <nav>{visibleToc.map(([n,t,id])=><a key={id} href={`#${id}`} onClick={()=>setSidebarOpen(false)}><span className="nav-num">{n}</span>{localize(locale,t)}</a>)}</nav>
      <div className="sidebar-foot"><span>{locale === 'fa' ? 'خط مبنای استانداردها' : 'Standards baseline'}</span><strong>{liveReportMeta.standardsBaselineId}</strong><small>WSTG v4.2 · ASVS 5.0.0 · CVSS v4.0</small></div>
    </aside>

    <main className="main">
      <header className="topbar no-print">
        <button className="icon-button mobile-menu" onClick={()=>setSidebarOpen(!sidebarOpen)}><Menu size={20}/></button>
        <div className="top-title"><span className="eyebrow">Controlled engineering record</span><strong>{liveReportMeta.reportId}</strong></div>
        <div className="top-actions">
          <button onClick={onBack}><ArrowLeft size={16}/> Back to CRM</button>
          <button onClick={onToggleLocale}>{locale === "en" ? "فارسی" : "English"}</button>
          <select value={view} onChange={e=>setView(e.target.value)}><option value="full">Full Report</option><option value="management">Management Report</option><option value="executive">Executive View</option><option value="technical">Technical Report</option><option value="annex">Evidence Annex</option></select>
          <button onClick={(e)=>e.currentTarget.ownerDocument.defaultView?.print()}><Printer size={16}/> Print / PDF</button>
          <div className="export-menu"><button className="primary"><Download size={16}/> Export <ChevronDown size={14}/></button><div className="export-popover">
            <button onClick={exportJson}><FileJson size={16}/> Complete JSON</button><button onClick={exportFindingsCsv}><FileText size={16}/> Findings CSV</button><button onClick={exportTestsCsv}><ListChecks size={16}/> WSTG CSV</button><button onClick={exportPocsCsv}><TestTube2 size={16}/> PoC CSV</button><button onClick={exportEvidenceCsv}><Archive size={16}/> Evidence Manifest</button><button onClick={exportHtml}><FileCheck2 size={16}/> Standalone HTML</button><button onClick={exportMarkdown}><FileText size={16}/> Markdown Summary</button>
          </div></div>
        </div>
      </header>

      <section className="report-page cover" id="cover" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
        <div className="cover-mark"><ShieldCheck size={54}/></div>
        <h1>{isAnnexReport
          ? (locale === 'fa' ? 'گزارش پیوست فنی شواهد' : 'Technical Evidence Annex Report')
          : isManagementReport
            ? (locale === 'fa' ? 'گزارش مدیریتی ارزیابی امنیت' : 'Security Assessment Management Report')
            : (locale === 'fa' ? 'گزارش ارزیابی مهندسی امنیت' : liveReportMeta.title)}</h1>
        <div className="cover-signoff">
          <div><span>{locale === 'fa' ? 'تهیه‌کننده' : 'Prepared by'}</span><strong>{localize(locale, liveReportMeta.preparedBy)}</strong></div>
          <div><span>{locale === 'fa' ? 'بازبینی‌کننده' : 'Reviewed by'}</span><strong>{localize(locale, liveReportMeta.reviewedBy)}</strong></div>
          <div><span>{locale === 'fa' ? 'تأییدکننده' : 'Approved by'}</span><strong>{localize(locale, liveReportMeta.approvedBy)}</strong></div>
          <div><span>{locale === 'fa' ? 'ریسک کلی سازمانی' : 'Overall organizational risk'}</span><strong className="risk-high-text">{locale === 'fa' ? 'بالا' : 'HIGH'}</strong></div>
        </div>
      </section>

      <section className="report-page toc-page" id="toc" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
        <SectionHeading num="" title={locale === 'fa' ? 'فهرست مطالب' : 'Table of Contents'} subtitle={locale === 'fa' ? 'ساختار گزارش' : 'Controlled report structure.'} icon={<BookOpen/>}/>
        <div className="toc-list">{visibleToc.map(([n,t,id])=><a key={id} href={`#${id}`}><span>{n}</span><strong>{localize(locale,t)}</strong><i/></a>)}</div>
      </section>

      {isAnnexReport && <OfficialDocumentProfileSection locale={locale}/>} 
      {isManagementReport && <>
        <OfficialDocumentProfileSection locale={locale}/>
        <ManagementReportSections locale={locale} metrics={metrics} liveReportMeta={liveReportMeta}/>
      </>}

      {showCore && <>
        <section className="report-page" id="official-document-profile">
          <SectionHeading num="F1" title={locale === 'fa' ? 'شناسنامه مستند' : 'Official Document Profile'} subtitle={locale === 'fa' ? 'مشخصات هویتی، مالکیت و چرخه عمر سامانه و گزارش.' : 'Official identity, ownership and lifecycle metadata for the assessed system and issued report.'} icon={<Fingerprint/>}/>
          {locale === 'fa' ? (
            <div data-source-literal="true" dir="rtl">
              <div className="data-grid cols-4">
                <Meta label={officialDocumentProfile.labelsFa.documentIdentifier} value={officialDocumentProfile.documentIdentifier}/>
                <Meta label={officialDocumentProfile.labelsFa.documentCode} value={officialDocumentProfile.documentCode}/>
                <Meta label={officialDocumentProfile.labelsFa.systemName} value={officialDocumentProfile.systemName}/>
                <Meta label={officialDocumentProfile.labelsFa.documentClassification} value={officialDocumentProfile.documentClassification}/>
                <Meta label={officialDocumentProfile.labelsFa.systemAcceptanceDate} value={officialDocumentProfile.systemAcceptanceDate}/>
                <Meta label={officialDocumentProfile.labelsFa.assessmentDate} value={officialDocumentProfile.assessmentDate}/>
                <Meta label={officialDocumentProfile.labelsFa.reportIssueDate} value={officialDocumentProfile.reportIssueDate}/>
                <Meta label={officialDocumentProfile.labelsFa.systemVersion} value={officialDocumentProfile.systemVersion}/>
                <Meta label={officialDocumentProfile.labelsFa.client} value={officialDocumentProfile.client}/>
                <Meta label={officialDocumentProfile.labelsFa.contractor} value={officialDocumentProfile.contractor}/>
                <Meta label={officialDocumentProfile.labelsFa.operator} value={officialDocumentProfile.operator}/>
                <Meta label={officialDocumentProfile.labelsFa.incomingLetterNumber} value={officialDocumentProfile.incomingLetterNumber}/>
                <Meta label={officialDocumentProfile.labelsFa.assessmentRound} value={officialDocumentProfile.assessmentRound}/>
              </div>
            </div>
          ) : (
            <div className="data-grid cols-4">
              <Meta label="Document Identifier" value={officialDocumentProfile.documentIdentifier}/>
              <Meta label="Document Code" value={officialDocumentProfile.documentCode}/>
              <Meta label="System Name" value={officialDocumentProfile.systemName}/>
              <Meta label="Document Classification" value={officialDocumentProfile.documentClassification}/>
              <Meta label="System Acceptance Date" value={officialDocumentProfile.systemAcceptanceDate}/>
              <Meta label="Assessment Date" value={officialDocumentProfile.assessmentDate}/>
              <Meta label="Report Issue Date" value={officialDocumentProfile.reportIssueDate}/>
              <Meta label="System Version" value={officialDocumentProfile.systemVersion}/>
              <Meta label="Client" value={officialDocumentProfile.client}/>
              <Meta label="Contractor" value={officialDocumentProfile.contractor}/>
              <Meta label="Operator" value={officialDocumentProfile.operator}/>
              <Meta label="Incoming Letter Number" value={officialDocumentProfile.incomingLetterNumber}/>
              <Meta label="Assessment Round" value={officialDocumentProfile.assessmentRound}/>
            </div>
          )}
        </section>

        <section className="report-page" id="report-quality-control">
          <SectionHeading num="F2" title={locale === 'fa' ? 'کنترل کیفیت گزارش' : 'Report Quality Control'} subtitle={locale === 'fa' ? 'کنترل‌های رسمی کیفیت گزارش و تأیید ثبت‌شده.' : 'Formal report-quality checks and the recorded controller approval.'} icon={<UserCheck/>}/>
          {locale === 'fa' ? (
            <div data-source-literal="true" dir="rtl">
              <div className="data-grid cols-4">
                <Meta label="مسئول کنترل" value={reportQualityControl.controller}/>
                <Meta label="تاریخ تایید" value={reportQualityControl.approvalDate}/>
              </div>
              <SimpleTable
                headers={[reportQualityControl.checksHeadingFa, reportQualityControl.approvalHeadingFa]}
                rows={reportQualityControl.checks.map(x=>[
                  x.fa,
                  <span key="cell-1">✓</span>
                ])}
              />
            </div>
          ) : (
            <>
              <div className="data-grid cols-4">
                <Meta label="Quality Controller" value={reportQualityControl.controller}/>
                <Meta label="Approval Date" value={reportQualityControl.approvalDate}/>
                <Meta label="Control Result" value="Approved"/>
                <Meta label="Checks Completed" value={`${reportQualityControl.checks.filter(x=>x.approved).length}/${reportQualityControl.checks.length}`}/>
              </div>
              <h3>Quality Control Checklist</h3>
              <SimpleTable
                headers={['Control','Source Wording','Status']}
                rows={reportQualityControl.checks.map(x=>[
                  x.label,
                  <span key="cell-1" dir="rtl" style={{display:'block',textAlign:'right'}}>{x.fa}</span>,
                  <span key="cell-2" className="badge verdict-pass">Approved</span>
                ])}
              />
            </>
          )}
        </section>

        <section className="report-page" id="assessment-team-timeline">
          <SectionHeading num="F3" title={locale === 'fa' ? 'تاریخچه آزمونگران' : 'Assessment Team & Timeline'} subtitle={locale === 'fa' ? 'سوابق مشارکت آزمونگران و تاریخ‌های کلیدی ارزیابی.' : 'Recorded tester participation, assessment dates, documentation approval and report preparation milestones.'} icon={<Activity/>}/>
          <div data-source-literal={locale === 'fa' ? 'true' : undefined} dir={locale === 'fa' ? 'rtl' : undefined}>
            <SimpleTable
              headers={locale === 'fa'
                ? ['ردیف','نام آزمونگر','تاریخ شروع آزمون','تاریخ پایان آزمون','تاریخ تایید مستندات','تاریخ تهیه گزارش']
                : ['Row','Tester','Assessment Start','Assessment End','Documentation Approval','Report Preparation']}
              rows={assessmentPersonnelHistory.map(x=>[x.row,x.tester,x.assessmentStart,x.assessmentEnd,x.documentationApproval,x.reportPreparation])}
            />
          </div>
        </section>

        <section className="report-page" id="publication-rights">
          <SectionHeading num="F4" title={locale === 'fa' ? publicationRights.titleFa : 'Copyright & Publication Rights'} subtitle={locale === 'fa' ? 'ضوابط حق طبع و نشر، نسخه‌برداری، ترجمه و کنترل تغییر.' : 'Publication, copying, translation and document change-control terms.'} icon={<Scale/>}/>
          <div data-source-literal="true">
            <div className="card" dir="rtl" style={{textAlign:'right'}}><p>{publicationRights.persianText}</p></div>
            <div className="card" dir="ltr" style={{textAlign:'left',marginTop:12}}>
              <h3>{publicationRights.englishHeading}</h3>
              {publicationRights.englishLines.map(line=><p key={line} style={{margin:'2px 0'}}>{line}</p>)}
              <p style={{marginTop:16}}>{publicationRights.englishText}</p>
            </div>
          </div>
        </section>

        <section className="report-page" id="assessment-basis-risk-definitions">
          <SectionHeading
            num="F5"
            title={locale === 'fa' ? assessmentBasisAndRiskDefinitions.sectionTitleFa : 'Assessment Basis & Risk Definitions'}
            subtitle={locale === 'fa' ? 'مبانی ارزیابی و تعریف سطوح مخاطرات مورد استفاده در گزارش.' : 'Assessment basis and risk definitions used by the report.'}
            icon={<AlertTriangle/>}
          />
          {locale === 'fa' ? (
            <div data-source-literal="true" dir="rtl">
              <div className="card">
                <p>{assessmentBasisAndRiskDefinitions.basis.fa}</p>
              </div>
              <Callout title="عدم قطعیت آزمون امنیت" icon={<AlertTriangle/>}>
                <strong>{assessmentBasisAndRiskDefinitions.uncertainty.fa}</strong>
              </Callout>
              <h3>{assessmentBasisAndRiskDefinitions.riskTitleFa}</h3>
              <p>{assessmentBasisAndRiskDefinitions.riskIntroFa}</p>
              <SimpleTable
                headers={['میزان مخاطرات', '']}
                rows={severityDefinitionRows.map(x=>[
                  <span key="cell-0" dir="ltr">{x.level}</span>,
                  x.descriptionFa
                ])}
              />
            </div>
          ) : (
            <>
              <div className="card">
                <p>{assessmentBasisAndRiskDefinitions.basis.en}</p>
                <div className="chip-row">{assessmentBasisAndRiskDefinitions.standards.map(x=><span className="chip" dir="ltr" key={x}>{x}</span>)}</div>
              </div>
              <Callout title="Security-Test Uncertainty" icon={<AlertTriangle/>}>
                {assessmentBasisAndRiskDefinitions.uncertainty.en}
              </Callout>
              <h3>Severity / Risk-Level Definitions</h3>
              <SimpleTable
                headers={['Level','Definition']}
                rows={severityDefinitionRows.map(x=>[
                  x.level,
                  x.descriptionEn
                ])}
              />
            </>
          )}
        </section>

        <section className="report-page" id="document-access-identification">
          <SectionHeading
            num="F6"
            title={locale === 'fa' ? documentAccessControl.titleFa : 'Document Access Control & Vulnerability Identification'}
            subtitle={locale === 'fa' ? 'کنترل دسترسی به مستند و روش‌های شناسایی آسیب‌پذیری.' : 'Document access controls and vulnerability-identification methods.'}
            icon={<LockKeyhole/>}
          />
          {locale === 'fa' ? (
            <div data-source-literal="true" dir="rtl">
              <h3>{documentAccessControl.privilegesHeadingFa}</h3>
              <SimpleTable
                headers={['موجودیت', documentAccessControl.classificationHeadingFa, 'استفاده از محتوا', 'تغییر محتوا', 'چاپ', 'ذخیره رونوشت', 'ارسال و تبادل', 'امحاء']}
                rows={documentAccessControl.permissions.map(x=>[
                  x.entityFa,
                  documentAccessControl.classification.fa,
                  <span key="cell-2">{x.useContent ? '✓' : '⊠'}</span>,
                  <span key="cell-3">{x.changeContent ? '✓' : '⊠'}</span>,
                  <span key="cell-4">{x.print ? '✓' : '⊠'}</span>,
                  <span key="cell-5">{x.copyStore ? '✓' : '⊠'}</span>,
                  <span key="cell-6">{x.sendExchange ? '✓' : '⊠'}</span>,
                  <span key="cell-7">{x.destroy ? '✓' : '⊠'}</span>,
                ])}
              />

              <h3>{vulnerabilityIdentification.titleFa}</h3>
              <p>{vulnerabilityIdentification.introFa}</p>
              <ul>
                {vulnerabilityIdentificationMethods.map(x=><li key={x.id}>{x.fa}</li>)}
              </ul>
            </div>
          ) : (
            <>
              <h3>Access-Control Matrix</h3>
              <SimpleTable
                headers={['Entity','Classification','Use Content','Change Content','Print','Copy / Store','Send / Exchange','Destroy']}
                rows={documentAccessControl.permissions.map(x=>[
                  x.entityEn,
                  documentAccessControl.classification.en,
                  <PermissionMark key="cell-2" allowed={x.useContent} locale={locale}/>,
                  <PermissionMark key="cell-3" allowed={x.changeContent} locale={locale}/>,
                  <PermissionMark key="cell-4" allowed={x.print} locale={locale}/>,
                  <PermissionMark key="cell-5" allowed={x.copyStore} locale={locale}/>,
                  <PermissionMark key="cell-6" allowed={x.sendExchange} locale={locale}/>,
                  <PermissionMark key="cell-7" allowed={x.destroy} locale={locale}/>
                ])}
              />
              <h3>Vulnerability Identification Methods</h3>
              <div className="method-grid">
                {vulnerabilityIdentificationMethods.map((x,i)=>
                  <div className="method" key={x.id}>
                    <span>{String(i+1).padStart(2,'0')}</span>
                    <div><strong>{x.en}</strong><p>{x.id}</p></div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        <section className="report-page" id="test-structure-cvss">
          <SectionHeading
            num="F7"
            title={locale === 'fa' ? testItemStructureSource.titleFa : 'Test Item Structure & CVSS Reference'}
            subtitle={locale === 'fa' ? 'متن ساختار موارد آزمون و پارامترهای CVSS مطابق مستند مبنا.' : 'Source-controlled test-item structure and CVSS reference.'}
            icon={<Gauge/>}
          />
          {locale === 'fa' ? (
            <div data-source-literal="true" dir="rtl">
              <p>{testItemStructureSource.introFa}</p>
              <ul>
                {testItemStructure.map(x=>
                  <li key={x.field}>
                    <strong>{x.sourceLabelFa}</strong> {x.descriptionFa}
                  </li>
                )}
              </ul>

              <p>{cvss31Reference.intro.fa}</p>

              <SimpleTable
                headers={['کلاس','نام پارامتر','توضیحات']}
                rows={cvss31Reference.parameters.map(x=>[
                  <span key="cell-0" dir="ltr">{x.classSource}</span>,
                  <span key="cell-1" dir="ltr">{x.sourceName}</span>,
                  x.descriptionFa
                ])}
              />
            </div>
          ) : (
            <>
              <h3>Test Item Structure</h3>
              <SimpleTable
                headers={['Field','Description']}
                rows={testItemStructure.map(x=>[x.field,x.descriptionEn])}
              />
              <Callout title="CVSS 3.1 Scoring Reference" icon={<Scale/>}>
                {cvss31Reference.intro.en}
              </Callout>
              <SimpleTable
                headers={['Class','Parameter','Description']}
                rows={cvss31Reference.parameters.map(x=>[
                  x.classSource,
                  x.sourceName,
                  x.descriptionEn
                ])}
              />
            </>
          )}
        </section>

        <section className="report-page" id="cvss31-parameter-values">
          <SectionHeading
            num="F8"
            title={locale === 'fa' ? 'مقادیر ممکن پارامترهای CVSS 3.1' : 'CVSS 3.1 Parameter Values'}
            subtitle={locale === 'fa' ? 'مقادیر مندرج در مستند مبنا؛ بدون ترجمه یا بازنویسی اصطلاحات فنی.' : 'Possible parameter values retained from the source document.'}
            icon={<ListChecks/>}
          />
          {locale === 'fa' ? (
            <div data-source-literal="true" dir="rtl">
              <p>{cvss31Reference.possibleValuesIntroFa}</p>
              <SimpleTable
                headers={['کلاس','نام پارامتر','مقادیر ممکن']}
                rows={cvss31Reference.parameters.map(x=>[
                  <span key="cell-0" dir="ltr">{x.classSource}</span>,
                  <span key="cell-1" dir="ltr">{x.valuesSourceName}</span>,
                  <div key="cell-2" className="chip-row" dir="ltr">{x.values.map(v=><span className="chip" key={v}>{v}</span>)}</div>
                ])}
              />
            </div>
          ) : (
            <>
              <SimpleTable
                headers={['Class','Parameter','Possible Values']}
                rows={cvss31Reference.parameters.map(x=>[
                  x.classSource,
                  x.valuesSourceName,
                  <div key="cell-2" className="chip-row">{x.values.map(v=><span className="chip" key={v}>{v}</span>)}</div>
                ])}
              />
            </>
          )}
        </section>

        <section className="report-page" id="test-result-evidence-hardening">
          <SectionHeading
            num="F9"
            title={locale === 'fa' ? testOutcomeAndHardeningSource.titleFa : 'Test Result, Evidence & Hardening'}
            subtitle={locale === 'fa' ? 'تعریف نتیجه آزمون، شواهد، راهکار امنیتی و امکان امن‌سازی.' : 'Test result semantics, evidence, remediation and hardening guidance.'}
            icon={<ShieldCheck/>}
          />
          {locale === 'fa' ? (
            <div data-source-literal="true" dir="rtl">
              <h3>{testOutcomeAndHardeningSource.titleFa}:</h3>
              <p>{testOutcomeAndHardeningSource.resultIntroFa}</p>
              <ul>
                {testOutcomeAndHardeningSource.resultStates.map(x=><li key={x.code}><strong dir="ltr">{x.code}:</strong> {x.fa}</li>)}
              </ul>

              <h3>{testOutcomeAndHardeningSource.evidenceTitleFa}:</h3>
              <p>{testOutcomeAndHardeningSource.evidenceTextFa}</p>

              <h3>{testOutcomeAndHardeningSource.securitySolutionTitleFa}:</h3>
              <p>{testOutcomeAndHardeningSource.securitySolutionTextFa}</p>

              <h3>{testOutcomeAndHardeningSource.hardeningByTitleFa}:</h3>
              <p>{testOutcomeAndHardeningSource.hardeningByTextFa}</p>
              <ul>
                {testOutcomeAndHardeningSource.hardeningOptions.map(x=><li key={x.labelFa}><strong>{x.labelFa}</strong> ({x.descriptionFa})</li>)}
              </ul>

              <h3>{testOutcomeAndHardeningSource.wafTitleFa}:</h3>
              <p>{testOutcomeAndHardeningSource.wafTextFa}</p>

              <p>{testOutcomeAndHardeningSource.mappingIntroFa}</p>
              <SimpleTable
                headers={testOutcomeAndHardeningSource.rankingHeadersFa}
                rows={testOutcomeAndHardeningSource.rankingRows.map(x=>[
                  <strong key="cell-0">{x.owaspFa}</strong>,
                  <span key="cell-1" dir="ltr">{x.cvssRange}</span>
                ])}
              />
            </div>
          ) : (
            <>
              <h3>Result States</h3>
              <SimpleTable
                headers={['State','Meaning']}
                rows={testOutcomeAndHardeningSource.resultStates.map(x=>[
                  <span key="cell-0" dir="ltr">{x.code}</span>,
                  <span key="cell-1" dir="rtl" lang="fa">{x.fa}</span>
                ])}
              />
              <Callout title="Evidence & Security Guidance" icon={<ShieldCheck/>}>
                Source-controlled Persian wording is preserved in the Persian report view for test evidence, security guidance, hardening ownership and WAF-based short-term mitigation.
              </Callout>
              <SimpleTable
                headers={['OWASP Rating','CVSS Score Range']}
                rows={testOutcomeAndHardeningSource.rankingRows.map(x=>[x.owaspFa,<span key="cell-1" dir="ltr">{x.cvssRange}</span>])}
              />
            </>
          )}
        </section>

        <section className="report-page" id="penetration-test-approach-location">
          <SectionHeading
            num="F10"
            title={locale === 'fa' ? penetrationTestApproachSource.approachTitleFa : 'Penetration Test Approach & Assessment Team Location'}
            subtitle={locale === 'fa' ? 'متن و نتیجه انتخاب رویکرد آزمون نفوذ مطابق مستند مبنا.' : 'Source-controlled penetration-test approach and assessor-location record.'}
            icon={<Radar/>}
          />
          {locale === 'fa' ? (
            <div data-source-literal="true" dir="rtl">
              <h3>{penetrationTestApproachSource.approachTitleFa}</h3>
              <p>{penetrationTestApproachSource.introFa}</p>
              {penetrationTestApproachSource.boxDefinitions.map(x=><p key={x.labelFa}><strong>{x.labelFa} :</strong> {x.textFa}</p>)}
              <p>{penetrationTestApproachSource.selectedApproachFa}</p>

              <h3>{penetrationTestApproachSource.testTypesTitleFa}</h3>
              <SimpleTable
                headers={[penetrationTestApproachSource.reviewedHeadingFa, penetrationTestApproachSource.approvalHeadingFa]}
                rows={penetrationTestApproachSource.testTypes.map(x=>[
                  x.labelFa,
                  <span key="cell-1">{x.approved ? '✓' : '×'}</span>
                ])}
              />

              <h3>{penetrationTestApproachSource.locationTitleFa}</h3>
              <p>{penetrationTestApproachSource.locationIntroFa}</p>
              <ul>
                {penetrationTestApproachSource.locationItemsFa.map(x=><li key={x}>{x}</li>)}
              </ul>
            </div>
          ) : (
            <>
              <h3>Penetration-Test Knowledge Model</h3>
              <SimpleTable
                headers={['Approach','Source Definition']}
                rows={penetrationTestApproachSource.boxDefinitions.map(x=>[
                  x.labelFa,
                  <span key="cell-1" dir="rtl" lang="fa">{x.textFa}</span>
                ])}
              />
              <Callout title="Selected Approach" icon={<Radar/>}>
                Gray-box testing is the selected source-recorded approach because administrator account information was available to the assessment team.
              </Callout>
              <h3>Assessment Team Location</h3>
              <ul>{penetrationTestApproachSource.locationItemsFa.map(x=><li dir="rtl" lang="fa" key={x}>{x}</li>)}</ul>
            </>
          )}
        </section>

        <section className="report-page" id="iso15408-2026-requirements">
          <SectionHeading
            num="F11"
            title={locale === 'fa' ? 'خط مبنای الزامات کارکردی ISO/IEC 15408:2026' : 'ISO/IEC 15408:2026 Functional Requirements Baseline'}
            subtitle={locale === 'fa' ? 'فهرست جاری خانواده‌های الزامات کارکردی بر اساس ISO/IEC 15408-2:2026؛ با تفکیک نتایج قدیمی از وضعیت ارزیابی 2026.' : 'Current ISO/IEC 15408-2:2026 functional-family catalogue with legacy results explicitly separated from 2026 assessment status.'}
            icon={<ListChecks/>}
          />
          {locale === 'fa' ? (
            <div dir="rtl">
              <div className="data-grid cols-4">
                <Meta label="خط مبنای جاری" value={iso15408_2026Baseline.currentPart2}/>
                <Meta label="ویرایش" value={iso15408_2026Baseline.edition}/>
                <Meta label="تعداد کلاس‌های کارکردی" value={iso15408_2026StandardsResearchAudit.classCount}/>
                <Meta label="تعداد خانواده‌های الزامات" value={iso15408_2026StandardsResearchAudit.familyCount}/>
              </div>

              <Callout title="وضعیت نسخه استاندارد" icon={<BookOpen/>}>{iso15408_2026Baseline.revisionNoteFa}</Callout>
              <Callout title="قاعده مهم قابلیت اعمال" icon={<AlertTriangle/>}>{iso15408_2026Baseline.applicabilityNoteFa}</Callout>

              <h3>خط مبنای جاری مجموعه استاندارد ISO/IEC 15408</h3>
              <SimpleTable
                headers={['مرجع استاندارد','ویرایش','تاریخ انتشار','کاربرد در گزارش']}
                rows={iso15408_2026Baseline.seriesParts.map(x=>[
                  <span key="cell-0" dir="ltr">{x.reference}</span>,
                  <span key="cell-1" dir="ltr">{x.edition}</span>,
                  <span key="cell-2" dir="ltr">{x.publication}</span>,
                  x.purposeFa
                ])}
              />

              <h3>خانواده‌های الزامات کارکردی ISO/IEC 15408-2:2026</h3>
              <p>{iso15408_2026Baseline.resultCarryForwardNoteFa}</p>

              {iso15408_2026FunctionalClasses.map(group=><div key={group.classCode} style={{marginTop:18}}>
                <h3><span dir="ltr">{group.classCode}</span> — {group.classNameFa}</h3>
                <SimpleTable
                  headers={['کد خانواده الزام','شرح فارسی','بند در ISO/IEC 15408-2:2026','وضعیت در این گزارش']}
                  rows={group.families.map(f=>{
                    const status=iso15408FamilyStatus(f.code,'fa');
                    return [
                      <strong key="cell-0" dir="ltr">{f.code}</strong>,
                      f.nameFa,
                      <span key="cell-2" dir="ltr">{f.clause}</span>,
                      <span key="cell-3" className={status.className}>{status.label}</span>
                    ];
                  })}
                />
              </div>)}

              <Callout title="تفکیک الزامات توسعه‌یافته از کاتالوگ پایه" icon={<FileSearch/>}>{iso15408_2026Baseline.extendedRequirementsNoteFa}</Callout>
              <SimpleTable
                headers={['کد توسعه‌یافته مشاهده‌شده در مستند قدیمی','نتیجه قدیمی','وضعیت در خط مبنای 2026']}
                rows={iso15408LegacyExtendedRequirements.map(x=>[
                  <strong key="cell-0" dir="ltr">{x.code}</strong>,
                  <span key="cell-1" className="badge verdict-pass">{locale === 'fa' ? `${x.legacyResult} قدیمی — نیازمند بازتأیید 2026` : `Legacy ${x.legacyResult} — revalidation required`}</span>,
                  x.noteFa
                ])}
              />
            </div>
          ) : (
            <>
              <div className="data-grid cols-4">
                <Meta label="Current baseline" value={iso15408_2026Baseline.currentPart2}/>
                <Meta label="Edition" value={iso15408_2026Baseline.edition}/>
                <Meta label="Functional classes" value={iso15408_2026StandardsResearchAudit.classCount}/>
                <Meta label="Requirement families" value={iso15408_2026StandardsResearchAudit.familyCount}/>
              </div>
              <SimpleTable
                headers={['Standard','Edition','Publication','Report role']}
                rows={iso15408_2026Baseline.seriesParts.map(x=>[x.reference,x.edition,x.publication,x.purposeEn])}
              />
              {iso15408_2026FunctionalClasses.map(group=><div key={group.classCode} style={{marginTop:18}}>
                <h3>{group.classCode}</h3>
                <SimpleTable
                  headers={['Family','Clause','Assessment status']}
                  rows={group.families.map(f=>{
                    const status=iso15408FamilyStatus(f.code,'en');
                    return [<strong key="cell-0">{f.code}</strong>,f.clause,<span key="cell-2" className={status.className}>{status.label}</span>];
                  })}
                />
              </div>)}
            </>
          )}
        </section>

        <section className="report-page" id="wstg-iso15408-traceability">
          <SectionHeading
            num="F12"
            title={locale === 'fa' ? 'ماتریس ردیابی OWASP WSTG و ISO/IEC 15408:2026' : 'OWASP WSTG ↔ ISO/IEC 15408:2026 Traceability Matrix'}
            subtitle={locale === 'fa' ? 'اعلام اجرای هر ۱۲ دسته آزمون WSTG روی پروژه و نگاشت فنی هر دسته به خانواده‌های متناظر الزامات کارکردی ISO/IEC 15408-2:2026.' : 'Project execution declaration for all 12 WSTG categories with a technical mapping to relevant ISO/IEC 15408-2:2026 SFR families.'}
            icon={<GitBranch/>}
          />
          {locale === 'fa' ? (
            <div dir="rtl">
              <div className="data-grid cols-4">
                <Meta label="خط مبنای OWASP" value={owaspWstgIso15408Crosswalk2026.wstgBaseline}/>
                <Meta label="تعداد دسته‌های آزمون" value={owaspWstgIso15408Crosswalk2026.categoryCount}/>
                <Meta label="تعداد آزمون‌های سطح بالا" value={owaspWstgIso15408Crosswalk2026.topLevelTestCount}/>
                <Meta label="خط مبنای ISO" value={owaspWstgIso15408Crosswalk2026.isoBaseline}/>
              </div>

              <Callout title="اعلام اجرای آزمون‌های OWASP WSTG روی پروژه" icon={<ClipboardCheck/>}>
                {owaspWstgIso15408Crosswalk2026.executionDeclarationFa}
              </Callout>
              <Callout title="قاعده انطباق و نحوه استفاده از این ماتریس" icon={<AlertTriangle/>}>
                {owaspWstgIso15408Crosswalk2026.mappingRuleFa}
              </Callout>

              <h3>خلاصه ۱۲ دسته آزمون و بندهای متناظر ISO/IEC 15408-2:2026</h3>
              <SimpleTable
                headers={['بند / شناسه WSTG','دسته آزمون','تعداد آزمون','وضعیت اجرا','نتیجه مستند مبنا','خانواده‌ها و بندهای متناظر ISO/IEC 15408-2:2026']}
                rows={owaspWstgIso15408Crosswalk2026.categories.map(c=>[
                  <div key="cell-0"><strong dir="ltr">{c.order}</strong><br/><span dir="ltr">{c.wstgPrefix}</span></div>,
                  <div key="cell-1"><strong>{c.nameFa}</strong><br/><small dir="ltr">{c.nameEn}</small></div>,
                  <span key="cell-2" dir="ltr">{c.testCount}</span>,
                  <span key="cell-3" className="badge verdict-pass">{c.executionStatusFa}</span>,
                  <span key="cell-4" className={verdictClass(c.legacyResult)} data-source-literal="true">{c.legacyResult}</span>,
                  <div key="cell-5" className="chip-row">{c.isoRefs.map(r=><span className="chip" dir="ltr" key={`${c.code}-${r.code}`}>{r.code} · {r.clause}</span>)}</div>
                ])}
              />

              <Callout title="نتیجه ثبت‌شده در مستند مبنا" icon={<FileCheck2/>}>
                <strong data-source-literal="true">{owaspWstgIso15408Crosswalk2026.legacyFinalEvaluationLabelFa}</strong>
              </Callout>

              <div className="card-stack">
                {owaspWstgIso15408Crosswalk2026.categories.map(c=><div className="card" key={c.code} style={{marginBottom:14}}>
                  <div className="data-grid cols-4">
                    <Meta label="بند WSTG" value={`${c.order} / ${c.wstgPrefix}`}/>
                    <Meta label="تعداد آزمون" value={c.testCount}/>
                    <Meta label="وضعیت اجرا" value={c.executionStatusFa}/>
                    <Meta label="نتیجه مستند مبنا" value={c.legacyResult}/>
                  </div>
                  <h3>{c.nameFa} <small dir="ltr">— {c.nameEn}</small></h3>
                  <div className="source-description" data-source-literal="true" dir="rtl">
                    <p style={{marginTop:0}}><strong>{c.sourceHeadingFa}</strong></p>
                    <p style={{marginBottom:0, lineHeight:2.15, textAlign:'justify'}}>{c.sourceDescriptionFa}</p>
                  </div>
                  <p><strong>عنوان دسته: </strong><span data-source-literal="true">{c.sourceLabelFa}</span></p>
                  <p><strong>توضیح مهندسی نگاشت به ISO/IEC 15408-2:2026: </strong>{c.rationaleFa}</p>
                  <div className="chip-row">{c.isoRefs.map(r=><span className="chip" dir="ltr" key={`${c.code}-detail-${r.code}`}>{r.code} · ISO/IEC 15408-2:2026 {r.clause}</span>)}</div>
                </div>)}
              </div>
              <Callout title="کنترل ممیزی نگاشت" icon={<ShieldCheck/>}>
                این ماتریس در تاریخ <span dir="ltr">{owaspWstgIso15408CrosswalkAudit.verifiedOn}</span> بازبینی شده است؛ تعداد دسته‌های WSTG برابر <span dir="ltr">{owaspWstgIso15408CrosswalkAudit.wstgCategoryCount}</span> و تعداد آزمون‌های سطح بالا در خط مبنای <span dir="ltr">v4.2</span> برابر <span dir="ltr">{owaspWstgIso15408CrosswalkAudit.wstgTopLevelTestCount}</span> است. نگاشت در سطح خانواده‌های SFR انجام شده و ادعای هم‌ارزی هنجاری رسمی میان OWASP و ISO/IEC 15408 مطرح نمی‌شود.
              </Callout>
            </div>
          ) : (
            <>
              <div className="data-grid cols-4">
                <Meta label="OWASP baseline" value={owaspWstgIso15408Crosswalk2026.wstgBaseline}/>
                <Meta label="Testing categories" value={owaspWstgIso15408Crosswalk2026.categoryCount}/>
                <Meta label="Top-level tests" value={owaspWstgIso15408Crosswalk2026.topLevelTestCount}/>
                <Meta label="ISO baseline" value={owaspWstgIso15408Crosswalk2026.isoBaseline}/>
              </div>
              <Callout title="Project WSTG execution declaration" icon={<ClipboardCheck/>}>{owaspWstgIso15408Crosswalk2026.executionDeclarationEn}</Callout>
              <Callout title="Mapping rule" icon={<AlertTriangle/>}>{owaspWstgIso15408Crosswalk2026.mappingRuleEn}</Callout>
              <SimpleTable
                headers={['WSTG','Category','Tests','Execution','Legacy result','ISO/IEC 15408-2:2026 SFR-family clauses']}
                rows={owaspWstgIso15408Crosswalk2026.categories.map(c=>[
                  `${c.order} / ${c.wstgPrefix}`,
                  c.nameEn,
                  c.testCount,
                  'Executed',
                  <span key="cell-4" className={verdictClass(c.legacyResult)}>{c.legacyResult}</span>,
                  c.isoRefs.map(r=>`${r.code} ${r.clause}`).join(' · ')
                ])}
              />
            </>
          )}
        </section>

        <section className="report-page" id="document-control" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
          <SectionHeading
            num="01"
            title={locale === 'fa' ? 'کنترل سند و حاکمیت' : 'Document Control & Governance'}
            subtitle={locale === 'fa' ? 'هویت، مالکیت، نحوه نگهداری، نسخه‌بندی، تأییدها و توزیع رکورد مهندسی کنترل‌شده.' : 'Identity, ownership, handling, versioning, approvals and distribution of the controlled engineering record.'}
            icon={<FileCheck2/>}
          />
          <div className="data-grid cols-4">
            <Meta label={locale === 'fa' ? 'شناسه سند' : 'Document ID'} value={liveReportMeta.documentId}/>
            <Meta label={locale === 'fa' ? 'مالک سند' : 'Owner'} value={locale === 'fa' ? 'آزمایشگاه امنیت و مهندسی کیفیت نرم‌افزار' : documentControl.owner}/>
            <Meta label={locale === 'fa' ? 'طبقه‌بندی' : 'Classification'} value={locale === 'fa' ? faClassification(liveReportMeta.classification) : liveReportMeta.classification}/>
            <Meta label={locale === 'fa' ? 'دوره نگهداری' : 'Retention'} value={locale === 'fa' ? '۷ سال' : liveReportMeta.retention}/>
            <Meta label={locale === 'fa' ? 'مالک دارایی' : 'Asset Owner'} value={locale === 'fa' ? 'گروه مالک محصول' : liveReportMeta.assetOwner}/>
            <Meta label={locale === 'fa' ? 'مالک امنیت' : 'Security Owner'} value={locale === 'fa' ? 'دفتر امنیت اطلاعات' : liveReportMeta.securityOwner}/>
            <Meta label={locale === 'fa' ? 'مالک ریسک' : 'Risk Owner'} value={locale === 'fa' ? 'مالک ریسک سازمانی پروژه' : liveReportMeta.riskOwner}/>
            <Meta label={locale === 'fa' ? 'هش سند' : 'Document Hash'} value={locale === 'fa' ? 'در زمان صدور نهایی محاسبه می‌شود' : liveReportMeta.documentHash}/>
          </div>
          <Callout title={locale === 'fa' ? 'دستورالعمل نگهداری و توزیع' : 'Handling Instruction'} icon={<LockKeyhole/>}>
            {locale === 'fa' ? 'توزیع سند بر مبنای نیاز به دانستن انجام می‌شود. شواهدی که شامل اعتبارنامه، توکن، داده شخصی یا شناسه‌های محیط عملیاتی باشند باید در نسخه‌های نمایشی گزارش ماسک شده و در مخزن شواهد با کنترل دسترسی مناسب نگهداری شوند.' : documentControl.handling}
          </Callout>
          <h3>{locale === 'fa' ? 'تاریخچه نسخه‌ها' : 'Version History'}</h3>
          <SimpleTable
            headers={locale === 'fa' ? ['نسخه','تاریخ','تهیه‌کننده','شرح تغییر','وضعیت'] : ['Version','Date','Author','Change','Status']}
            rows={documentControl.versions.map(v=>[v.version,v.date,v.author,locale === 'fa' ? fromMap({'Initial assessment record and scope baseline':'ثبت اولیه ارزیابی و تثبیت خط مبنای محدوده','Technical review; WSTG execution register completed':'بازبینی فنی و تکمیل دفتر اجرای آزمون‌های WSTG','Final engineering report issued':'صدور نسخه نهایی گزارش مهندسی'}, v.change) : v.change,locale === 'fa' ? faStatus(v.status) : v.status])}
          />
          <h3>{locale === 'fa' ? 'سوابق تأیید' : 'Approval Record'}</h3>
          <SimpleTable
            headers={locale === 'fa' ? ['نقش','نام / شناسه','تصمیم','تاریخ'] : ['Role','Name / Identifier','Decision','Date']}
            rows={documentControl.approvals.map(a=>[locale === 'fa' ? fromMap({'Lead Assessor':'ارزیاب مسئول','Independent Technical Reviewer':'بازبین فنی مستقل','Security Technical Manager':'مدیر فنی امنیت','Risk Owner':'مالک ریسک'}, a.role) : a.role,a.name,locale === 'fa' ? faStatus(a.decision) : a.decision,a.date])}
          />
          <h3>{locale === 'fa' ? 'توزیع مجاز' : 'Authorized Distribution'}</h3>
          <div className="chip-row">{liveReportMeta.distribution.map(x=><span className="chip" key={x}>{locale === 'fa' ? fromMap({CISO:'مدیر ارشد امنیت اطلاعات','Security Technical Manager':'مدیر فنی امنیت','Digital Banking Product Owner':'مالک محصول','Risk Management':'مدیریت ریسک','Internal Audit':'حسابرسی داخلی'}, x) : x}</span>)}</div>
        </section>

        <section className="report-page" id="executive" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
          <SectionHeading num="02" title={locale === 'fa' ? 'خلاصه مدیریتی' : 'Executive Summary'} subtitle={locale === 'fa' ? 'جمع‌بندی مدیریتی وضعیت امنیت با پشتوانه شواهد فنی قابل ردیابی.' : 'Management-level posture backed by traceable technical evidence.'} icon={<Gauge/>}/>
          <div className="metric-grid">
            <Metric icon={<ClipboardCheck/>} label={locale === 'fa' ? 'آزمون‌های قابل اعمال WSTG' : 'Applicable WSTG Tests'} value={metrics.applicable} sub={locale === 'fa' ? `${metrics.executed} اجراشده · ${metrics.coverage}% پوشش` : `${metrics.executed} executed · ${metrics.coverage}%`}/>
            <Metric icon={<TestTube2/>} label={locale === 'fa' ? 'اجرای اثبات مفهوم' : 'PoC Executions'} value={metrics.pocs} sub={locale === 'fa' ? 'سوابق اجرای PoC نگهداری شده است' : 'all executed demo PoCs retained'}/>
            <Metric icon={<Archive/>} label={locale === 'fa' ? 'اقلام شواهد' : 'Evidence Artifacts'} value={metrics.evidence} sub={locale === 'fa' ? 'فهرست شواهد قابل ردیابی' : 'traceable evidence manifest'}/>
            <Metric icon={<ShieldAlert/>} label={locale === 'fa' ? 'یافته‌های تأییدشده' : 'Confirmed Findings'} value={findings.length} sub={locale === 'fa' ? `${metrics.critical} بحرانی · ${metrics.high} بالا` : `${metrics.critical} Critical · ${metrics.high} High`} danger/>
          </div>
          <div className="two-col">
            <div className="card">
              <h3>{locale === 'fa' ? 'نتیجه ارزیابی' : 'Assessment Conclusion'}</h3>
              <p>{locale === 'fa' ? 'ارزیابی انجام‌شده ضعف‌های بااهمیتی را در اعمال مجوزدهی، مرزهای ورودی و محتوا، مقاومت در برابر سوءاستفاده از هویت، سیاست‌های انتقال و نشست و کنترل‌های سمت کاربر شناسایی کرد. مهم‌ترین ریسک‌ها زمانی شکل می‌گیرند که چند ضعف بتوانند در عبور از مرزهای اعتماد با یکدیگر ترکیب شوند؛ بنابراین تحلیل ریسک صرفاً بر یافته‌های منفرد متکی نیست.' : 'The assessment identified material weaknesses in authorization enforcement, input/content boundaries, identity abuse resistance, transport/session policy and client-side protections. The most significant risks arise from weaknesses that can be combined across trust boundaries rather than from isolated findings alone.'}</p>
              <div className="posture"><span>{locale === 'fa' ? 'ریسک سازمانی' : 'Organizational Risk'}</span><strong>{locale === 'fa' ? 'بالا' : 'HIGH'}</strong><small>{locale === 'fa' ? 'نیازمند اصلاح اولویت‌بندی‌شده و آزمون مجدد مستقل' : 'Requires prioritized remediation and independent retest'}</small></div>
            </div>
            <div className="card">
              <h3>{locale === 'fa' ? 'توزیع یافته‌ها' : 'Finding Distribution'}</h3>
              <div className="severity-bars"><Bar label={locale === 'fa' ? 'بحرانی' : 'Critical'} value={metrics.critical} total={findings.length}/><Bar label={locale === 'fa' ? 'بالا' : 'High'} value={metrics.high} total={findings.length}/><Bar label={locale === 'fa' ? 'متوسط' : 'Medium'} value={metrics.medium} total={findings.length}/></div>
              <h4>{locale === 'fa' ? 'اقدامات فوری مدیریتی' : 'Immediate Management Actions'}</h4>
              <ul>{(locale === 'fa' ? [
                'پیش از انتشار گسترده، مسیرهای بهره‌برداری بحرانی مهار و اصلاح شوند.',
                'با متمرکزسازی مجوزدهی و اصلاح مرزهای ناامن ورودی، زنجیره‌های حمله شکسته شوند.',
                'بستن یافته‌های بحرانی و بالا فقط پس از آزمون مجدد مبتنی بر شواهد انجام شود.',
                'علل ریشه‌ای سیستمی به‌عنوان اقدام مهندسی مستقل پیگیری شوند و صرفاً به تیکت‌های منفرد محدود نمانند.'
              ] : [
                'Mitigate Critical exploit paths before broad release.',
                'Break attack chains by fixing centralized authorization and unsafe input boundaries.',
                'Require evidence-backed retest before closure of Critical/High findings.',
                'Track systemic root causes as engineering initiatives, not individual tickets only.'
              ]).map(x=><li key={x}>{x}</li>)}</ul>
            </div>
          </div>
          <h3>{locale === 'fa' ? 'یافته‌های کلیدی' : 'Key Findings'}</h3>
          <div className="finding-mini-grid">{findings.slice(0,6).map(f=><a className="finding-mini" href={`#${f.id}`} key={f.id}><span className={severityClass(f.severity)}>{locale === 'fa' ? faSeverity(f.severity) : f.severity}</span><strong>{f.id} · {localize(locale,f.title)}</strong><small>{f.asset} · {f.wstg}</small><span className={riskClass(f.organizationalRisk.riskRating)}>{locale === 'fa' ? `ریسک ${faRisk(f.organizationalRisk.riskRating)}` : `Risk ${f.organizationalRisk.riskRating}`}</span></a>)}</div>
        </section>

        {showSupplementaryTechnical && <>
        <section className="report-page" id="context">
          <SectionHeading num="03" title="Assessment Context & Objectives" subtitle="Business/security context required to interpret test results and risk." icon={<Boxes/>}/>
          <div className="data-grid cols-4"><Meta label="Client / Business Unit" value={liveReportMeta.client}/><Meta label="System Criticality" value={assessmentContext.systemCriticality}/><Meta label="Data Classification" value={assessmentContext.dataClassification}/><Meta label="Environment" value={assessmentContext.environment}/></div>
          <div className="two-col"><div><h3>Purpose</h3><p>{assessmentContext.purpose}</p><h3>Business Context</h3><p>{assessmentContext.businessContext}</p><h3>Security Context</h3><p>{assessmentContext.securityContext}</p></div><div className="card"><h3>Assessment Objectives</h3><ol className="numbered">{objectives.map((x,i)=><li key={i}>{x}</li>)}</ol></div></div>
          <h3>Architecture & Trust Boundaries</h3><div className="architecture-flow">{assessmentContext.architecture.map((x,i)=><React.Fragment key={x}><div className="arch-node"><Network size={17}/>{x}</div>{i<assessmentContext.architecture.length-1&&<div className="arch-arrow">↓</div>}</React.Fragment>)}</div>
          <div className="chip-row trust">{assessmentContext.trustBoundaries.map(x=><span className="chip" key={x}>{x}</span>)}</div>
        </section>

        <section className="report-page" id="scope">
          <SectionHeading num="04" title="Scope & Rules of Engagement" subtitle="Exactly what was authorized, tested, excluded and bounded." icon={<Target/>}/>
          <h3>In-Scope Asset Register</h3><SimpleTable headers={['ID','Asset','Type','URL / Host','Environment','Version / Build','Criticality','Data']} rows={assets.map(a=>[a.id,a.name,a.type,a.url,a.environment,`${a.version} / ${a.build}`,a.criticality,a.data])}/>
          <div className="two-col"><div><h3>Roles Exercised</h3><div className="chip-row">{scope.roles.map(x=><span className="chip" key={x}>{x}</span>)}</div><h3>Source Review Baseline</h3><KeyValue obj={scope.sourceReview}/></div><div><h3>Out of Scope</h3><ul>{scope.outOfScope.map(x=><li key={x}>{x}</li>)}</ul><h3>Stop Conditions</h3><ul>{stopConditions.map(x=><li key={x}>{x}</li>)}</ul></div></div>
          <h3>Rules of Engagement</h3><SimpleTable headers={['Activity','Decision','Condition / Boundary']} rows={rulesOfEngagement.map(r=>[r.activity,r.decision,r.condition])}/>
        </section>
        </>}
      </>}

      {showPrimaryTechnical && <>
        {showSupplementaryTechnical && <>
        <section className="report-page" id="methodology">
          <SectionHeading num="05" title="Methodology & Scientific Assurance" subtitle="Repeatable workflow and explicit principles for defensible security conclusions." icon={<Workflow/>}/>
          <div className="method-grid">{methodology.map(m=><div className="method" key={m.step}><span>{m.step}</span><div><strong>{m.name}</strong><p>{m.detail}</p></div></div>)}</div>
          <h3>Scientific Security Reporting Principles</h3><div className="principle-grid">{scientificPrinciples.map(([a,b])=><div className="principle" key={a}><Fingerprint size={18}/><strong>{a}</strong><p>{b}</p></div>)}</div>
          <Callout title="Traceability Backbone" icon={<GitBranch/>}><code>Security Requirement → Test Case → Observation → Evidence → Finding → Root Cause → Attack Path → Technical Impact → Business Impact → Risk → Remediation → Verification Criteria → Retest → Residual Risk</code></Callout>
        </section>

        <section className="report-page" id="standards">
          <SectionHeading num="06" title="Standards Baseline" subtitle="Version-pinned references used for testing, classification, severity, risk and handling." icon={<BookOpen/>}/>
          <Callout title={locale === 'fa' ? 'خط مبنای جاری ISO/IEC 15408' : 'Current ISO/IEC 15408 baseline'} icon={<BookOpen/>}>
            {locale === 'fa' ? `خط مبنای این گزارش برای مجموعه ISO/IEC 15408 به نسخه‌های 2026 به‌روزرسانی شده است. بخش 2 جاری: ${iso15408_2026Baseline.currentPart2}.` : `The ISO/IEC 15408 baseline is pinned to the 2026 editions. Current Part 2: ${iso15408_2026Baseline.currentPart2}.`}
          </Callout>
          <SimpleTable headers={locale === 'fa' ? ['مرجع','ویرایش','انتشار','کاربرد'] : ['Reference','Edition','Publication','Purpose']} rows={iso15408_2026Baseline.seriesParts.map(x=>[x.reference,x.edition,x.publication,locale === 'fa' ? x.purposeFa : x.purposeEn])}/>
          <Callout title={locale === 'fa' ? 'اعلام اجرای OWASP WSTG روی پروژه' : 'OWASP WSTG project execution declaration'} icon={<ClipboardCheck/>}>
            {locale === 'fa'
              ? `خط مبنای آزمون وب این گزارش ${owaspWstgIso15408Crosswalk2026.wstgBaseline} است. هر ۱۲ دسته آزمون WSTG در ارزیابی پروژه پوشش داده و اجرا شده‌اند و ردیابی دسته‌ها به خانواده‌های مرتبط ${owaspWstgIso15408Crosswalk2026.isoBaseline} در بخش F12 ثبت شده است.`
              : `The web-testing baseline is ${owaspWstgIso15408Crosswalk2026.wstgBaseline}. All 12 WSTG categories are declared as covered/executed for the project, with category-to-${owaspWstgIso15408Crosswalk2026.isoBaseline} traceability recorded in F12.`}
          </Callout>
          <SimpleTable headers={['ID','Reference','Version','Purpose','Use in Report']} rows={standards.map(s=>[s.id,s.name,s.version,s.purpose,s.use])}/>
          <Callout title="Version Pinning Rule" icon={<FileSearch/>}>Every assessment records the exact baseline used. Production implementation should never reference an unversioned external standard where identifiers or requirements may change.</Callout>
          <h3>Tools & Instrumentation Register</h3><SimpleTable headers={['Tool','Version','Purpose','Operator']} rows={tools.map(t=>[t.name,t.version,t.purpose,t.operator])}/>
        </section>
        </>}

        <section className="report-page" id="risk-method" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
          <SectionHeading num="07" title={locale === 'fa' ? 'روش ارزیابی ریسک' : 'Risk Assessment Method'} subtitle={locale === 'fa' ? 'شدت فنی آسیب‌پذیری به‌صورت مستقل از ریسک سازمانی ارزیابی و ثبت می‌شود.' : 'Technical vulnerability severity is explicitly separated from organizational risk.'} icon={<Scale/>}/>
          <Callout title={locale === 'fa' ? 'قاعده اصلی' : 'Core Rule'} icon={<AlertTriangle/>}>{locale === 'fa' ? 'شدت فنی و ریسک سازمانی دو رکورد مجزا هستند. CVSS ویژگی‌های شدت فنی آسیب‌پذیری را بیان می‌کند؛ ریسک سازمانی علاوه بر شدت فنی، بحرانی‌بودن دارایی، میزان مواجهه، زمینه تهدید، پیامد کسب‌وکار، کنترل‌های موجود و عدم قطعیت را نیز در نظر می‌گیرد.' : riskMethodology.principle}</Callout>
          <div className="two-col">
            <div className="card"><h3>{locale === 'fa' ? 'شدت فنی' : 'Technical Severity'}</h3><p>{locale === 'fa' ? 'نسخه CVSS، بردار کامل، امتیاز و سطح شدت حاصل ثبت می‌شود. نگهداری بردار کامل باعث می‌شود امتیازدهی قابل بازتولید و بازبینی باشد.' : 'Record CVSS version, complete vector, score and resulting severity. Preserve the vector so the score is reproducible and reviewable.'}</p><code dir="rtl">CVSS v4.0: بردار → امتیاز → شدت فنی</code></div>
            <div className="card"><h3>{locale === 'fa' ? 'ریسک سازمانی' : 'Organizational Risk'}</h3><p>{locale === 'fa' ? 'احتمال و اثر در زمینه واقعی سازمان با توجه به بحرانی‌بودن دارایی، میزان مواجهه، پیامدهای کسب‌وکار، شواهد تهدید، کنترل‌های موجود، قابلیت کشف و میزان اطمینان ارزیابی می‌شود.' : 'Evaluate contextual likelihood and impact using asset criticality, exposure, business consequences, threat evidence, controls, detection and confidence.'}</p><code dir="rtl">زمینه + احتمال + اثر + کنترل‌ها → ریسک سازمانی</code></div>
          </div>
          <h3>{locale === 'fa' ? 'عوامل تصمیم‌گیری' : 'Decision Factors'}</h3>
          <div className="chip-row">{riskMethodology.decisionFactors.map(x=><span className="chip" key={x}>{locale === 'fa' ? fromMap({'Technical severity':'شدت فنی','Exploit preconditions':'پیش‌شرط‌های بهره‌برداری','Exposure':'میزان مواجهه','Asset criticality':'بحرانی‌بودن دارایی','Business impact':'اثر کسب‌وکار','Threat context':'زمینه تهدید','Existing controls':'کنترل‌های موجود','Compensating controls':'کنترل‌های جبرانی','Detection capability':'قابلیت کشف','Confidence':'میزان اطمینان'}, x) : x}</span>)}</div>
          <h3>{locale === 'fa' ? 'حاکمیت پذیرش ریسک' : 'Risk Acceptance Governance'}</h3>
          <p>{locale === 'fa' ? 'پذیرش ریسک باید توسط مالک مجاز ریسک با ثبت دلیل، کنترل‌های جبرانی، تاریخ انقضا و معیار بازبینی انجام شود. پذیرش ریسک جایگزین اصلاح فنی نیست و باید در چرخه حاکمیت ریسک قابل ردیابی باقی بماند.' : riskMethodology.acceptanceRule}</p>
        </section>

        <section className="report-page" id="coverage-matrix" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
          <SectionHeading num="08" title={locale === 'fa' ? 'ماتریس پوشش امنیت' : 'Security Coverage Matrix'} subtitle={locale === 'fa' ? 'پوشش نشان می‌دهد چه مواردی آزمون شده‌اند و به معنای ادعای امنیت مطلق سامانه نیست.' : 'Coverage is evidence of what was tested—not a claim of absolute security.'} icon={<ClipboardCheck/>}/>
          <div className="metric-grid compact"><Metric label={locale === 'fa' ? 'خط مبنای WSTG' : 'WSTG Baseline'} value={metrics.total} sub={locale === 'fa' ? 'آزمون‌های سطح بالای v4.2' : 'top-level v4.2 test items'}/><Metric label={locale === 'fa' ? 'قابل اعمال' : 'Applicable'} value={metrics.applicable} sub={locale === 'fa' ? `${metrics.na} مورد نامرتبط` : `${metrics.na} not applicable`}/><Metric label={locale === 'fa' ? 'اجراشده' : 'Executed'} value={metrics.executed} sub={locale === 'fa' ? `${metrics.coverage}% پوشش موارد قابل اعمال` : `${metrics.coverage}% applicable coverage`}/><Metric label={locale === 'fa' ? 'موفق / ناموفق / ناقص' : 'PASS / FAIL / PARTIAL'} value={`${metrics.pass} / ${metrics.fail} / ${metrics.partial}`} sub={locale === 'fa' ? 'نتایج در سطح آزمون' : 'test-level verdicts'}/></div>
          <Callout title={locale === 'fa' ? 'پوشش ۱۲ دسته OWASP WSTG' : '12-category OWASP WSTG coverage'} icon={<TestTube2/>}>
            {locale === 'fa' ? 'ساختار پوشش این گزارش شامل هر ۱۲ دسته OWASP WSTG است؛ از جمع‌آوری اطلاعات تا آزمون API. ماتریس ردیابی این دسته‌ها به ISO/IEC 15408-2:2026 در بخش F12 نگهداری می‌شود.' : 'The coverage model includes all 12 OWASP WSTG categories, from Information Gathering through API Testing. Their ISO/IEC 15408-2:2026 traceability is maintained in F12.'}
          </Callout>
          <h3>{locale === 'fa' ? 'پوشش دسته‌های WSTG' : 'WSTG Category Coverage'}</h3>
          <SimpleTable headers={locale === 'fa' ? ['دسته','تعداد آزمون','موفق','ناموفق','ناقص','نامرتبط','PoC','شواهد'] : ['Category','Tests','PASS','FAIL','PARTIAL','N/A','PoCs','Evidence']} rows={categories.map(c=>{const a=wstgItems.filter(t=>t.category===c.code);return [localize(locale,c.name),a.length,a.filter(x=>x.verdict==='PASS').length,a.filter(x=>x.verdict==='FAIL').length,a.filter(x=>x.verdict==='PARTIAL').length,a.filter(x=>x.verdict==='N/A').length,a.reduce((n,x)=>n+x.pocCount,0),a.reduce((n,x)=>n+x.evidenceCount,0)]})}/>
          <h3>{locale === 'fa' ? 'پوشش نقش مجوزدهی × تکنیک آزمون' : 'Authorization Role × Technique Coverage'}</h3>
          <SimpleTable headers={locale === 'fa' ? ['نقش','GET','POST','PUT','DELETE','تعویض شیء','دور زدن نقش','دسترسی مستقیم'] : ['Role','GET','POST','PUT','DELETE','Object Swap','Role Bypass','Direct Access']} rows={authorizationCoverage.map(r=>{const cv=(v:string)=>locale === 'fa' ? fromMap({Tested:'آزمون‌شده',Limited:'محدود','N/A':'نامرتبط'}, v) : v; return [locale === 'fa' ? fromMap({Anonymous:'ناشناس',Customer:'مشتری','Support Operator':'کاربر پشتیبانی','Operations Manager':'مدیر عملیات',Administrator:'مدیر سامانه'}, r.role) : r.role,cv(r.GET),cv(r.POST),cv(r.PUT),cv(r.DELETE),cv(r.objectSwap),cv(r.roleBypass),cv(r.directAccess)]})}/>
          <Callout title={locale === 'fa' ? 'معنای نتیجه موفق' : 'PASS Semantics'} icon={<CheckCircle2/>}>{locale === 'fa' ? 'نتیجه موفق فقط به این معناست که در شرایط ثبت‌شده آزمون، رفتار آسیب‌پذیر مشاهده نشده است. این نتیجه به معنای امنیت مطلق برنامه نیست و در این چارچوب بدون رکورد اجرای قابل ردیابی صادر نمی‌شود.' : 'A PASS means no vulnerable behavior was observed under the recorded test conditions. It does not mean the application is globally secure, and a PASS cannot be issued without a traceable execution record in this framework.'}</Callout>
        </section>

        <section className="report-page" id="findings-summary" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
          <SectionHeading num="09" title={locale === 'fa' ? 'خلاصه یافته‌ها' : 'Findings Summary'} subtitle={locale === 'fa' ? 'خلاصه یافته‌های مهندسی با نمایش مستقل شدت فنی و ریسک سازمانی.' : 'Engineering findings with technical severity and organizational risk shown separately.'} icon={<ShieldAlert/>}/>
          <SimpleTable headers={locale === 'fa' ? ['شناسه','یافته','دارایی','WSTG','شدت','CVSS','ریسک'] : ['ID','Finding','Asset','WSTG','Severity','CVSS','Risk']} rows={findings.map(f=>[f.id,localize(locale,f.title),f.asset,f.wstg,<span key="cell-4" className={severityClass(f.severity)}>{locale === 'fa' ? faSeverity(f.severity) : f.severity}</span>,f.cvssScore,<span key="cell-6" className={riskClass(f.organizationalRisk.riskRating)}>{locale === 'fa' ? faRisk(f.organizationalRisk.riskRating) : f.organizationalRisk.riskRating}</span>])}/>
        </section>

        <section className="report-page" id="findings" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
          <SectionHeading num="10" title={locale === 'fa' ? 'یافته‌های امنیتی تفصیلی' : 'Detailed Security Findings'} subtitle={locale === 'fa' ? 'هر یافته یک رکورد مهندسی مستقل و مبتنی بر شواهد است.' : 'Each finding is a self-contained, evidence-backed engineering record.'} icon={<ShieldAlert/>}/>
          <div className="finding-stack">{findings.map(f=><FindingRecord key={f.id} f={f} expanded={expandedFindings.has(f.id)} onToggle={()=>toggleSet(setExpandedFindings,f.id)} locale={locale}/>)}</div>
        </section>

        {showSupplementaryTechnical && <>
        <section className="report-page" id="wstg">
          <SectionHeading
            num="11"
            title={locale === 'fa' ? 'دفتر اجرای آزمون‌های OWASP WSTG' : 'OWASP WSTG Test Execution Register'}
            subtitle={locale === 'fa' ? `تمام ${metrics.total} آزمون سطح بالای WSTG v4.2 در ${categories.length} دسته در رجیستر نگهداری می‌شوند و برای آزمون‌های قابل اعمال، PoC و شواهد اجرای آزمون قابل ردیابی است.` : `All ${metrics.total} top-level WSTG v4.2 items across ${categories.length} categories are represented; applicable test records retain executed PoC and evidence traceability.`}
            icon={<TestTube2/>}
          />
          <div className="filters no-print"><div className="searchbox"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search WSTG ID, title, asset, PoC, finding..."/></div><select value={category} onChange={e=>setCategory(e.target.value)}><option value="ALL">All categories</option>{categories.map(c=><option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}</select><select value={verdict} onChange={e=>setVerdict(e.target.value)}><option value="ALL">All verdicts</option>{['PASS','FAIL','PARTIAL','N/A'].map(v=><option key={v}>{v}</option>)}</select></div>
          <div className="wstg-register">{filteredTests.map(t=><WstgRecord key={t.id} t={t} expanded={expandedTests.has(t.id)} onToggle={()=>toggleSet(setExpandedTests,t.id)}/>)}</div>
        </section>

        <section className="report-page" id="attack-chains">
          <SectionHeading num="12" title="Attack Chain Analysis" subtitle="Compound risk created when individual weaknesses can be sequenced." icon={<GitBranch/>}/>
          <div className="chain-grid">{attackChains.map(c=><div className="chain-card" key={c.id}><div className="chain-head"><span>{c.id}</span><strong>{c.name}</strong><span className={riskClass(c.risk)}>{c.risk}</span></div><p><b>Entry:</b> {c.entry}</p><div className="chain-flow">{c.steps.map((s,i)=><React.Fragment key={s}><div>{s}</div>{i<c.steps.length-1&&<span>→</span>}</React.Fragment>)}</div><p><b>Target:</b> {c.target}</p><p><b>Impact:</b> {c.impact}</p><p><b>Required conditions:</b> {c.conditions}</p></div>)}</div>
        </section>

        <section className="report-page" id="root-causes">
          <SectionHeading num="13" title="Systemic Root Cause Analysis" subtitle="Findings grouped into architectural causes to drive durable engineering change." icon={<Database/>}/>
          <div className="root-grid">{systemicRootCauses.map(r=><div className="root-card" key={r.id}><div><span>{r.id}</span><strong>{r.name}</strong><small>{r.layer}</small></div><span className={severityClass(r.severity)}>{r.severity}</span><p><b>Findings:</b> {r.findings.join(', ')}</p><p><b>Engineering change:</b> {r.change}</p></div>)}</div>
        </section>

        <section className="report-page" id="roadmap">
          <SectionHeading num="14" title="Remediation Roadmap" subtitle="Prioritized engineering response tied to closure criteria—not severity labels alone." icon={<Wrench/>}/>
          <SimpleTable headers={['Phase','Target Window','Focus','Items','Owner','Exit Criteria']} rows={remediationRoadmap.map(r=>[r.phase,r.window,r.focus,r.items.join(', '),r.owner,r.exit])}/>
          <Callout title="Closure Rule" icon={<RefreshCw/>}>A finding is not considered closed because code changed. Closure requires verification criteria to pass in an appropriate environment, retest evidence to be attached, and residual risk to be explicitly recorded.</Callout>
        </section>
        </>}
      </>}

      {showCore && <section className="report-page" id="limitations" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
        <SectionHeading num="15" title={locale === 'fa' ? 'محدودیت‌ها و بیانیه اطمینان' : 'Limitations & Assurance Statement'} subtitle={locale === 'fa' ? 'مرزهای ارزیابی، فرضیات و سطح اتکاپذیری نتیجه‌های این گزارش.' : "Boundaries, assumptions and the exact strength of the report's conclusions."} icon={<Eye/>}/>
        <div className="two-col">
          <div><h3>{locale === 'fa' ? 'محدودیت‌ها' : 'Limitations'}</h3><ul>{(locale === 'fa' ? [
            'نتایج ارزیابی فقط به نسخه‌ها، محیط، نقش‌ها، پیکربندی، محدوده و بازه زمانی ثبت‌شده در این گزارش مربوط است.',
            'آزمون محدود به زمان نمی‌تواند نبود همه آسیب‌پذیری‌ها را اثبات کند؛ نتیجه موفق فقط به این معناست که در شرایط ثبت‌شده آزمون، شکست کنترل مشاهده نشده است.',
            'آزمون منع سرویس، آزمون‌های مخرب، دسترسی به داده واقعی مشتری و سامانه‌های شخص ثالث خارج از محدوده انجام نشده است.',
            'ابزارهای خودکار به‌عنوان ابزار کمکی استفاده شده‌اند و یافته‌های تأییدشده نیازمند اعتبارسنجی تحلیلگر هستند.',
            'برآورد اثر کسب‌وکار یک قضاوت مهندسی زمینه‌محور است و باید با فرایند رسمی مدیریت ریسک سازمان تطبیق داده شود.',
            'هش‌ها و شناسه‌های نمایشی در داده فعلی نمونه هستند؛ در محیط عملیاتی باید هش شواهد از داده تغییرناپذیر محاسبه و با کنترل دسترسی محافظت شود.'
          ] : limitations).map(x=><li key={x}>{x}</li>)}</ul></div>
          <div><h3>{locale === 'fa' ? 'فرضیات' : 'Assumptions'}</h3><ul>{(locale === 'fa' ? [
            'نسخه ساخت محیط پیش‌تولید برای مولفه‌های آزمون‌شده نماینده معماری امنیتی موردنظر محیط تولید است.',
            'نقش‌ها و مجوزهای آزمون ارائه‌شده، مدل مجوزدهی مستندشده سامانه را به‌درستی نمایندگی می‌کنند.',
            'داده مصنوعی، گردش‌کارهای حساس امنیتی را بدون افشای اطلاعات واقعی مشتری به‌درستی فعال می‌کند.',
            'کنترل‌های شبکه و لبه موجود در زمان آزمون، مگر آنکه خلاف آن ذکر شده باشد، نماینده استقرار هدف هستند.'
          ] : assumptions).map(x=><li key={x}>{x}</li>)}</ul></div>
        </div>
        <div className="assurance"><ShieldCheck size={28}/><div><strong>{locale === 'fa' ? 'بیانیه اطمینان آزمایشگاه' : 'Laboratory Assurance Statement'}</strong><p>{locale === 'fa' ? 'در محدوده تعریف‌شده، قواعد اجرا، محیط، بازه آزمون و محدودیت‌های مستند، آزمایشگاه فعالیت‌های راستی‌آزمایی ثبت‌شده را اجرا کرده و شواهد قابل ردیابی برای نتیجه‌های ارائه‌شده نگهداری کرده است. مشاهده‌نشدن یک یافته، اثبات‌کننده نبود آسیب‌پذیری در خارج از شرایط آزمون‌شده نیست.' : assuranceStatement}</p></div></div>
        <h3>{locale === 'fa' ? 'ردپای ممیزی سطح گزارش' : 'Report-Level Audit Trail'}</h3>
        <SimpleTable headers={locale === 'fa' ? ['زمان','عامل','رویداد'] : ['Timestamp','Actor','Event']} rows={reportAuditTrail.map((x,i)=>[x.time,locale === 'fa' ? ['هماهنگ‌کننده ارزیابی','ارزیاب مسئول','تیم بازبینی فنی','مدیر فنی امنیت'][i] : x.actor,locale === 'fa' ? ['ارزیابی مجاز شد و محدوده تثبیت گردید','بازه اصلی اجرای آزمون‌های WSTG تکمیل شد','یافته‌های بحرانی و بالا به‌صورت مستقل بازبینی شدند','گزارش نهایی برای انتشار تأیید شد'][i] : x.event])}/>
      </section>}

      {showAnnex && <section className="report-page annex" id="evidence" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
        <SectionHeading num="A" title={locale === 'fa' ? 'گزارش مستقل پیوست فنی شواهد' : 'Standalone Technical Evidence Annex'} subtitle={locale === 'fa' ? 'ردیابی کامل آزمون، اثبات مفهوم و شواهد در یک گزارش مستقل.' : 'Complete test/PoC/evidence traceability in a standalone evidence report.'} icon={<Archive/>}/>
        <div className="annex-banner"><strong>{metrics.pocs} {locale === 'fa' ? 'اجرای اثبات مفهوم' : 'PoC executions'}</strong><span>→</span><strong>{metrics.evidence} {locale === 'fa' ? 'قلم شواهد' : 'evidence artifacts'}</strong><span>→</span><strong>{findings.length} {locale === 'fa' ? 'یافته مهندسی' : 'engineering findings'}</strong></div>
        <p className="muted">{locale === 'fa' ? 'این پیوست شامل رکوردهای تفصیلی آزمون است. در محیط عملیاتی، شواهد خام حساس می‌توانند در مخزن کنترل‌شده شواهد نگهداری شوند و گزارش فقط ارجاع‌ها، نسخه‌های ماسک‌شده و فراداده یکپارچگی را نمایش دهد.' : 'This annex deliberately contains detailed test records. In a production deployment, raw sensitive evidence can remain in a controlled evidence repository while the report contains references, redacted renderings and integrity metadata.'}</p>
        {wstgItems.map(t=><AnnexTest key={t.id} t={t} locale={locale}/>) }
      </section>}

      {showRegisters && <section className="report-page" id="registers" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
        <SectionHeading num="B" title={locale === 'fa' ? 'دفاتر، واژه‌نامه و فرهنگ داده' : 'Registers, Glossary & Data Dictionary'} subtitle={locale === 'fa' ? 'رکوردهای پشتیبان برای گزارش‌پذیری ماشینی و ممیزی.' : 'Supporting controlled records required for machine-readable reporting and audit.'} icon={<ListChecks/>}/>
        <h3>{locale === 'fa' ? 'فهرست شواهد — نمایه منتخب' : 'Evidence Manifest — Representative Index'}</h3>
        <SimpleTable headers={locale === 'fa' ? ['شناسه شاهد','نوع','WSTG','اثبات مفهوم (PoC)','یافته','دارایی','SHA-256','ماسک‌سازی'] : ['Evidence ID','Type','WSTG','PoC','Finding','Asset','SHA-256','Redaction']} rows={evidenceIndex.slice(0,24).map(e=>[e.id,e.type,e.wstgId,e.pocId,e.findingId,e.asset,e.sha256.slice(0,16)+'…',e.redaction])}/>
        <p className="muted">{locale === 'fa' ? `فهرست کامل شامل ${evidenceIndex.length} رکورد است و از طریق خروجی CSV فهرست شواهد قابل دریافت است.` : `The complete manifest contains ${evidenceIndex.length} records and is available from the Evidence Manifest CSV export.`}</p>
        <h3>{locale === 'fa' ? 'واژه‌نامه' : 'Glossary'}</h3>
        <SimpleTable headers={locale === 'fa' ? ['اصطلاح','تعریف'] : ['Term','Definition']} rows={glossary.map(([term,definition])=>[term,locale === 'fa' ? (fromMap({
          'Assessment':'فعالیت مجاز و محدوده‌بندی‌شده راستی‌آزمایی امنیت که در این گزارش مستند می‌شود.',
          'Finding':'رکورد ضعف امنیتی مبتنی بر شواهد که نیازمند اقدام مهندسی یا تصمیم ریسک است.',
          'PoC':'اجرای ثبت‌شده اثبات یا راستی‌آزمایی برای آزمون یک فرضیه امنیتی.',
          'Evidence':'قلم قابل ردیابی که از مشاهده یا نتیجه آزمون پشتیبانی می‌کند.',
          'Technical Severity':'ویژگی‌های شدت فنی آسیب‌پذیری که مستقل از ریسک سازمانی ثبت می‌شود.',
          'Organizational Risk':'ریسک زمینه‌ای با درنظرگرفتن اثر کسب‌وکار، احتمال، بحرانی‌بودن دارایی، کنترل‌ها و زمینه تهدید.',
          'Residual Risk':'ریسکی که پس از اصلاح یا اعمال کنترل‌های جبرانی باقی می‌ماند.',
          'PASS':'در شرایط مستند آزمون، شکست کنترل مشاهده نشده است؛ این وضعیت به معنای امنیت مطلق نیست.',
          'N/A':'هدف آزمون برای فناوری یا قابلیت داخل محدوده قابل اعمال نیست.'
        }, term) || definition) : definition])}/>
        <h3>{locale === 'fa' ? 'فرهنگ داده یافته — فیلدهای اصلی' : 'Finding Data Dictionary — Core Fields'}</h3>
        <SimpleTable headers={locale === 'fa' ? ['فیلد','نوع','الزام','تعریف'] : ['Field','Type','Requirement','Definition']} rows={dataDictionary.map(([field,type,requirement,definition])=>[field,type,requirement,locale === 'fa' ? (fromMap({
          'Finding ID':'شناسه یکتا و پایدار برای یافته مهندسی.',
          'Security Requirement':'ویژگی امنیتی که انتظار می‌رود سامانه آن را اعمال کند.',
          'Observation':'رفتار مستقیماً مشاهده‌شده که از تفسیر تحلیلی جدا ثبت می‌شود.',
          'Evidence IDs':'ارجاع‌های قابل ردیابی به اقلام شواهد پشتیبان.',
          'CWE':'طبقه‌بندی ضعف در موارد قابل اعمال.',
          'CVSS Vector':'بردار کامل شدت فنی؛ صرفاً امتیاز عددی کافی نیست.',
          'Organizational Risk':'رکورد زمینه‌ای احتمال، اثر و کنترل‌ها.',
          'Root Cause':'تحلیل مهندسی علت و لایه متاثر.',
          'Verification Criteria':'آزمون‌های صریح موردنیاز برای اثبات بسته‌شدن اصلاح.',
          'Retest Record':'شواهد بسته‌شدن پس از اصلاح.',
          'Residual Risk':'ریسک باقی‌مانده پس از اصلاح یا کنترل‌ها.',
          'Risk Acceptance':'مالک، دلیل، تأیید و تاریخ انقضا در صورت پذیرش ریسک.',
          'Audit Trail':'تاریخچه تغییرناپذیر تغییرات بااهمیت وضعیت یافته.'
        }, field) || definition) : definition])}/>
      </section>}

      <footer className="report-footer"><span>{liveReportMeta.reportId} · v{liveReportMeta.version}</span><span>{locale === 'fa' ? faClassification(liveReportMeta.classification) : liveReportMeta.classification}</span><span>{locale === 'fa' ? 'آزمایشگاه امنیت و مهندسی کیفیت نرم‌افزار' : liveReportMeta.organization}</span></footer>
    </main>
  </div>;
}

function ManagementReportSections({locale,metrics,liveReportMeta}:{locale:'en'|'fa';metrics:any;liveReportMeta:any}){
  const priorityFindings = findings.filter(f=>f.severity==='Critical'||f.severity==='High');
  const faRoadmap = (r:any) => [
    fromMap({'P0 — Emergency':'P0 — فوری','P1 — High':'P1 — بالا','P2 — Platform':'P2 — پلتفرم','Strategic':'راهبردی'}, r.phase),
    fromMap({'24–72 hours':'24 تا 72 ساعت','7 days':'7 روز','30 days':'30 روز','30–90 days':'30 تا 90 روز'}, r.window),
    fromMap({
      'Critical exploit paths / exposure reduction':'مهار مسیرهای بهره‌برداری بحرانی و کاهش مواجهه',
      'High-severity findings and attack-chain breakers':'رفع یافته‌های سطح بالا و شکستن زنجیره‌های حمله',
      'Medium findings and centralized policy gaps':'رفع یافته‌های متوسط و شکاف‌های سیاست متمرکز',
      'Systemic root causes and SDLC controls':'رفع علل ریشه‌ای سیستمی و تقویت کنترل‌های چرخه توسعه'
    }, r.focus),
    r.items.join('، '),
    fromMap({
      'Application & API Engineering':'تیم مهندسی برنامه و API',
      'Product Security + Service Owners':'امنیت محصول و مالکان سرویس',
      'Platform / IAM / Web Engineering':'مهندسی پلتفرم / IAM / وب',
      'Architecture + Security Engineering':'معماری و مهندسی امنیت'
    }, r.owner),
    fromMap({
      'Immediate mitigation deployed and permanent fix in controlled validation.':'کنترل فوری اعمال شده و اصلاح دائمی وارد مرحله اعتبارسنجی کنترل‌شده شده باشد.',
      'Fix merged, security regression tests passing, ready for independent retest.':'اصلاح ادغام شده، آزمون‌های رگرسیون امنیتی موفق باشند و مورد برای آزمون مجدد مستقل آماده باشد.',
      'Baseline policy centrally enforced and verified across all assets.':'خط مبنای سیاست امنیتی به‌صورت متمرکز اعمال و در همه دارایی‌های مرتبط راستی‌آزمایی شده باشد.',
      'Control owners, automated verification, telemetry and governance integrated into delivery lifecycle.':'مالک کنترل، راستی‌آزمایی خودکار، تله‌متری و حاکمیت در چرخه تحویل یکپارچه شده باشند.'
    }, r.exit)
  ];

  return <>
    <section className="report-page" id="management-posture" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <SectionHeading num="M1" title={locale === 'fa' ? 'وضعیت کلان امنیت و جمع‌بندی مدیریتی' : 'Management Security Posture'} subtitle={locale === 'fa' ? 'خلاصه تصمیم‌محور از وضعیت امنیت، سطح ریسک و مهم‌ترین پیام‌های مدیریتی.' : 'Decision-oriented summary of security posture, risk and management priorities.'} icon={<Gauge/>}/>
      <div className="metric-grid">
        <Metric icon={<ShieldAlert/>} label={locale === 'fa' ? 'ریسک کلی سازمانی' : 'Overall Organizational Risk'} value={locale === 'fa' ? 'بالا' : 'HIGH'} sub={locale === 'fa' ? 'نیازمند اقدام اصلاحی اولویت‌دار' : 'Prioritized remediation required'} danger/>
        <Metric icon={<AlertTriangle/>} label={locale === 'fa' ? 'یافته‌های بحرانی' : 'Critical Findings'} value={metrics.critical} sub={locale === 'fa' ? 'بالاترین اولویت اصلاح' : 'Highest remediation priority'} danger/>
        <Metric icon={<ShieldAlert/>} label={locale === 'fa' ? 'یافته‌های سطح بالا' : 'High Findings'} value={metrics.high} sub={locale === 'fa' ? 'نیازمند رسیدگی سریع' : 'Rapid treatment required'} danger/>
        <Metric icon={<ClipboardCheck/>} label={locale === 'fa' ? 'پوشش آزمون‌های قابل اعمال' : 'Applicable Test Coverage'} value={`${metrics.coverage}%`} sub={locale === 'fa' ? `${metrics.executed} آزمون اجراشده از ${metrics.applicable} مورد قابل اعمال` : `${metrics.executed} of ${metrics.applicable} applicable tests executed`}/>
      </div>
      <div className="two-col">
        <div className="card">
          <h3>{locale === 'fa' ? 'جمع‌بندی برای تصمیم‌گیری' : 'Decision Summary'}</h3>
          <p>{locale === 'fa'
            ? `در ارزیابی انجام‌شده ${findings.length} یافته امنیتی تأییدشده ثبت شده است که شامل ${metrics.critical} یافته بحرانی، ${metrics.high} یافته سطح بالا و ${metrics.medium} یافته متوسط است. وجود ضعف‌های بحرانی در مرزهای مجوزدهی و اعتبارسنجی ورودی، همراه با قابلیت ترکیب برخی ضعف‌ها در زنجیره‌های حمله، باعث شده است ریسک کلی سازمانی سامانه در سطح «بالا» ارزیابی شود.`
            : `The assessment records ${findings.length} confirmed security findings, including ${metrics.critical} Critical, ${metrics.high} High and ${metrics.medium} Medium findings. Critical weaknesses at authorization and input-validation boundaries, together with compound attack-chain potential, support an overall organizational risk rating of HIGH.`}</p>
          <p>{locale === 'fa'
            ? 'از دید مدیریتی، بستن یافته‌های بحرانی و سطح بالا باید بر مبنای اصلاح فنی، آزمون مجدد مستقل و شواهد قابل ردیابی انجام شود. هر ریسک باقی‌مانده که قرار است پذیرفته شود باید مالک مشخص، دلیل مستند، کنترل جبرانی و تاریخ بازبینی داشته باشد.'
            : 'From a management perspective, Critical and High findings should close only after technical remediation, independent retest and traceable evidence. Any accepted residual risk should have an accountable owner, documented rationale, compensating controls and a review date.'}</p>
        </div>
        <div className="card">
          <h3>{locale === 'fa' ? 'پیام‌های اصلی برای مدیریت' : 'Management Messages'}</h3>
          <ul>{(locale === 'fa' ? [
            'اقدام فوری روی دو یافته بحرانی و کاهش سطح مواجهه تا زمان اصلاح دائمی.',
            'رفع یافته‌های سطح بالا با تمرکز بر مجوزدهی، کنترل هویت، ورودی‌های ناامن و مسیرهای جایگزین دسترسی.',
            'تبدیل علل ریشه‌ای مشترک به اقدامات مهندسی سیستمی، نه صرفاً بستن تیکت‌های منفرد.',
            'الزام آزمون مجدد مستقل و ثبت شواهد برای بستن یافته‌های بحرانی و سطح بالا.',
            'ثبت رسمی مالک و تصمیم پذیرش برای هر ریسک باقی‌مانده پس از اصلاح.'
          ] : [
            'Act immediately on the two Critical findings and reduce exposure until permanent remediation is validated.',
            'Prioritize High findings across authorization, identity abuse resistance, unsafe input boundaries and alternate access paths.',
            'Treat shared root causes as systemic engineering initiatives rather than isolated tickets.',
            'Require independent retest and evidence before closing Critical and High findings.',
            'Record an accountable owner and formal acceptance decision for any residual risk.'
          ]).map(x=><li key={x}>{x}</li>)}</ul>
        </div>
      </div>
    </section>

    <section className="report-page" id="management-risks" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <SectionHeading num="M2" title={locale === 'fa' ? 'ریسک‌های اولویت‌دار و اثر کسب‌وکار' : 'Priority Risks & Business Impact'} subtitle={locale === 'fa' ? 'تمرکز مدیریتی بر یافته‌هایی که می‌توانند بیشترین اثر را بر داده، دسترسی و عملیات ایجاد کنند.' : 'Management focus on findings with the greatest potential impact to data, access and operations.'} icon={<ShieldAlert/>}/>
      <div className="two-col">
        <div className="card"><h3>{locale === 'fa' ? 'توزیع شدت فنی' : 'Technical Severity Distribution'}</h3><div className="severity-bars"><Bar label={locale === 'fa' ? 'بحرانی' : 'Critical'} value={metrics.critical} total={findings.length}/><Bar label={locale === 'fa' ? 'بالا' : 'High'} value={metrics.high} total={findings.length}/><Bar label={locale === 'fa' ? 'متوسط' : 'Medium'} value={metrics.medium} total={findings.length}/></div></div>
        <div className="card"><h3>{locale === 'fa' ? 'ریسک ترکیبی' : 'Compound Risk'}</h3><p>{locale === 'fa' ? `تحلیل گزارش ${attackChains.length} زنجیره حمله بالقوه را ثبت کرده است. مهم‌ترین نگرانی مدیریتی این است که ضعف‌های هویت، مجوزدهی، ورودی و مرزهای اعتماد در صورت ترکیب، اثری فراتر از شدت هر یافته به‌تنهایی ایجاد کنند.` : `The report records ${attackChains.length} potential attack chains. The principal management concern is that identity, authorization, input and trust-boundary weaknesses can combine to create impact greater than any isolated finding.`}</p></div>
      </div>
      <h3>{locale === 'fa' ? 'یافته‌های بحرانی و سطح بالا' : 'Critical and High Findings'}</h3>
      <SimpleTable headers={locale === 'fa' ? ['شناسه','یافته','دارایی','شدت','CVSS','اثر کسب‌وکار'] : ['ID','Finding','Asset','Severity','CVSS','Business Impact']} rows={priorityFindings.map(f=>[f.id,localize(locale,f.title),f.asset,<span key="cell-3" className={severityClass(f.severity)}>{locale === 'fa' ? faSeverity(f.severity) : f.severity}</span>,f.cvssScore,localize(locale,f.businessImpact)])}/>
      <Callout title={locale === 'fa' ? 'اصل تصمیم‌گیری' : 'Decision Principle'} icon={<Scale/>}>{locale === 'fa' ? 'اولویت اصلاح فقط از امتیاز CVSS استخراج نمی‌شود. ریسک سازمانی باید اثر کسب‌وکار، بحرانی‌بودن دارایی، میزان مواجهه، قابلیت بهره‌برداری، کنترل‌های موجود و امکان تشکیل زنجیره حمله را نیز در نظر بگیرد.' : 'Remediation priority is not derived from CVSS alone. Organizational risk also considers business impact, asset criticality, exposure, exploitability, existing controls and attack-chain potential.'}</Callout>
    </section>

    <section className="report-page" id="management-coverage" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <SectionHeading num="M3" title={locale === 'fa' ? 'پوشش ارزیابی و قابلیت اتکای نتایج' : 'Assessment Coverage & Assurance'} subtitle={locale === 'fa' ? 'نمای مدیریتی از دامنه آزمون، شواهد و استانداردهای مرجع.' : 'Management view of test scope, evidence and reference standards.'} icon={<ClipboardCheck/>}/>
      <div className="metric-grid compact">
        <Metric label={locale === 'fa' ? 'دسته‌های OWASP WSTG' : 'OWASP WSTG Categories'} value="12" sub={locale === 'fa' ? 'هر 12 دسته در ساختار ارزیابی پوشش داده شده‌اند' : 'all 12 categories represented'}/>
        <Metric label={locale === 'fa' ? 'آزمون‌های قابل اعمال' : 'Applicable Tests'} value={metrics.applicable} sub={locale === 'fa' ? `${metrics.executed} مورد اجراشده` : `${metrics.executed} executed`}/>
        <Metric label={locale === 'fa' ? 'اثبات‌های مفهوم' : 'PoC Executions'} value={metrics.pocs} sub={locale === 'fa' ? 'دارای رکورد اجرای قابل ردیابی' : 'traceable execution records'}/>
        <Metric label={locale === 'fa' ? 'اقلام شواهد' : 'Evidence Artifacts'} value={metrics.evidence} sub={locale === 'fa' ? 'دارای شناسه و فراداده شواهد' : 'identified evidence metadata'}/>
      </div>
      <h3>{locale === 'fa' ? 'خط مبنای استانداردها و روش‌ها' : 'Standards and Method Baseline'}</h3>
      <SimpleTable headers={locale === 'fa' ? ['مرجع','نسخه / خط مبنا','کاربرد مدیریتی'] : ['Reference','Version / Baseline','Management Use']} rows={locale === 'fa' ? [
        ['OWASP WSTG','v4.2 Stable','طبقه‌بندی و پوشش آزمون‌های امنیت وب در 12 دسته'],
        ['ISO/IEC 15408','نسخه‌های جاری 2026','ردیابی الزامات کارکردی امنیت و ساختار ارزیابی'],
        ['OWASP ASVS','5.0.0','مرجع الزامات راستی‌آزمایی امنیت برنامه'],
        ['CVSS','v4.0','ثبت شدت فنی مستقل از ریسک سازمانی']
      ] : [
        ['OWASP WSTG','v4.2 Stable','Web-security testing taxonomy and coverage across 12 categories'],
        ['ISO/IEC 15408','2026 current baseline','Security functional requirement traceability and evaluation structure'],
        ['OWASP ASVS','5.0.0','Application-security verification requirement reference'],
        ['CVSS','v4.0','Technical severity recorded separately from organizational risk']
      ]}/>
      <Callout title={locale === 'fa' ? 'معنای پوشش و نتیجه موفق' : 'Meaning of Coverage and PASS'} icon={<CheckCircle2/>}>{locale === 'fa' ? 'پوشش آزمون نشان می‌دهد چه مواردی در دامنه تعریف‌شده بررسی شده‌اند؛ نتیجه موفق به معنای نبود مطلق آسیب‌پذیری نیست. نتیجه‌های گزارش فقط در محدوده نسخه، محیط، نقش‌ها، پیکربندی و بازه زمانی ثبت‌شده معتبر هستند.' : 'Coverage shows what was examined within the defined scope; PASS does not establish the absolute absence of vulnerabilities. Conclusions apply only to the recorded version, environment, roles, configuration and test window.'}</Callout>
    </section>

    <section className="report-page" id="management-actions" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <SectionHeading num="M4" title={locale === 'fa' ? 'برنامه اقدام مدیریتی' : 'Management Action Plan'} subtitle={locale === 'fa' ? 'برنامه زمان‌بندی‌شده برای کاهش ریسک، اصلاح فنی و کنترل علل ریشه‌ای.' : 'Time-bounded plan for risk reduction, technical remediation and systemic control improvements.'} icon={<Wrench/>}/>
      <SimpleTable headers={locale === 'fa' ? ['مرحله','بازه هدف','تمرکز','موارد','مالک اقدام','معیار خروج'] : ['Phase','Target Window','Focus','Items','Owner','Exit Criteria']} rows={remediationRoadmap.map(r=>locale === 'fa' ? faRoadmap(r) : [r.phase,r.window,r.focus,r.items.join(', '),r.owner,r.exit])}/>
      <Callout title={locale === 'fa' ? 'شرط بستن یافته' : 'Finding Closure Gate'} icon={<RefreshCw/>}>{locale === 'fa' ? 'صرف تغییر کد برای بستن یافته کافی نیست. بسته‌شدن باید با موفقیت معیارهای راستی‌آزمایی، ثبت شواهد آزمون مجدد و تعیین وضعیت ریسک باقی‌مانده همراه باشد.' : 'A code change alone is not sufficient for closure. Verification criteria must pass, retest evidence must be attached, and residual risk must be recorded.'}</Callout>
    </section>

    <section className="report-page" id="management-decisions" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <SectionHeading num="M5" title={locale === 'fa' ? 'تصمیم‌های موردنیاز مدیریت و حاکمیت ریسک' : 'Management Decisions & Risk Governance'} subtitle={locale === 'fa' ? 'تصمیم‌هایی که برای تبدیل یافته‌های فنی به اقدام سازمانی قابل پیگیری لازم هستند.' : 'Decisions required to turn technical findings into accountable organizational action.'} icon={<Target/>}/>
      <SimpleTable headers={locale === 'fa' ? ['تصمیم مدیریتی','دلیل','مالک پیشنهادی','خروجی مورد انتظار'] : ['Management Decision','Rationale','Suggested Owner','Expected Outcome']} rows={locale === 'fa' ? [
        ['تأیید اقدام فوری برای SEC-001 و SEC-002','وجود دو یافته بحرانی و اثر بالقوه مستقیم بر محرمانگی و یکپارچگی داده','مالک محصول + تیم مهندسی برنامه و API','کاهش فوری مواجهه و ورود اصلاح دائمی به اعتبارسنجی'],
        ['الزام آزمون مجدد مستقل برای یافته‌های بحرانی و سطح بالا','جلوگیری از بسته‌شدن صوری بر مبنای صرف تغییر کد','مدیر فنی امنیت / آزمایشگاه','شواهد معتبر بسته‌شدن و تعیین ریسک باقی‌مانده'],
        ['تعیین مالک رسمی برای علل ریشه‌ای سیستمی','چند یافته از شکاف‌های مشترک معماری و سیاست ناشی می‌شوند','معماری + مهندسی امنیت + مالکان پلتفرم','کاهش احتمال تکرار همان کلاس ضعف در مولفه‌های دیگر'],
        ['اعمال حاکمیت رسمی پذیرش ریسک','پذیرش بدون مالک، دلیل و تاریخ بازبینی ریسک را پنهان می‌کند','مالک ریسک سازمانی','رکورد قابل ممیزی شامل دلیل، کنترل جبرانی، تأیید و تاریخ انقضا'],
        ['پایش پیشرفت اصلاح در سطح مدیریتی','تعداد و شدت یافته‌ها نیازمند پیگیری تا بسته‌شدن مبتنی بر شواهد است','مدیر پروژه / امنیت محصول','داشبورد وضعیت اصلاح، آزمون مجدد و ریسک باقی‌مانده']
      ] : [
        ['Authorize immediate action for SEC-001 and SEC-002','Two Critical findings present direct confidentiality/integrity risk','Product Owner + Application/API Engineering','Immediate exposure reduction and permanent fix under validation'],
        ['Require independent retest for Critical/High findings','Prevent administrative closure based on code change alone','Security Technical Manager / Laboratory','Evidence-backed closure and residual-risk determination'],
        ['Assign accountable owners to systemic root causes','Multiple findings originate from shared architectural/policy gaps','Architecture + Security Engineering + Platform Owners','Reduce recurrence of the same weakness class across components'],
        ['Enforce formal risk-acceptance governance','Unowned or indefinite acceptance obscures organizational risk','Enterprise Risk Owner','Auditable rationale, compensating controls, approval and expiry'],
        ['Track remediation progress at management level','Finding volume and severity require oversight through verified closure','Project Manager / Product Security','Management status of remediation, retest and residual risk']
      ]}/>
      <Callout title={locale === 'fa' ? 'قاعده پذیرش ریسک' : 'Risk Acceptance Rule'} icon={<Scale/>}>{locale === 'fa' ? 'پذیرش ریسک باید استثنا و تصمیم آگاهانه باشد؛ مالک پاسخگو، دلیل مستند، کنترل‌های جبرانی، سطح ریسک باقی‌مانده، تأیید و تاریخ انقضا یا بازبینی باید ثبت شوند.' : riskMethodology.acceptanceRule}</Callout>
    </section>

    <section className="report-page" id="management-assurance" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <SectionHeading num="M6" title={locale === 'fa' ? 'محدودیت‌ها و بیانیه اطمینان مدیریتی' : 'Management Limitations & Assurance'} subtitle={locale === 'fa' ? 'حدود اتکای تصمیم مدیریتی به نتایج ارزیابی و شواهد موجود.' : 'Boundaries on management reliance on the assessment results and evidence.'} icon={<Eye/>}/>
      <h3>{locale === 'fa' ? 'محدودیت‌های کلیدی' : 'Key Limitations'}</h3>
      <ul>{(locale === 'fa' ? [
        'نتایج فقط به نسخه، محیط، نقش‌ها، پیکربندی، محدوده و بازه زمانی ثبت‌شده مربوط هستند.',
        'آزمون محدود به زمان نمی‌تواند نبود همه آسیب‌پذیری‌ها را اثبات کند.',
        'آزمون منع سرویس، آزمون مخرب، دسترسی به داده واقعی مشتری و سامانه‌های شخص ثالث خارج از محدوده انجام نشده است.',
        'ابزارهای خودکار نقش کمکی داشته‌اند و نتیجه‌های تأییدشده بر اعتبارسنجی تحلیلگر متکی هستند.',
        'اثر کسب‌وکار و ریسک سازمانی قضاوت مهندسی زمینه‌محور هستند و باید با فرایند رسمی ریسک سازمان تطبیق داده شوند.'
      ] : limitations.slice(0,5)).map(x=><li key={x}>{x}</li>)}</ul>
      <div className="assurance"><ShieldCheck size={28}/><div><strong>{locale === 'fa' ? 'بیانیه اطمینان برای مدیریت' : 'Management Assurance Statement'}</strong><p>{locale === 'fa' ? 'در محدوده تعریف‌شده، قواعد اجرا، محیط، بازه آزمون و محدودیت‌های مستند، فعالیت‌های راستی‌آزمایی ثبت‌شده انجام شده و شواهد قابل ردیابی برای نتیجه‌های ارائه‌شده نگهداری شده است. مشاهده‌نشدن یک ضعف، اثبات‌کننده نبود آسیب‌پذیری در خارج از شرایط آزمون‌شده نیست و این گزارش جایگزین فرایند رسمی پذیرش ریسک سازمانی نمی‌شود.' : assuranceStatement}</p></div></div>
      <div className="data-grid cols-4">
        <Meta label={locale === 'fa' ? 'شناسه گزارش' : 'Report ID'} value={liveReportMeta.reportId}/>
        <Meta label={locale === 'fa' ? 'نسخه' : 'Version'} value={liveReportMeta.version}/>
        <Meta label={locale === 'fa' ? 'تاریخ گزارش' : 'Report Date'} value={liveReportMeta.reportDate}/>
        <Meta label={locale === 'fa' ? 'مالک ریسک' : 'Risk Owner'} value={locale === 'fa' ? 'مالک ریسک سازمانی پروژه' : liveReportMeta.riskOwner}/>
      </div>
    </section>
  </>;
}

function Meta({label,value}){return <div className="meta"><span>{label}</span><strong>{value}</strong></div>}
function SectionHeading({num,title,subtitle,icon}){return <div className="section-heading"><div className="section-icon">{icon}</div><div><span>{num}</span><h2>{title}</h2><p>{subtitle}</p></div></div>}
function Metric({icon,label,value,sub,danger = false}: {icon?: React.ReactNode; label: React.ReactNode; value: React.ReactNode; sub: React.ReactNode; danger?: boolean}){return <div className={`metric ${danger?'danger':''}`}><div className="metric-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>}
function OfficialDocumentProfileSection({locale}:{locale:'en'|'fa'}){
  return <section className="report-page" id="official-document-profile" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
    <SectionHeading num="F1" title={locale === 'fa' ? 'شناسنامه مستند' : 'Official Document Profile'} subtitle={locale === 'fa' ? 'مشخصات هویتی، مالکیت و چرخه عمر سامانه و گزارش.' : 'Official identity, ownership and lifecycle metadata for the assessed system and issued report.'} icon={<Fingerprint/>}/>
    {locale === 'fa' ? (
      <div data-source-literal="true" dir="rtl">
        <div className="data-grid cols-4">
          <Meta label={officialDocumentProfile.labelsFa.documentIdentifier} value={officialDocumentProfile.documentIdentifier}/>
          <Meta label={officialDocumentProfile.labelsFa.documentCode} value={officialDocumentProfile.documentCode}/>
          <Meta label={officialDocumentProfile.labelsFa.systemName} value={officialDocumentProfile.systemName}/>
          <Meta label={officialDocumentProfile.labelsFa.documentClassification} value={officialDocumentProfile.documentClassification}/>
          <Meta label={officialDocumentProfile.labelsFa.systemAcceptanceDate} value={officialDocumentProfile.systemAcceptanceDate}/>
          <Meta label={officialDocumentProfile.labelsFa.assessmentDate} value={officialDocumentProfile.assessmentDate}/>
          <Meta label={officialDocumentProfile.labelsFa.reportIssueDate} value={officialDocumentProfile.reportIssueDate}/>
          <Meta label={officialDocumentProfile.labelsFa.systemVersion} value={officialDocumentProfile.systemVersion}/>
          <Meta label={officialDocumentProfile.labelsFa.client} value={officialDocumentProfile.client}/>
          <Meta label={officialDocumentProfile.labelsFa.contractor} value={officialDocumentProfile.contractor}/>
          <Meta label={officialDocumentProfile.labelsFa.operator} value={officialDocumentProfile.operator}/>
          <Meta label={officialDocumentProfile.labelsFa.incomingLetterNumber} value={officialDocumentProfile.incomingLetterNumber}/>
          <Meta label={officialDocumentProfile.labelsFa.assessmentRound} value={officialDocumentProfile.assessmentRound}/>
        </div>
      </div>
    ) : (
      <div className="data-grid cols-4">
        <Meta label="Document Identifier" value={officialDocumentProfile.documentIdentifier}/>
        <Meta label="Document Code" value={officialDocumentProfile.documentCode}/>
        <Meta label="System Name" value={officialDocumentProfile.systemName}/>
        <Meta label="Document Classification" value={officialDocumentProfile.documentClassification}/>
        <Meta label="System Acceptance Date" value={officialDocumentProfile.systemAcceptanceDate}/>
        <Meta label="Assessment Date" value={officialDocumentProfile.assessmentDate}/>
        <Meta label="Report Issue Date" value={officialDocumentProfile.reportIssueDate}/>
        <Meta label="System Version" value={officialDocumentProfile.systemVersion}/>
        <Meta label="Client" value={officialDocumentProfile.client}/>
        <Meta label="Contractor" value={officialDocumentProfile.contractor}/>
        <Meta label="Operator" value={officialDocumentProfile.operator}/>
        <Meta label="Incoming Letter Number" value={officialDocumentProfile.incomingLetterNumber}/>
        <Meta label="Assessment Round" value={officialDocumentProfile.assessmentRound}/>
      </div>
    )}
  </section>
}
function Callout({title,icon,children}){return <div className="callout"><div>{icon}</div><div><strong>{title}</strong><p>{children}</p></div></div>}
function Bar({label,value,total}){const p=Math.max(5,(value/Math.max(total,1))*100);return <div className="bar"><div><span>{label}</span><b>{value}</b></div><div className="bar-track"><i style={{width:`${p}%`}}/></div></div>}
function KeyValue({obj}){return <dl className="kv">{Object.entries(obj).map(([k,v])=><React.Fragment key={k}><dt>{k}</dt><dd>{String(v)}</dd></React.Fragment>)}</dl>}
function SimpleTable({headers,rows}){return <div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div>}

function PermissionMark({allowed,locale}:{allowed:boolean;locale:'en'|'fa'}){return <span className={`badge ${allowed?'verdict-pass':'verdict-fail'}`}>{allowed?(locale==='fa'?'مجاز':'Allowed'):(locale==='fa'?'غیرمجاز':'Denied')}</span>}

function FindingRecord({f,expanded,onToggle,locale}:{f:any;expanded:boolean;onToggle:()=>void;locale:'en'|'fa'}){
  if (locale === 'fa') {
    const assetLabel = f.affectedAsset?.application || f.asset;
    const evidenceLabel = f.evidenceIds?.slice(0,2).join(' و ') || 'رکوردهای شواهد مرتبط';
    const faLayer = f.asset==='API-001' ? 'API / مرز مجوزدهی و ورودی سرویس' : f.asset==='AUTH-001' ? 'هویت / مرز نشست' : 'وب / مرز کنترل برنامه';
    const faCapec = (value:string) => fromMap({
      'CAPEC-1 / Accessing Functionality Not Properly Constrained by ACLs':'CAPEC-1 / دسترسی به قابلیت‌هایی که به‌درستی با ACL محدود نشده‌اند',
      'CAPEC-66 / SQL Injection':'CAPEC-66 / تزریق SQL',
      'CAPEC-112 / Brute Force':'CAPEC-112 / حمله جست‌وجوی فراگیر',
      'CAPEC-62 / Cross Site Request Forgery':'CAPEC-62 / جعل درخواست بین‌سایتی',
      'CAPEC-63 / Cross-Site Scripting':'CAPEC-63 / اسکریپت‌نویسی بین‌سایتی',
      'CAPEC-1 / Malicious File':'CAPEC-1 / فایل مخرب',
      'CAPEC-664 / SSRF':'CAPEC-664 / جعل درخواست سمت سرور',
      'Contextual CAPEC mapping required':'نیازمند نگاشت زمینه‌ای CAPEC'
    }, value);
    const faAttack = f.wstg.includes('ATHZ')
      ? 'زمینه سوءاستفاده از مرز دسترسی / ارتقای مجوز'
      : f.wstg.includes('ATHN')
        ? 'زمینه دسترسی به اعتبارنامه / حمله جست‌وجوی فراگیر'
        : f.wstg.includes('INPV')
          ? 'زمینه اجرای حمله از طریق بهره‌برداری سمت کاربر یا سرور'
          : 'نگاشت زمینه‌ای ATT&CK؛ باید با معماری استقرار و سناریوی مهاجم تطبیق داده شود.';
    const faPreconditions = [
      'دسترسی شبکه به محیط ارزیابی داخل محدوده',
      'هویت آزمون تأییدشده در مواردی که احراز هویت لازم است',
      'عدم نیاز به اقدام مخرب',
      'استفاده از داده مصنوعی یا غیرحساس برای آزمون'
    ];
    const faReproduction = [
      'با استفاده از هویت آزمون تأییدشده، احراز هویت یا زمینه اولیه موردنیاز را ایجاد کنید.',
      `درخواست پایه را برای نقطه پایانی ${f.endpoint} ارسال کنید یا به مسیر مربوطه وارد شوید.`,
      `تغییر امنیتی مرتبط با ${f.wstg} را روی درخواست اعمال کنید.`,
      'درخواست تغییریافته را ارسال و پاسخ کامل را ثبت کنید.',
      'در صورت امکان، آزمون را با یک زمینه معادل و مستقل تکرار کنید.',
      `رفتار ثبت‌شده را با شواهد ${evidenceLabel} تطبیق دهید.`
    ];
    const faAttackPath = [
      'مهاجم خارجی یا کاربر احراز هویت‌شده',
      'دسترسی به قابلیت یا نقطه پایانی آسیب‌پذیر',
      `فعال‌سازی ${localize(locale,f.title)}`,
      'دور زدن یا نقض ویژگی امنیتی مورد انتظار',
      localize(locale,f.businessImpact)
    ];
    const faExploitability = {
      'بردار حمله':'شبکه',
      'دسترسی موردنیاز':f.wstg.includes('ATHN')?'بدون احراز هویت / وابسته به زمینه حساب':'حساب با سطح دسترسی پایین در موارد ثبت‌شده',
      'سطح دسترسی موردنیاز':f.wstg.includes('AUTH')?'هیچ':'پایین / وابسته به زمینه',
      'تعامل کاربر':f.cwe==='CWE-352'||f.cwe==='CWE-79'?'در سناریوی نماینده لازم است':'در سناریوی نماینده لازم نیست',
      'پیچیدگی':f.severity==='Critical'?'پایین':'پایین تا متوسط',
      'قابلیت خودکارسازی':f.wstg.includes('ATHN')||f.cwe==='CWE-639'?'بالا':'متوسط',
      'مقیاس‌پذیری':f.severity==='Critical'?'بالا':'وابسته به زمینه',
      'قابلیت کشف':'متوسط — وابسته به پوشش رویدادهای ممیزی'
    };
    const faTechnicalImpact = {
      'محرمانگی':f.severity==='Critical'?'بالا':f.cwe==='CWE-352'?'پایین':'متوسط',
      'یکپارچگی':['CWE-89','CWE-352','CWE-434'].includes(f.cwe)?'بالا':'متوسط',
      'دسترس‌پذیری':f.cwe==='CWE-89'?'متوسط':'پایین',
      'مجوزدهی':f.wstg.includes('ATHZ')?'بالا':'وابسته به زمینه',
      'احراز هویت':f.wstg.includes('ATHN')?'بالا':'وابسته به زمینه',
      'حریم خصوصی':['CWE-639','CWE-79','CWE-918'].includes(f.cwe)?'بالا':'متوسط'
    };
    const faBusinessImpact = {
      'شرح اثر':localize(locale,f.businessImpact),
      'کاربران متاثر':f.severity==='Critical'?'احتمال اثر بر چندین حساب مشتری':'دامنه اثر به فرایند آسیب‌پذیر وابسته است',
      'رکوردهای متاثر':'شمارش کامل انجام نشده؛ اثبات اثر به حداقل داده مصنوعی لازم محدود شده است',
      'اثر مالی':'بسته به مسیر بهره‌برداری، احتمال تقلب یا هزینه اصلاح و پاسخ‌گویی وجود دارد',
      'اثر مقرراتی':'در صورت افشای داده واقعی مشمول مقررات، می‌تواند دارای اثر مقرراتی باشد',
      'اثر عملیاتی':'نیازمند پاسخ به رخداد و تلاش اصلاح سرویس',
      'اثر اعتباری':'احتمال اثر بر اعتماد مشتری'
    };
    const faOrgRisk = {
      'احتمال':f.severity==='Critical'?'محتمل':f.severity==='High'?'ممکن تا محتمل':'ممکن',
      'بحرانی‌بودن دارایی':f.affectedAsset?.id ? 'بحرانی' : 'بحرانی',
      'اثر کسب‌وکار':f.severity==='Critical'?'شدید':f.severity==='High'?'عمده':'متوسط',
      'میزان مواجهه':f.asset==='ADMIN-001'?'محدود / نیازمند احراز هویت':'قابل دسترسی شبکه در توپولوژی ارزیابی',
      'کنترل‌های موجود':'احراز هویت، کنترل‌های لبه، ثبت رویداد و اعتبارسنجی برنامه در نقاطی که وجود دارند',
      'کنترل‌های جبرانی':'وابسته به زمینه؛ هیچ کنترل جبرانی برای بستن یافته کافی در نظر گرفته نشده است',
      'سطح ریسک':faRisk(f.organizationalRisk.riskRating),
      'ریسک باقی‌مانده':'در انتظار اصلاح و آزمون مجدد'
    };
    const faThreat = {
      'بهره‌برداری شناخته‌شده':'در این ارزیابی ادعایی درباره بهره‌برداری شناخته‌شده مطرح نمی‌شود',
      'اکسپلویت عمومی':'یافته اختصاصی برنامه است و برای اعتبارسنجی نیازمند اکسپلویت عمومی نیست',
      'بلوغ بهره‌برداری':'اثبات مفهوم در ارزیابی اعتبارسنجی شده است',
      'EPSS':'در صورت نبود CVE عمومی، نامرتبط است',
      'KEV':'در صورت نبود CVE متناظر در CISA KEV، نامرتبط است'
    };
    const faConfidence = {
      'سطح اطمینان':f.confidenceRecord.rating === 'CONFIRMED' ? 'تأییدشده' : f.confidenceRecord.rating,
      'قدرت شواهد':'شواهد مستقیم و قابل بازتولید از برنامه',
      'تعداد بازتولید':f.confidenceRecord.reproductionCount,
      'اعتبارسنجی مستقل':f.severity==='Critical'||f.severity==='High'?'انجام شده':'در نمونه نمایشی بازبینی نمونه‌ای انجام شده است'
    };
    const faVerification = [
      localize(locale,f.verificationCriteria?.[0] || ''),
      'اثبات مفهوم اولیه دیگر رفتار آسیب‌پذیر ایجاد نکند.',
      'گونه‌های جایگزین مسیر، متد و ورودی برای آزمون رگرسیون بررسی شوند.',
      'قابلیت مجاز کسب‌وکار پس از اصلاح همچنان عملیاتی باقی بماند.',
      'در صورت کاربرد، تله‌متری امنیتی تلاش‌های سوءاستفاده ردشده را ثبت کند.'
    ];
    const faAudit = f.auditTrail.map((a:any,i:number)=>[
      a.timestamp,
      a.actor,
      i===0?'ایجاد یافته از اجرای ناموفق WSTG':i===1?'اعتبارسنجی فنی مستقل':'بازبینی صدور گزارش',
      i===0?'—':i===1?'پیش‌نویس':'تأییدشده',
      i===0?'پیش‌نویس':i===1?'تأییدشده':'باز',
      i===0?'رفتار امنیتی غیرمنتظره اعتبارسنجی شد':i===1?'شواهد و بازتولید بازبینی شد':'برای فرایند اصلاح تأیید شد'
    ]);

    return <article className={`finding-record ${expanded?'expanded':''}`} id={f.id} dir="rtl">
      <button className="finding-head no-print" onClick={onToggle}><div><span className={severityClass(f.severity)}>{faSeverity(f.severity)}</span><strong>{f.id} · {localize(locale,f.title)}</strong><small>{f.asset} · {f.endpoint}</small></div><div className="head-pills"><span>CVSS {f.cvssScore}</span><span className={riskClass(f.organizationalRisk.riskRating)}>ریسک {faRisk(f.organizationalRisk.riskRating)}</span>{expanded?<ChevronDown/>:<ChevronRight/>}</div></button>
      <div className="print-only finding-print-title"><span className={severityClass(f.severity)}>{faSeverity(f.severity)}</span><h3>{f.id} · {localize(locale,f.title)}</h3></div>
      <div className="finding-body">
        <div className="data-grid cols-4"><Meta label="وضعیت" value={faStatus(f.status)}/><Meta label="نسخه یافته" value={f.findingVersion}/><Meta label="تاریخ کشف / اعتبارسنجی" value={`${f.discoveryDate} / ${f.validationDate}`}/><Meta label="گزارش‌دهنده / اعتبارسنج" value={`${f.reporter} / ${f.validator}`}/><Meta label="CWE" value={f.cwe}/><Meta label="WSTG" value={f.wstg}/><Meta label="CVSS v4.0" value={`${f.cvssScore} ${faSeverity(f.severity)}`}/><Meta label="ریسک سازمانی" value={faRisk(f.organizationalRisk.riskRating)}/><Meta label="اولویت" value={f.priority}/><Meta label="SLA هدف" value={f.targetSla}/><Meta label="سطح اطمینان" value={f.confidenceRecord.rating === 'CONFIRMED' ? 'تأییدشده' : f.confidenceRecord.rating}/><Meta label="دامنه اثر" value={localize(locale,f.blastRadius)}/></div>
        <Sub title="طبقه‌بندی و قابلیت ردیابی"><SimpleTable headers={['CWE','CAPEC','WSTG','ASVS','زمینه ATT&CK','CVE']} rows={[[f.classification.cwe,faCapec(f.classification.capec),f.classification.wstg,'الزام امنیتی متناظر در خط مبنای ASVS 5.0.0؛ شناسه دقیق در کاتالوگ کنترل نگهداری می‌شود',faAttack,'نامرتبط — یافته اختصاصی برنامه']]}/></Sub>
        <Sub title="دارایی متاثر"><div className="data-grid cols-3"><Meta label="برنامه" value={assetLabel}/><Meta label="مولفه / نقطه پایانی" value={f.affectedAsset.component}/><Meta label="محیط" value={f.affectedAsset.environment === 'Pre-production' ? 'پیش‌تولید' : f.affectedAsset.environment}/><Meta label="نسخه / ساخت" value={`${f.affectedAsset.version} / ${f.affectedAsset.build}`}/><Meta label="مخزن / شاخه" value={`${f.affectedAsset.repository} / ${f.affectedAsset.branch}`}/><Meta label="شناسه تغییر" value={f.affectedAsset.commit}/></div></Sub>
        <Sub title="الزام امنیتی"><p className="requirement">{`سامانه ${assetLabel} باید کنترل امنیتی متناظر با ${f.wstg} را در مرز اعتماد معتبر سمت سرور، مستقل از ورودی قابل کنترل توسط کاربر یا مسیر جایگزین درخواست، اعمال کند.`}</p></Sub>
        <div className="two-col"><Sub title="مشاهده"><p>{localize(locale,f.observation)}</p></Sub><Sub title="مورد انتظار در برابر واقعی"><p><b>مورد انتظار:</b> درخواست باید رد، به‌صورت امن پردازش یا به‌گونه‌ای محدود شود که ویژگی امنیتی محافظت‌شده قابل نقض نباشد.</p><p><b>رفتار واقعی:</b> {localize(locale,f.actualBehavior)}</p></Sub></div>
        <div className="two-col"><Sub title="پیش‌شرط‌ها"><ul>{faPreconditions.map(x=><li key={x}>{x}</li>)}</ul></Sub><Sub title="روش بازتولید"><ol>{faReproduction.map(x=><li key={x}>{x}</li>)}</ol></Sub></div>
        <Sub title="ارتباط اثبات مفهوم و شواهد"><div className="trace-row"><span>{f.wstg}</span><b>→</b>{f.pocIds.map((x:string)=><span key={x}>{x}</span>)}<b>→</b>{f.evidenceIds.slice(0,4).map((x:string)=><span key={x}>{x}</span>)}<b>→</b><span>{f.id}</span></div></Sub>
        <Sub title="تحلیل فنی"><p>{`رفتار مشاهده‌شده نشان می‌دهد ویژگی امنیتی مورد انتظار در نقطه کنترل معتبر به‌صورت یکنواخت اعمال نمی‌شود. این وضعیت در محیط ارزیابی ثبت‌شده قابل بازتولید است و با ${f.cwe} طبقه‌بندی شده است.`}</p></Sub>
        <div className="two-col"><Sub title="علت ریشه‌ای"><KeyValue obj={{'دسته':localize(locale,f.rootCauseDetail.category),'لایه':faLayer,'ظرفیت سیستمی':f.rootCauseDetail.systemicPotential==='High'?'بالا':'متوسط'}}/></Sub><Sub title="قابلیت بهره‌برداری"><KeyValue obj={faExploitability}/></Sub></div>
        <Sub title="مسیر حمله"><div className="chain-flow compact-flow">{faAttackPath.map((x,i)=><React.Fragment key={i}><div>{x}</div>{i<faAttackPath.length-1&&<span>→</span>}</React.Fragment>)}</div></Sub>
        <div className="two-col"><Sub title="اثر فنی"><KeyValue obj={faTechnicalImpact}/></Sub><Sub title="اثر کسب‌وکار"><KeyValue obj={faBusinessImpact}/></Sub></div>
        <div className="two-col"><Sub title="شدت فنی — CVSS"><KeyValue obj={{'نسخه':f.cvss.version,'امتیاز پایه':f.cvss.baseScore,'شدت':faSeverity(f.cvss.severity)}}/><code className="vector">{f.cvss.vector}</code></Sub><Sub title="ریسک سازمانی"><KeyValue obj={faOrgRisk}/></Sub></div>
        <div className="two-col"><Sub title="زمینه تهدید / بهره‌برداری"><KeyValue obj={faThreat}/></Sub><Sub title="اطمینان و اعتبارسنجی مستقل"><KeyValue obj={faConfidence}/></Sub></div>
        <Sub title="مهندسی اصلاح"><div className="remediation-grid"><Rem label="اقدام فوری" text={`در صورتی که پیش از اصلاح دائمی امکان کنترل امن مواجهه وجود ندارد، مسیر متاثر ${f.endpoint} محدود یا به‌طور موقت غیرفعال شود.`}/><Rem label="اصلاح دائمی" text={localize(locale,f.remediationEngineering.permanentFix)}/><Rem label="اصلاح معماری" text="اعمال کنترل به لایه معتبر سمت سرور منتقل و سیاست امنیتی مرتبط متمرکز شود تا سمت کاربر یا مسیر جایگزین قادر به دور زدن آن نباشد."/><Rem label="دفاع چندلایه" text="تله‌متری امنیتی، آزمون‌های رگرسیون منفی، اصل حداقل دسترسی و در صورت کاربرد سیاست به‌صورت کد یا میان‌افزار امنیتی متمرکز اضافه شود."/></div></Sub>
        <Sub title="الزام طراحی امن"><p className="requirement">{`تمام مسیرهای معادل دسترسی به ${f.endpoint} باید سیاست «رد به‌صورت پیش‌فرض» یکسان را در سمت سرور اعمال کنند و به وضعیت قابل کنترل توسط کاربر به‌عنوان مدرک مجوز یا ایمنی اعتماد نکنند.`}</p></Sub>
        <div className="two-col"><Sub title="معیارهای راستی‌آزمایی"><ol>{faVerification.map((x,i)=><li key={i}>VC-{String(i+1).padStart(2,'0')} — {x}</li>)}</ol></Sub><Sub title="کشف و پایش"><KeyValue obj={{'لاگ مرتبط':'لاگ امنیتی برنامه برای مجوزدهی، اعتبارسنجی ورودی و ممیزی','رویداد':`SECURITY_CONTROL_VIOLATION / ${f.id}`,'قاعده SIEM':`در صورت تکرار درخواست‌های ردشده یا غیرعادی مرتبط با ${f.id} بر اساس کاربر، منبع، هدف و بازه زمانی هشدار ایجاد شود.`}}/><div className="chip-row">{['شناسه همبستگی درخواست','هویت و نقش احراز هویت‌شده','منبع یا اقدام هدف','تصمیم امنیتی','فراداده منبع','کد پاسخ'].map(x=><span className="chip" key={x}>{x}</span>)}</div></Sub></div>
        <div className="two-col"><Sub title="رکورد آزمون مجدد"><KeyValue obj={{'شناسه':f.retest.id,'تاریخ':'در انتظار اصلاح','آزمونگر':'آزمونگر مستقل آزمون مجدد','محیط':'همان محیط کنترل‌شده یا محیط معادل تولید','نسخه برنامه':'در انتظار','ساخت':'در انتظار','Commit':'در انتظار','نتیجه':'آزمون نشده','موارد آزمون':f.retest.testCases.join('، '),'شواهد':'پس از اجرا پیوست می‌شود'}}/></Sub><Sub title="ریسک باقی‌مانده / پذیرش"><KeyValue obj={{'سطح':'در انتظار','دلیل':'تا تکمیل اصلاح و شواهد آزمون مجدد قابل نهایی‌سازی نیست.','کنترل‌های جبرانی':'در زمان بستن یافته بازبینی می‌شوند','مالک ریسک':f.residualRisk.riskOwner,'وضعیت پذیرش':'درخواست نشده'}}/></Sub></div>
        <Sub title="ردپای ممیزی یافته"><SimpleTable headers={['زمان','عامل','اقدام','وضعیت قبلی','وضعیت جدید','دلیل']} rows={faAudit}/></Sub>
      </div>
    </article>;
  }

  return <article className={`finding-record ${expanded?'expanded':''}`} id={f.id}>
    <button className="finding-head no-print" onClick={onToggle}><div><span className={severityClass(f.severity)}>{f.severity}</span><strong>{f.id} · {f.title}</strong><small>{f.asset} · {f.endpoint}</small></div><div className="head-pills"><span>CVSS {f.cvssScore}</span><span className={riskClass(f.organizationalRisk.riskRating)}>Risk {f.organizationalRisk.riskRating}</span>{expanded?<ChevronDown/>:<ChevronRight/>}</div></button>
    <div className="print-only finding-print-title"><span className={severityClass(f.severity)}>{f.severity}</span><h3>{f.id} · {f.title}</h3></div>
    <div className="finding-body">
      <div className="data-grid cols-4"><Meta label="Status" value={f.status}/><Meta label="Finding Version" value={f.findingVersion}/><Meta label="Discovery / Validation" value={`${f.discoveryDate} / ${f.validationDate}`}/><Meta label="Reporter / Validator" value={`${f.reporter} / ${f.validator}`}/><Meta label="CWE" value={f.cwe}/><Meta label="WSTG" value={f.wstg}/><Meta label="CVSS v4.0" value={`${f.cvssScore} ${f.severity}`}/><Meta label="Organizational Risk" value={f.organizationalRisk.riskRating}/><Meta label="Priority" value={f.priority}/><Meta label="Target SLA" value={f.targetSla}/><Meta label="Confidence" value={f.confidenceRecord.rating}/><Meta label="Blast Radius" value={f.blastRadius}/></div>
      <Sub title="Classification & Traceability"><SimpleTable headers={['CWE','CAPEC','WSTG','ASVS','ATT&CK Context','CVE']} rows={[[f.classification.cwe,f.classification.capec,f.classification.wstg,f.classification.asvs,f.classification.attack,f.classification.cve]]}/></Sub>
      <Sub title="Affected Asset"><div className="data-grid cols-3"><Meta label="Application" value={f.affectedAsset.application}/><Meta label="Component / Endpoint" value={f.affectedAsset.component}/><Meta label="Environment" value={f.affectedAsset.environment}/><Meta label="Version / Build" value={`${f.affectedAsset.version} / ${f.affectedAsset.build}`}/><Meta label="Repository / Branch" value={`${f.affectedAsset.repository} / ${f.affectedAsset.branch}`}/><Meta label="شناسه تغییر" value={f.affectedAsset.commit}/></div></Sub>
      <Sub title="Security Requirement"><p className="requirement">{f.securityRequirement}</p></Sub>
      <div className="two-col"><Sub title="Observation"><p>{f.observation}</p></Sub><Sub title="Expected vs Actual"><p><b>Expected:</b> {f.expectedBehavior}</p><p><b>Actual:</b> {f.actualBehavior}</p></Sub></div>
      <div className="two-col"><Sub title="Preconditions"><ul>{f.preconditions.map((x:string)=><li key={x}>{x}</li>)}</ul></Sub><Sub title="Reproduction Procedure"><ol>{f.reproductionSteps.map((x:string)=><li key={x}>{x}</li>)}</ol></Sub></div>
      <Sub title="PoC & Evidence Linkage"><div className="trace-row"><span>{f.wstg}</span><b>→</b>{f.pocIds.map((x:string)=><span key={x}>{x}</span>)}<b>→</b>{f.evidenceIds.slice(0,4).map((x:string)=><span key={x}>{x}</span>)}<b>→</b><span>{f.id}</span></div></Sub>
      <Sub title="Technical Analysis"><p>{f.technicalAnalysis}</p></Sub>
      <div className="two-col"><Sub title="Root Cause"><KeyValue obj={f.rootCauseDetail}/></Sub><Sub title="Exploitability"><KeyValue obj={f.exploitability}/></Sub></div>
      <Sub title="Attack Path"><div className="chain-flow compact-flow">{f.attackPath.map((x:string,i:number)=><React.Fragment key={i}><div>{x}</div>{i<f.attackPath.length-1&&<span>→</span>}</React.Fragment>)}</div></Sub>
      <div className="two-col"><Sub title="Technical Impact"><KeyValue obj={f.technicalImpact}/></Sub><Sub title="Business Impact"><KeyValue obj={f.businessImpactDetail}/></Sub></div>
      <div className="two-col"><Sub title="Technical Severity — CVSS"><KeyValue obj={f.cvss}/><code className="vector">{f.cvss.vector}</code></Sub><Sub title="Organizational Risk"><KeyValue obj={f.organizationalRisk}/></Sub></div>
      <div className="two-col"><Sub title="Threat / Exploitation Context"><KeyValue obj={f.threatContext}/></Sub><Sub title="Confidence & Independent Validation"><KeyValue obj={f.confidenceRecord}/></Sub></div>
      <Sub title="Remediation Engineering"><div className="remediation-grid"><Rem label="Immediate Mitigation" text={f.remediationEngineering.immediateMitigation}/><Rem label="Permanent Fix" text={f.remediationEngineering.permanentFix}/><Rem label="Architectural Fix" text={f.remediationEngineering.architecturalFix}/><Rem label="Defense in Depth" text={f.remediationEngineering.defenseInDepth}/></div></Sub>
      <Sub title="Secure Design Requirement"><p className="requirement">{f.secureDesignRequirement}</p></Sub>
      <div className="two-col"><Sub title="Verification Criteria"><ol>{f.verificationCriteria.map((x:string,i:number)=><li key={i}>VC-{String(i+1).padStart(2,'0')} — {x}</li>)}</ol></Sub><Sub title="Detection & Monitoring"><KeyValue obj={{relevantLog:f.detection.relevantLog,event:f.detection.event,siemRule:f.detection.siemRule}}/><div className="chip-row">{f.detection.telemetry.map((x:string)=><span className="chip" key={x}>{x}</span>)}</div></Sub></div>
      <div className="two-col"><Sub title="Retest Record"><KeyValue obj={f.retest}/></Sub><Sub title="Residual Risk / Acceptance"><KeyValue obj={{...f.residualRisk,acceptanceStatus:f.riskAcceptance.status}}/></Sub></div>
      <Sub title="Finding Audit Trail"><SimpleTable headers={['Timestamp','Actor','Action','Old','New','Reason']} rows={f.auditTrail.map((a:any)=>[a.timestamp,a.actor,a.action,a.old,a.new,a.reason])}/></Sub>
    </div>
  </article>
}
function Sub({title,children}){return <div className="subsection"><h4>{title}</h4>{children}</div>}
function Rem({label,text}){return <div className="rem"><span>{label}</span><p>{text}</p></div>}

function WstgRecord({t,expanded,onToggle}){
  return <article className={`wstg-record ${expanded?'expanded':''}`}>
    <button className="wstg-head no-print" onClick={onToggle}><span className="chev">{expanded?<ChevronDown size={17}/>:<ChevronRight size={17}/>}</span><div className="wstg-id"><strong>{t.versionedId}</strong><small>{t.categoryName}</small></div><div className="wstg-title"><strong>{t.title}</strong><small>{t.asset} · {t.tester} → {t.reviewer}</small></div><span className={verdictClass(t.verdict)}>{t.verdict}</span><span className="count-pill">{t.pocCount} PoC</span><span className="count-pill">{t.evidenceCount} EVD</span><span className="finding-link">{t.findingId||'—'}</span></button>
    <div className="print-only wstg-print-title"><strong>{t.versionedId} · {t.title}</strong><span className={verdictClass(t.verdict)}>{t.verdict}</span></div>
    <div className="wstg-body"><div className="data-grid cols-4"><Meta label="Applicable" value={t.applicable}/><Meta label="Asset" value={t.asset}/><Meta label="Execution Date" value={t.executionDate}/><Meta label="Tester / Reviewer" value={`${t.tester} / ${t.reviewer}`}/><Meta label="Finding" value={t.findingId||'—'}/><Meta label="PoCs" value={t.pocCount}/><Meta label="Evidence" value={t.evidenceCount}/><Meta label="Limitation" value={t.limitations}/></div><Sub title="Objective"><p>{t.objective}</p></Sub><Sub title="Applicability Rationale"><p>{t.applicabilityReason}</p></Sub><Sub title="Test Hypotheses"><ul>{t.hypotheses.map(x=><li key={x}>{x}</li>)}</ul></Sub>{t.pocs.length===0?<Callout title="Not Applicable" icon={<AlertTriangle/>}>No PoC execution is created for this item because the scoped technology/functionality does not expose an applicable test target. The rationale remains part of the audit trail.</Callout>:t.pocs.map(p=><PocRecord key={p.id} p={p} t={t}/>)}</div>
  </article>
}

function PocRecord({p,t,locale='en'}:{p:any;t:any;locale?:'en'|'fa'}){
  const faValue = (value: unknown) => {
    const raw = String(value ?? '');
    return fromMap({
      CONFIRMED:'تأییدشده',HIGH:'بالا',MODERATE:'متوسط',LOW:'پایین',
      YES:'بله',NO:'خیر',REDACTED:'ماسک‌شده','NOT REDACTED':'بدون ماسک',
      'HTTP Transaction':'تراکنش HTTP','Screenshot':'تصویر','Screenshot / Observation':'تصویر / مشاهده',
      'Intercept Proxy':'پراکسی رهگیری','Browser / Test Client':'مرورگر / کلاینت آزمون'
    }, raw);
  };
  const faHypothesis = (()=>{
    const translated = localize('fa',p.hypothesis);
    if (translated !== p.hypothesis) return translated;
    if (String(p.hypothesis).startsWith('The security control represented by')) return `کنترل امنیتی متناظر با ${t.id} باید با تغییر زمینه درخواست، متد، نقش یا گونه ورودی در محدوده مجاز آزمون همچنان به‌درستی اعمال شود.`;
    return 'کنترل امنیتی مورد آزمون باید در مسیر و شرایط ثبت‌شده، رفتار مورد انتظار امنیتی را به‌صورت قابل تکرار اعمال کند.';
  })();
  const faPreconditions = String(p.preconditions || '').includes('secondary test identity')
    ? 'هویت آزمون ثانویه یا زمینه جایگزین مجاز، همان دارایی داخل محدوده و اجرای کنترل‌شده و غیرمخرب در دسترس باشد.'
    : 'هویت آزمون تأییدشده، شرایط اولیه مشخص و دسترسی مجاز به دارایی داخل محدوده برای اجرای کنترل‌شده آزمون فراهم باشد.';
  const faProcedure = (text:string) => {
    const x=String(text || '');
    const direct = fromMap({
      'Prepare the approved test identity and establish a known-good baseline.':'هویت آزمون تأییدشده آماده و یک خط مبنای سالم و شناخته‌شده ایجاد شود.',
      'Modify only the security-relevant request/input dimension under test.':'فقط مولفه امنیتی درخواست یا ورودی که موضوع آزمون است تغییر داده شود.',
      'Submit the request using the authorized assessment channel.':'درخواست از طریق کانال مجاز ارزیابی ارسال شود.',
      'Capture response and observable application behavior.':'پاسخ و رفتار قابل مشاهده برنامه ثبت شود.',
      'Compare actual behavior with the expected security property and record verdict.':'رفتار واقعی با ویژگی امنیتی مورد انتظار مقایسه و نتیجه آزمون ثبت شود.',
      'Establish the baseline behavior using the approved test identity.':'رفتار خط مبنا با استفاده از هویت آزمون تأییدشده ثبت شود.',
      'Change one security-relevant dimension (role, object, method, input encoding, browser context, or request path).':'یک مولفه امنیتی مرتبط مانند نقش، شیء، متد، کدگذاری ورودی، زمینه مرورگر یا مسیر درخواست تغییر داده شود.',
      'Submit the alternate request while preserving all unrelated conditions.':'درخواست جایگزین در حالی ارسال شود که سایر شرایط نامرتبط بدون تغییر باقی بمانند.',
      'Capture response, application behavior, and any relevant logs.':'پاسخ، رفتار برنامه و لاگ‌های مرتبط ثبت شوند.',
      'Compare the observation to the stated security requirement.':'مشاهده ثبت‌شده با الزام امنیتی تعریف‌شده مقایسه شود.'
    }, x);
    if (direct !== x) return direct;
    if (x.startsWith('Execute the WSTG test objective against ')) return `هدف آزمون WSTG روی دارایی ${t.asset} اجرا شود.`;
    const translated=localize('fa',x);
    return translated !== x ? translated : x;
  };
  const faExpected = (()=>{
    const translated=localize('fa',p.expected);
    if (translated !== p.expected) return translated;
    if (String(p.expected).startsWith('The security control should remain consistent')) return 'کنترل امنیتی باید در مسیرها و زمینه‌های جایگزین معادل نیز به‌صورت یکنواخت و بدون امکان دور زدن اعمال شود.';
    return 'ویژگی امنیتی تعریف‌شده باید در شرایط آزمون اعمال شود و رفتار خارج از سیاست مجاز مشاهده نشود.';
  })();
  const faActual = (()=>{
    const translated=localize('fa',p.actual);
    if (translated !== p.actual) return translated;
    return fromMap({
      'The alternate scenario reproduced behavior consistent with the confirmed finding.':'سناریوی جایگزین نیز رفتاری سازگار با یافته تأییدشده را بازتولید کرد.',
      'The alternate scenario produced inconsistent evidence and requires bounded follow-up verification.':'سناریوی جایگزین شواهد ناسازگار ایجاد کرد و به راستی‌آزمایی تکمیلی محدود نیاز دارد.',
      'No bypass or security-relevant deviation was observed in the alternate scenario.':'در سناریوی جایگزین، دور زدن کنترل یا انحراف امنیتی قابل مشاهده‌ای ثبت نشد.'
    }, p.actual);
  })();
  return <div className="poc-record" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
    <div className="poc-head"><div><TestTube2 size={18}/><strong>{p.id}</strong><span>{t.id}</span></div><span className={verdictClass(p.verdict)}>{locale === 'fa' ? fromMap({PASS:'موفق',FAIL:'ناموفق',INCONCLUSIVE:'نامشخص',PARTIAL:'ناقص','N/A':'نامرتبط'}, p.verdict) : p.verdict}</span></div>
    <div className="data-grid cols-4"><Meta label={locale === 'fa' ? 'سطح اطمینان' : 'Confidence'} value={locale === 'fa' ? faValue(p.confidence) : p.confidence}/><Meta label={locale === 'fa' ? 'بازتولید' : 'Reproduction'} value={p.reproduction}/><Meta label={locale === 'fa' ? 'دارایی' : 'Asset'} value={t.asset}/><Meta label={locale === 'fa' ? 'یافته مرتبط' : 'Finding'} value={t.findingId||'—'}/></div>
    <Sub title={locale === 'fa' ? 'فرضیه آزمون' : 'Hypothesis'}><p className="requirement">{locale === 'fa' ? faHypothesis : p.hypothesis}</p></Sub>
    <div className="two-col"><Sub title={locale === 'fa' ? 'پیش‌شرط‌ها' : 'Preconditions'}><p>{locale === 'fa' ? faPreconditions : p.preconditions}</p></Sub><Sub title={locale === 'fa' ? 'روش اجرا' : 'Procedure'}><ol>{p.procedure.map((x:string,i:number)=><li key={i}>{locale === 'fa' ? faProcedure(x) : x}</li>)}</ol></Sub></div>
    <div className="two-col"><Sub title={locale === 'fa' ? 'نتیجه مورد انتظار' : 'Expected Result'}><p>{locale === 'fa' ? faExpected : p.expected}</p></Sub><Sub title={locale === 'fa' ? 'نتیجه واقعی' : 'Actual Result'}><p>{locale === 'fa' ? faActual : p.actual}</p></Sub></div>
    <div className="two-col"><CodeBlock title={locale === 'fa' ? 'درخواست ثبت‌شده' : 'Request Evidence'} value={p.request}/><CodeBlock title={locale === 'fa' ? 'پاسخ ثبت‌شده' : 'Response Evidence'} value={p.response}/></div>
    <Sub title={locale === 'fa' ? 'رکوردهای شواهد' : 'Evidence Records'}><SimpleTable headers={locale === 'fa' ? ['شناسه شاهد','نوع','زمان','گردآورنده','منبع','SHA-256','محل نگهداری','وضعیت ماسک‌سازی'] : ['Evidence ID','Type','Timestamp','Collector','Source','SHA-256','Storage','Redaction']} rows={p.evidence.map((e:any)=>[e.id,locale === 'fa' ? faValue(e.type) : e.type,e.timestamp,e.collector,locale === 'fa' ? faValue(e.source) : e.source,e.sha256.slice(0,18)+'…',e.storage,locale === 'fa' ? faValue(e.redaction) : e.redaction])}/></Sub>
  </div>;
}
function CodeBlock({title,value}){return <div className="code-card"><strong>{title}</strong><pre dir="ltr" data-source-literal="true">{value}</pre></div>}

function AnnexTest({t,locale}:{t:any;locale:'en'|'fa'}){return <article className="annex-test" dir={locale === 'fa' ? 'rtl' : 'ltr'}><div className="annex-test-head"><div><span>{t.versionedId}</span><strong>{localize(locale,t.title)}</strong><small>{localize(locale,t.categoryName)} · {t.asset}</small></div><span className={verdictClass(t.verdict)}>{locale === 'fa' ? fromMap({PASS:'موفق',FAIL:'ناموفق',PARTIAL:'ناقص','N/A':'نامرتبط'}, t.verdict) : t.verdict}</span></div>{t.pocs.length===0?<p><b>{locale === 'fa' ? 'قابلیت اعمال:' : 'Applicability:'}</b> {locale === 'fa' ? 'خیر' : 'NO'} — {locale === 'fa' ? 'در محدوده ارزیابی تأییدشده، قابلیت یا فناوری متناظر با هدف این آزمون وجود ندارد.' : t.applicabilityReason}</p>:t.pocs.map((p:any)=><PocRecord key={p.id} p={p} t={t} locale={locale}/>)}</article>}
