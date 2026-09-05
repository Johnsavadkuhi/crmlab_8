import React, { useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, Archive, BookOpen, CheckCircle2, ChevronDown, ChevronRight, ArrowLeft,
  ClipboardCheck, Download, FileJson, FileText, Fingerprint, Gauge, GitBranch,
  Layers3, LockKeyhole, Menu, Printer, Search, ShieldAlert, ShieldCheck, Target,
  TestTube2, XCircle, Network, Database, Eye, Wrench, RefreshCw, FileCheck2,
  ListChecks, Scale, Boxes, KeyRound, Radar, Workflow, FileSearch, UserCheck
} from 'lucide-react';
import {
  reportMeta, documentControl, assessmentContext, objectives, assets, scope,
  rulesOfEngagement, stopConditions, methodology, scientificPrinciples, standards,
  tools, riskMethodology, categories, wstgItems, testCaseRegister, evidenceIndex,
  findings, attackChains, systemicRootCauses, remediationRoadmap,
  authorizationCoverage, limitations, assumptions, assuranceStatement, glossary,
  dataDictionary, reportAuditTrail, exportBundle
} from './originalReportExtras';
import {
  officialDocumentProfile, reportQualityControl, assessmentPersonnelHistoryCaptionFa, assessmentPersonnelHistory, publicationRights,
  assessmentBasisAndRiskDefinitions, severityDefinitionRows, documentAccessControl,
  vulnerabilityIdentification, vulnerabilityIdentificationMethods,
  testItemStructureSource, testItemStructure, cvss31Reference
} from './officialReportSourceData';

const slug = v => String(v || '').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
const verdictClass = v => `badge verdict-${slug(v)}`;
const severityClass = v => `severity severity-${slug(v)}`;
const riskClass = v => `risk-pill risk-${slug(v)}`;

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

  const showCore = view==='full'||view==='executive'||view==='technical';
  const showTechnical = view==='full'||view==='technical';
  const showAnnex = view==='full'||view==='annex';

  function toggleSet(setter,id){ setter(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;}); }
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
      <nav>{TOC.map(([n,t,id])=><a key={id} href={`#${id}`} onClick={()=>setSidebarOpen(false)}><span className="nav-num">{n}</span>{t}</a>)}</nav>
      <div className="sidebar-foot"><span>Standards baseline</span><strong>{liveReportMeta.standardsBaselineId}</strong><small>WSTG v4.2 · ASVS 5.0.0 · CVSS v4.0</small></div>
    </aside>

    <main className="main">
      <header className="topbar no-print">
        <button className="icon-button mobile-menu" onClick={()=>setSidebarOpen(!sidebarOpen)}><Menu size={20}/></button>
        <div className="top-title"><span className="eyebrow">Controlled engineering record</span><strong>{liveReportMeta.reportId}</strong></div>
        <div className="top-actions">
          <button onClick={onBack}><ArrowLeft size={16}/> Back to CRM</button>
          <button onClick={onToggleLocale}>{locale === "en" ? "فارسی" : "English"}</button>
          <select value={view} onChange={e=>setView(e.target.value)}><option value="full">Full Report</option><option value="executive">Executive View</option><option value="technical">Technical Report</option><option value="annex">Evidence Annex</option></select>
          <button onClick={(e)=>e.currentTarget.ownerDocument.defaultView?.print()}><Printer size={16}/> Print / PDF</button>
          <div className="export-menu"><button className="primary"><Download size={16}/> Export <ChevronDown size={14}/></button><div className="export-popover">
            <button onClick={exportJson}><FileJson size={16}/> Complete JSON</button><button onClick={exportFindingsCsv}><FileText size={16}/> Findings CSV</button><button onClick={exportTestsCsv}><ListChecks size={16}/> WSTG CSV</button><button onClick={exportPocsCsv}><TestTube2 size={16}/> PoC CSV</button><button onClick={exportEvidenceCsv}><Archive size={16}/> Evidence Manifest</button><button onClick={exportHtml}><FileCheck2 size={16}/> Standalone HTML</button><button onClick={exportMarkdown}><FileText size={16}/> Markdown Summary</button>
          </div></div>
        </div>
      </header>

      <section className="report-page cover" id="cover">
        <div className="classification-strip">{liveReportMeta.classification} · CONTROLLED SECURITY ENGINEERING RECORD</div>
        <div className="cover-mark"><ShieldCheck size={54}/></div>
        <div className="cover-kicker">SECURITY ENGINEERING · VERIFICATION · EVIDENCE · RISK · REMEDIATION</div>
        <h1>{liveReportMeta.title}</h1>
        <p className="cover-sub">Reference implementation of an evidence-oriented, traceable security assessment for a specialized security laboratory.</p>
        <div className="cover-meta-grid">
          <Meta label="Organization" value={liveReportMeta.organization}/><Meta label="Laboratory" value={liveReportMeta.laboratory}/><Meta label="Project" value={liveReportMeta.project}/><Meta label="Project ID" value={liveReportMeta.projectId}/><Meta label="Assessment ID" value={liveReportMeta.assessmentId}/><Meta label="Report ID" value={liveReportMeta.reportId}/><Meta label="Version" value={liveReportMeta.version}/><Meta label="Status" value={liveReportMeta.reportStatus}/><Meta label="Assessment Period" value={`${liveReportMeta.startDate} — ${liveReportMeta.endDate}`}/><Meta label="Report Date" value={liveReportMeta.reportDate}/><Meta label="Standards Baseline" value={liveReportMeta.standardsBaselineId}/><Meta label="Classification" value={liveReportMeta.classification}/>
        </div>
        <div className="cover-signoff"><div><span>Prepared by</span><strong>{liveReportMeta.preparedBy}</strong></div><div><span>Reviewed by</span><strong>{liveReportMeta.reviewedBy}</strong></div><div><span>Approved by</span><strong>{liveReportMeta.approvedBy}</strong></div><div><span>Overall organizational risk</span><strong className="risk-high-text">HIGH</strong></div></div>
        <div className="cover-footer"><span>{liveReportMeta.documentId}</span><span>{liveReportMeta.classification}</span><span>Page-controlled PDF output</span></div>
      </section>

      {showCore && <>
        <section className="report-page" id="official-document-profile">
          <SectionHeading num="F1" title={locale === 'fa' ? 'شناسنامه مستند' : 'Official Document Profile'} subtitle={locale === 'fa' ? 'اطلاعات مندرج در مستند مبنا؛ بدون بازنویسی.' : 'Official identity, ownership and lifecycle metadata for the assessed system and issued report.'} icon={<Fingerprint/>}/>
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
              <p className="muted" style={{textAlign:'center'}}>{officialDocumentProfile.sourceCaptionFa}</p>
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
          <SectionHeading num="F2" title={locale === 'fa' ? 'کنترل کیفیت گزارش' : 'Report Quality Control'} subtitle={locale === 'fa' ? 'متن کنترل کیفیت مندرج در مستند مبنا؛ بدون بازنویسی.' : 'Formal report-quality checks and the recorded controller approval.'} icon={<UserCheck/>}/>
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
                  <span>✓</span>
                ])}
              />
              <p className="muted" style={{textAlign:'center'}}>{reportQualityControl.sourceCaptionFa}</p>
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
                  <span dir="rtl" style={{display:'block',textAlign:'right'}}>{x.fa}</span>,
                  <span className="badge verdict-pass">Approved</span>
                ])}
              />
            </>
          )}
        </section>

        <section className="report-page" id="assessment-team-timeline">
          <SectionHeading num="F3" title={locale === 'fa' ? 'تاریخچه آزمونگران' : 'Assessment Team & Timeline'} subtitle={locale === 'fa' ? 'سوابق مندرج در مستند مبنا؛ بدون بازنویسی.' : 'Recorded tester participation, assessment dates, documentation approval and report preparation milestones.'} icon={<Activity/>}/>
          <div data-source-literal={locale === 'fa' ? 'true' : undefined} dir={locale === 'fa' ? 'rtl' : undefined}>
            <SimpleTable
              headers={locale === 'fa'
                ? ['ردیف','نام آزمونگر','تاریخ شروع آزمون','تاریخ پایان آزمون','تاریخ تایید مستندات','تاریخ تهیه گزارش']
                : ['Row','Tester','Assessment Start','Assessment End','Documentation Approval','Report Preparation']}
              rows={assessmentPersonnelHistory.map(x=>[x.row,x.tester,x.assessmentStart,x.assessmentEnd,x.documentationApproval,x.reportPreparation])}
            />
            {locale === 'fa' && <p className="muted" style={{textAlign:'center'}}>{assessmentPersonnelHistoryCaptionFa}</p>}
          </div>
        </section>

        <section className="report-page" id="publication-rights">
          <SectionHeading num="F4" title={locale === 'fa' ? publicationRights.titleFa : 'Copyright & Publication Rights'} subtitle={locale === 'fa' ? 'متن حق طبع و نشر مندرج در مستند مبنا؛ بدون بازنویسی.' : 'Publication, copying, translation and document change-control terms.'} icon={<Scale/>}/>
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
            subtitle={locale === 'fa' ? 'متن منتقل‌شده از مستند مبنا؛ بدون بازنویسی محتوایی.' : 'Source-controlled assessment basis and risk definitions.'}
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
                  <span dir="ltr">{x.level}</span>,
                  x.descriptionFa
                ])}
              />
              <p className="muted" style={{textAlign:'center'}}>{assessmentBasisAndRiskDefinitions.sourceCaptionFa}</p>
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
            subtitle={locale === 'fa' ? 'متن و مقادیر مندرج در مستند مبنا؛ بدون بازنویسی محتوایی.' : 'Source-controlled document access and vulnerability-identification content.'}
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
                  <span>{x.useContent ? '✓' : '⊠'}</span>,
                  <span>{x.changeContent ? '✓' : '⊠'}</span>,
                  <span>{x.print ? '✓' : '⊠'}</span>,
                  <span>{x.copyStore ? '✓' : '⊠'}</span>,
                  <span>{x.sendExchange ? '✓' : '⊠'}</span>,
                  <span>{x.destroy ? '✓' : '⊠'}</span>,
                ])}
              />
              <p className="muted" style={{textAlign:'center'}}>{documentAccessControl.sourceCaptionFa}</p>

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
                  <PermissionMark allowed={x.useContent} locale={locale}/>,
                  <PermissionMark allowed={x.changeContent} locale={locale}/>,
                  <PermissionMark allowed={x.print} locale={locale}/>,
                  <PermissionMark allowed={x.copyStore} locale={locale}/>,
                  <PermissionMark allowed={x.sendExchange} locale={locale}/>,
                  <PermissionMark allowed={x.destroy} locale={locale}/>
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
                  <span dir="ltr">{x.classSource}</span>,
                  <span dir="ltr">{x.sourceName}</span>,
                  x.descriptionFa
                ])}
              />
              <p className="muted" style={{textAlign:'center'}}>{cvss31Reference.sourceCaptionFa}</p>
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
                  <span dir="ltr">{x.classSource}</span>,
                  <span dir="ltr">{x.valuesSourceName}</span>,
                  <div className="chip-row" dir="ltr">{x.values.map(v=><span className="chip" key={v}>{v}</span>)}</div>
                ])}
              />
              <p className="muted" style={{textAlign:'center'}}>{cvss31Reference.possibleValuesCaptionFa}</p>
            </div>
          ) : (
            <>
              <SimpleTable
                headers={['Class','Parameter','Possible Values']}
                rows={cvss31Reference.parameters.map(x=>[
                  x.classSource,
                  x.valuesSourceName,
                  <div className="chip-row">{x.values.map(v=><span className="chip" key={v}>{v}</span>)}</div>
                ])}
              />
            </>
          )}
        </section>

        <section className="report-page" id="document-control">
          <SectionHeading num="01" title="Document Control & Governance" subtitle="Identity, ownership, handling, versioning, approvals and distribution of the controlled engineering record." icon={<FileCheck2/>}/>
          <div className="data-grid cols-4"><Meta label="Document ID" value={liveReportMeta.documentId}/><Meta label="Owner" value={documentControl.owner}/><Meta label="Classification" value={documentControl.classification}/><Meta label="Retention" value={liveReportMeta.retention}/><Meta label="Asset Owner" value={liveReportMeta.assetOwner}/><Meta label="Security Owner" value={liveReportMeta.securityOwner}/><Meta label="Risk Owner" value={liveReportMeta.riskOwner}/><Meta label="Document Hash" value={liveReportMeta.documentHash}/></div>
          <Callout title="Handling Instruction" icon={<LockKeyhole/>}>{documentControl.handling}</Callout>
          <h3>Version History</h3><SimpleTable headers={['Version','Date','Author','Change','Status']} rows={documentControl.versions.map(v=>[v.version,v.date,v.author,v.change,v.status])}/>
          <h3>Approval Record</h3><SimpleTable headers={['Role','Name / Identifier','Decision','Date']} rows={documentControl.approvals.map(a=>[a.role,a.name,a.decision,a.date])}/>
          <h3>Authorized Distribution</h3><div className="chip-row">{liveReportMeta.distribution.map(x=><span className="chip" key={x}>{x}</span>)}</div>
        </section>

        <section className="report-page toc-page" id="toc"><SectionHeading num="" title="Table of Contents" subtitle="Controlled report structure." icon={<BookOpen/>}/><div className="toc-list">{TOC.map(([n,t,id])=><a key={id} href={`#${id}`}><span>{n}</span><strong>{t}</strong><i/></a>)}</div></section>

        <section className="report-page" id="executive">
          <SectionHeading num="02" title="Executive Summary" subtitle="Management-level posture backed by traceable technical evidence." icon={<Gauge/>}/>
          <div className="metric-grid">
            <Metric icon={<ClipboardCheck/>} label="Applicable WSTG Tests" value={metrics.applicable} sub={`${metrics.executed} executed · ${metrics.coverage}%`}/>
            <Metric icon={<TestTube2/>} label="PoC Executions" value={metrics.pocs} sub="all executed demo PoCs retained"/>
            <Metric icon={<Archive/>} label="Evidence Artifacts" value={metrics.evidence} sub="traceable evidence manifest"/>
            <Metric icon={<ShieldAlert/>} label="Confirmed Findings" value={findings.length} sub={`${metrics.critical} Critical · ${metrics.high} High`} danger/>
          </div>
          <div className="two-col">
            <div className="card"><h3>Assessment Conclusion</h3><p>The assessment identified material weaknesses in authorization enforcement, input/content boundaries, identity abuse resistance, transport/session policy and client-side protections. The most significant risks arise from weaknesses that can be combined across trust boundaries rather than from isolated findings alone.</p><div className="posture"><span>Organizational Risk</span><strong>HIGH</strong><small>Requires prioritized remediation and independent retest</small></div></div>
            <div className="card"><h3>Finding Distribution</h3><div className="severity-bars"><Bar label="Critical" value={metrics.critical} total={findings.length}/><Bar label="High" value={metrics.high} total={findings.length}/><Bar label="Medium" value={metrics.medium} total={findings.length}/></div><h4>Immediate Management Actions</h4><ul><li>Mitigate Critical exploit paths before broad release.</li><li>Break attack chains by fixing centralized authorization and unsafe input boundaries.</li><li>Require evidence-backed retest before closure of Critical/High findings.</li><li>Track systemic root causes as engineering initiatives, not individual tickets only.</li></ul></div>
          </div>
          <h3>Key Findings</h3><div className="finding-mini-grid">{findings.slice(0,6).map(f=><a className="finding-mini" href={`#${f.id}`} key={f.id}><span className={severityClass(f.severity)}>{f.severity}</span><strong>{f.id} · {f.title}</strong><small>{f.asset} · {f.wstg}</small><span className={riskClass(f.organizationalRisk.riskRating)}>Risk {f.organizationalRisk.riskRating}</span></a>)}</div>
        </section>

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

      {showTechnical && <>
        <section className="report-page" id="methodology">
          <SectionHeading num="05" title="Methodology & Scientific Assurance" subtitle="Repeatable workflow and explicit principles for defensible security conclusions." icon={<Workflow/>}/>
          <div className="method-grid">{methodology.map(m=><div className="method" key={m.step}><span>{m.step}</span><div><strong>{m.name}</strong><p>{m.detail}</p></div></div>)}</div>
          <h3>Scientific Security Reporting Principles</h3><div className="principle-grid">{scientificPrinciples.map(([a,b])=><div className="principle" key={a}><Fingerprint size={18}/><strong>{a}</strong><p>{b}</p></div>)}</div>
          <Callout title="Traceability Backbone" icon={<GitBranch/>}><code>Security Requirement → Test Case → Observation → Evidence → Finding → Root Cause → Attack Path → Technical Impact → Business Impact → Risk → Remediation → Verification Criteria → Retest → Residual Risk</code></Callout>
        </section>

        <section className="report-page" id="standards">
          <SectionHeading num="06" title="Standards Baseline" subtitle="Version-pinned references used for testing, classification, severity, risk and handling." icon={<BookOpen/>}/>
          <SimpleTable headers={['ID','Reference','Version','Purpose','Use in Report']} rows={standards.map(s=>[s.id,s.name,s.version,s.purpose,s.use])}/>
          <Callout title="Version Pinning Rule" icon={<FileSearch/>}>Every assessment records the exact baseline used. Production implementation should never reference an unversioned external standard where identifiers or requirements may change.</Callout>
          <h3>Tools & Instrumentation Register</h3><SimpleTable headers={['Tool','Version','Purpose','Operator']} rows={tools.map(t=>[t.name,t.version,t.purpose,t.operator])}/>
        </section>

        <section className="report-page" id="risk-method">
          <SectionHeading num="07" title="Risk Assessment Method" subtitle="Technical vulnerability severity is explicitly separated from organizational risk." icon={<Scale/>}/>
          <Callout title="Core Rule" icon={<AlertTriangle/>}>{riskMethodology.principle}</Callout>
          <div className="two-col"><div className="card"><h3>Technical Severity</h3><p>Record CVSS version, complete vector, score and resulting severity. Preserve the vector so the score is reproducible and reviewable.</p><code>CVSS v4.0 Vector → Score → Technical Severity</code></div><div className="card"><h3>Organizational Risk</h3><p>Evaluate contextual likelihood and impact using asset criticality, exposure, business consequences, threat evidence, controls, detection and confidence.</p><code>Context + Likelihood + Impact + Controls → Organizational Risk</code></div></div>
          <h3>Decision Factors</h3><div className="chip-row">{riskMethodology.decisionFactors.map(x=><span className="chip" key={x}>{x}</span>)}</div>
          <h3>Risk Acceptance Governance</h3><p>{riskMethodology.acceptanceRule}</p>
        </section>

        <section className="report-page" id="coverage-matrix">
          <SectionHeading num="08" title="Security Coverage Matrix" subtitle="Coverage is evidence of what was tested—not a claim of absolute security." icon={<ClipboardCheck/>}/>
          <div className="metric-grid compact"><Metric label="WSTG Baseline" value={metrics.total} sub="top-level v4.2 test items"/><Metric label="Applicable" value={metrics.applicable} sub={`${metrics.na} not applicable`}/><Metric label="Executed" value={metrics.executed} sub={`${metrics.coverage}% applicable coverage`}/><Metric label="PASS / FAIL / PARTIAL" value={`${metrics.pass} / ${metrics.fail} / ${metrics.partial}`} sub="test-level verdicts"/></div>
          <h3>WSTG Category Coverage</h3><SimpleTable headers={['Category','Tests','PASS','FAIL','PARTIAL','N/A','PoCs','Evidence']} rows={categories.map(c=>{const a=wstgItems.filter(t=>t.category===c.code);return [c.name,a.length,a.filter(x=>x.verdict==='PASS').length,a.filter(x=>x.verdict==='FAIL').length,a.filter(x=>x.verdict==='PARTIAL').length,a.filter(x=>x.verdict==='N/A').length,a.reduce((n,x)=>n+x.pocCount,0),a.reduce((n,x)=>n+x.evidenceCount,0)]})}/>
          <h3>Authorization Role × Technique Coverage</h3><SimpleTable headers={['Role','GET','POST','PUT','DELETE','Object Swap','Role Bypass','Direct Access']} rows={authorizationCoverage.map(r=>[r.role,r.GET,r.POST,r.PUT,r.DELETE,r.objectSwap,r.roleBypass,r.directAccess])}/>
          <Callout title="PASS Semantics" icon={<CheckCircle2/>}>A PASS means no vulnerable behavior was observed under the recorded test conditions. It does not mean the application is globally secure, and a PASS cannot be issued without a traceable execution record in this framework.</Callout>
        </section>

        <section className="report-page" id="findings-summary">
          <SectionHeading num="09" title="Findings Summary" subtitle="Engineering findings with technical severity and organizational risk shown separately." icon={<ShieldAlert/>}/>
          <SimpleTable headers={['ID','Finding','Asset','CWE','WSTG','Severity','CVSS','Risk','Status','Priority']} rows={findings.map(f=>[f.id,f.title,f.asset,f.cwe,f.wstg,<span className={severityClass(f.severity)}>{f.severity}</span>,f.cvssScore,<span className={riskClass(f.organizationalRisk.riskRating)}>{f.organizationalRisk.riskRating}</span>,f.status,f.priority])}/>
        </section>

        <section className="report-page" id="findings">
          <SectionHeading num="10" title="Detailed Security Findings" subtitle="Each finding is a self-contained, evidence-backed engineering record." icon={<ShieldAlert/>}/>
          <div className="finding-stack">{findings.map(f=><FindingRecord key={f.id} f={f} expanded={expandedFindings.has(f.id)} onToggle={()=>toggleSet(setExpandedFindings,f.id)}/>)}</div>
        </section>

        <section className="report-page" id="wstg">
          <SectionHeading num="11" title="OWASP WSTG Test Execution Register" subtitle="All 96 top-level WSTG v4.2 items are represented; applicable demo tests retain every executed PoC and evidence record." icon={<TestTube2/>}/>
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

      {showCore && <section className="report-page" id="limitations">
        <SectionHeading num="15" title="Limitations & Assurance Statement" subtitle="Boundaries, assumptions and the exact strength of the report's conclusions." icon={<Eye/>}/>
        <div className="two-col"><div><h3>Limitations</h3><ul>{limitations.map(x=><li key={x}>{x}</li>)}</ul></div><div><h3>Assumptions</h3><ul>{assumptions.map(x=><li key={x}>{x}</li>)}</ul></div></div>
        <div className="assurance"><ShieldCheck size={28}/><div><strong>Laboratory Assurance Statement</strong><p>{assuranceStatement}</p></div></div>
        <h3>Report-Level Audit Trail</h3><SimpleTable headers={['Timestamp','Actor','Event']} rows={reportAuditTrail.map(x=>[x.time,x.actor,x.event])}/>
      </section>}

      {showAnnex && <section className="report-page annex" id="evidence">
        <SectionHeading num="A" title="Technical Evidence Annex" subtitle="Complete test/PoC/evidence traceability for the static assessment dataset." icon={<Archive/>}/>
        <div className="annex-banner"><strong>{metrics.pocs} PoC executions</strong><span>→</span><strong>{metrics.evidence} evidence artifacts</strong><span>→</span><strong>{findings.length} engineering findings</strong></div>
        <p className="muted">This annex deliberately contains detailed test records. In a production deployment, raw sensitive evidence can remain in a controlled evidence repository while the report contains references, redacted renderings and integrity metadata.</p>
        {wstgItems.map(t=><AnnexTest key={t.id} t={t}/>) }
      </section>}

      {showTechnical && <section className="report-page" id="registers">
        <SectionHeading num="B" title="Registers, Glossary & Data Dictionary" subtitle="Supporting controlled records required for machine-readable reporting and audit." icon={<ListChecks/>}/>
        <h3>Evidence Manifest — Representative Index</h3><SimpleTable headers={['Evidence ID','Type','WSTG','PoC','Finding','Asset','SHA-256','Redaction']} rows={evidenceIndex.slice(0,24).map(e=>[e.id,e.type,e.wstgId,e.pocId,e.findingId,e.asset,e.sha256.slice(0,16)+'…',e.redaction])}/>
        <p className="muted">The complete manifest contains {evidenceIndex.length} records and is available from the Evidence Manifest CSV export.</p>
        <h3>Glossary</h3><SimpleTable headers={['Term','Definition']} rows={glossary}/>
        <h3>Finding Data Dictionary — Core Fields</h3><SimpleTable headers={['Field','Type','Requirement','Definition']} rows={dataDictionary}/>
      </section>}

      <footer className="report-footer"><span>{liveReportMeta.reportId} · v{liveReportMeta.version}</span><span>{liveReportMeta.classification}</span><span>{liveReportMeta.organization}</span></footer>
    </main>
  </div>;
}

function Meta({label,value}){return <div className="meta"><span>{label}</span><strong>{value}</strong></div>}
function SectionHeading({num,title,subtitle,icon}){return <div className="section-heading"><div className="section-icon">{icon}</div><div><span>{num}</span><h2>{title}</h2><p>{subtitle}</p></div></div>}
function Metric({icon,label,value,sub,danger}){return <div className={`metric ${danger?'danger':''}`}><div className="metric-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>}
function Callout({title,icon,children}){return <div className="callout"><div>{icon}</div><div><strong>{title}</strong><p>{children}</p></div></div>}
function Bar({label,value,total}){const p=Math.max(5,(value/Math.max(total,1))*100);return <div className="bar"><div><span>{label}</span><b>{value}</b></div><div className="bar-track"><i style={{width:`${p}%`}}/></div></div>}
function KeyValue({obj}){return <dl className="kv">{Object.entries(obj).map(([k,v])=><React.Fragment key={k}><dt>{k}</dt><dd>{String(v)}</dd></React.Fragment>)}</dl>}
function SimpleTable({headers,rows}){return <div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div>}

function PermissionMark({allowed,locale}:{allowed:boolean;locale:'en'|'fa'}){return <span className={`badge ${allowed?'verdict-pass':'verdict-fail'}`}>{allowed?(locale==='fa'?'مجاز':'Allowed'):(locale==='fa'?'غیرمجاز':'Denied')}</span>}

function FindingRecord({f,expanded,onToggle}){
  return <article className={`finding-record ${expanded?'expanded':''}`} id={f.id}>
    <button className="finding-head no-print" onClick={onToggle}><div><span className={severityClass(f.severity)}>{f.severity}</span><strong>{f.id} · {f.title}</strong><small>{f.asset} · {f.endpoint}</small></div><div className="head-pills"><span>CVSS {f.cvssScore}</span><span className={riskClass(f.organizationalRisk.riskRating)}>Risk {f.organizationalRisk.riskRating}</span>{expanded?<ChevronDown/>:<ChevronRight/>}</div></button>
    <div className="print-only finding-print-title"><span className={severityClass(f.severity)}>{f.severity}</span><h3>{f.id} · {f.title}</h3></div>
    <div className="finding-body">
      <div className="data-grid cols-4"><Meta label="Status" value={f.status}/><Meta label="Finding Version" value={f.findingVersion}/><Meta label="Discovery / Validation" value={`${f.discoveryDate} / ${f.validationDate}`}/><Meta label="Reporter / Validator" value={`${f.reporter} / ${f.validator}`}/><Meta label="CWE" value={f.cwe}/><Meta label="WSTG" value={f.wstg}/><Meta label="CVSS v4.0" value={`${f.cvssScore} ${f.severity}`}/><Meta label="Organizational Risk" value={f.organizationalRisk.riskRating}/><Meta label="Priority" value={f.priority}/><Meta label="Target SLA" value={f.targetSla}/><Meta label="Confidence" value={f.confidenceRecord.rating}/><Meta label="Blast Radius" value={f.blastRadius}/></div>
      <Sub title="Classification & Traceability"><SimpleTable headers={['CWE','CAPEC','WSTG','ASVS','ATT&CK Context','CVE']} rows={[[f.classification.cwe,f.classification.capec,f.classification.wstg,f.classification.asvs,f.classification.attack,f.classification.cve]]}/></Sub>
      <Sub title="Affected Asset"><div className="data-grid cols-3"><Meta label="Application" value={f.affectedAsset.application}/><Meta label="Component / Endpoint" value={f.affectedAsset.component}/><Meta label="Environment" value={f.affectedAsset.environment}/><Meta label="Version / Build" value={`${f.affectedAsset.version} / ${f.affectedAsset.build}`}/><Meta label="Repository / Branch" value={`${f.affectedAsset.repository} / ${f.affectedAsset.branch}`}/><Meta label="Commit" value={f.affectedAsset.commit}/></div></Sub>
      <Sub title="Security Requirement"><p className="requirement">{f.securityRequirement}</p></Sub>
      <div className="two-col"><Sub title="Observation"><p>{f.observation}</p></Sub><Sub title="Expected vs Actual"><p><b>Expected:</b> {f.expectedBehavior}</p><p><b>Actual:</b> {f.actualBehavior}</p></Sub></div>
      <div className="two-col"><Sub title="Preconditions"><ul>{f.preconditions.map(x=><li key={x}>{x}</li>)}</ul></Sub><Sub title="Reproduction Procedure"><ol>{f.reproductionSteps.map(x=><li key={x}>{x}</li>)}</ol></Sub></div>
      <Sub title="PoC & Evidence Linkage"><div className="trace-row"><span>{f.wstg}</span><b>→</b>{f.pocIds.map(x=><span key={x}>{x}</span>)}<b>→</b>{f.evidenceIds.slice(0,4).map(x=><span key={x}>{x}</span>)}<b>→</b><span>{f.id}</span></div></Sub>
      <Sub title="Technical Analysis"><p>{f.technicalAnalysis}</p></Sub>
      <div className="two-col"><Sub title="Root Cause"><KeyValue obj={f.rootCauseDetail}/></Sub><Sub title="Exploitability"><KeyValue obj={f.exploitability}/></Sub></div>
      <Sub title="Attack Path"><div className="chain-flow compact-flow">{f.attackPath.map((x,i)=><React.Fragment key={i}><div>{x}</div>{i<f.attackPath.length-1&&<span>→</span>}</React.Fragment>)}</div></Sub>
      <div className="two-col"><Sub title="Technical Impact"><KeyValue obj={f.technicalImpact}/></Sub><Sub title="Business Impact"><KeyValue obj={f.businessImpactDetail}/></Sub></div>
      <div className="two-col"><Sub title="Technical Severity — CVSS"><KeyValue obj={f.cvss}/><code className="vector">{f.cvss.vector}</code></Sub><Sub title="Organizational Risk"><KeyValue obj={f.organizationalRisk}/></Sub></div>
      <div className="two-col"><Sub title="Threat / Exploitation Context"><KeyValue obj={f.threatContext}/></Sub><Sub title="Confidence & Independent Validation"><KeyValue obj={f.confidenceRecord}/></Sub></div>
      <Sub title="Remediation Engineering"><div className="remediation-grid"><Rem label="Immediate Mitigation" text={f.remediationEngineering.immediateMitigation}/><Rem label="Permanent Fix" text={f.remediationEngineering.permanentFix}/><Rem label="Architectural Fix" text={f.remediationEngineering.architecturalFix}/><Rem label="Defense in Depth" text={f.remediationEngineering.defenseInDepth}/></div></Sub>
      <Sub title="Secure Design Requirement"><p className="requirement">{f.secureDesignRequirement}</p></Sub>
      <div className="two-col"><Sub title="Verification Criteria"><ol>{f.verificationCriteria.map((x,i)=><li key={i}>VC-{String(i+1).padStart(2,'0')} — {x}</li>)}</ol></Sub><Sub title="Detection & Monitoring"><KeyValue obj={{relevantLog:f.detection.relevantLog,event:f.detection.event,siemRule:f.detection.siemRule}}/><div className="chip-row">{f.detection.telemetry.map(x=><span className="chip" key={x}>{x}</span>)}</div></Sub></div>
      <div className="two-col"><Sub title="Retest Record"><KeyValue obj={f.retest}/></Sub><Sub title="Residual Risk / Acceptance"><KeyValue obj={{...f.residualRisk,acceptanceStatus:f.riskAcceptance.status}}/></Sub></div>
      <Sub title="Finding Audit Trail"><SimpleTable headers={['Timestamp','Actor','Action','Old','New','Reason']} rows={f.auditTrail.map(a=>[a.timestamp,a.actor,a.action,a.old,a.new,a.reason])}/></Sub>
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

function PocRecord({p,t}){return <div className="poc-record"><div className="poc-head"><div><TestTube2 size={18}/><strong>{p.id}</strong><span>{t.id}</span></div><span className={verdictClass(p.verdict)}>{p.verdict}</span></div><div className="data-grid cols-4"><Meta label="Confidence" value={p.confidence}/><Meta label="Reproduction" value={p.reproduction}/><Meta label="Asset" value={t.asset}/><Meta label="Finding" value={t.findingId||'—'}/></div><Sub title="Hypothesis"><p className="requirement">{p.hypothesis}</p></Sub><div className="two-col"><Sub title="Preconditions"><p>{p.preconditions}</p></Sub><Sub title="Procedure"><ol>{p.procedure.map((x,i)=><li key={i}>{x}</li>)}</ol></Sub></div><div className="two-col"><Sub title="Expected Result"><p>{p.expected}</p></Sub><Sub title="Actual Result"><p>{p.actual}</p></Sub></div><div className="two-col"><CodeBlock title="Request Evidence" value={p.request}/><CodeBlock title="Response Evidence" value={p.response}/></div><Sub title="Evidence Records"><SimpleTable headers={['Evidence ID','Type','Timestamp','Collector','Source','SHA-256','Storage','Redaction']} rows={p.evidence.map(e=>[e.id,e.type,e.timestamp,e.collector,e.source,e.sha256.slice(0,18)+'…',e.storage,e.redaction])}/></Sub></div>}
function CodeBlock({title,value}){return <div className="code-card"><strong>{title}</strong><pre>{value}</pre></div>}

function AnnexTest({t}){return <article className="annex-test"><div className="annex-test-head"><div><span>{t.versionedId}</span><strong>{t.title}</strong><small>{t.categoryName} · {t.asset}</small></div><span className={verdictClass(t.verdict)}>{t.verdict}</span></div>{t.pocs.length===0?<p><b>Applicability:</b> NO — {t.applicabilityReason}</p>:t.pocs.map(p=><PocRecord key={p.id} p={p} t={t}/>)}</article>}

