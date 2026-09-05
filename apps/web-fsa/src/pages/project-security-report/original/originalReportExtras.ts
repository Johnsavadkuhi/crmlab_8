import {
  reportMeta as baseReportMeta,
  categories,
  wstgItems as baseWstgItems,
  findings as baseFindings
} from './originalWstgData';

export { categories };

const riskFor = severity => ({ Critical:'Extreme', High:'High', Medium:'Moderate', Low:'Low' }[severity] || 'Low');
const priorityFor = severity => ({ Critical:'P0', High:'P1', Medium:'P2', Low:'P3' }[severity] || 'P3');
const slaFor = severity => ({ Critical:'24–72 hours', High:'7 days', Medium:'30 days', Low:'90 days' }[severity] || '90 days');
const hash = seed => Array.from({length:64},(_,i)=>'0123456789abcdef'[(seed*11+i*5)%16]).join('');
 
export const reportMeta = {
  ...baseReportMeta,
  organization: 'National Cybersecurity & Software Assurance Laboratory',
  laboratory: 'Application Security & Quality Engineering Division',
  reportType: 'Security Engineering Verification & Evidence Report',
  reportStatus: 'FINAL — STATIC REFERENCE IMPLEMENTATION',
  documentId: 'DOC-SEVRF-2026-041',
  projectId: 'PRJ-DB-2026-017',
  client: 'Aurora Digital Banking — Digital Channels',
  assetOwner: 'Digital Banking Product Group',
  securityOwner: 'Chief Information Security Office',
  reportDate: '2026-08-16',
  approvedBy: 'Head of Security & Quality Laboratory',
  technicalReviewer: 'Principal Application Security Engineer',
  riskOwner: 'Digital Banking Executive Sponsor',
  documentHash: 'DEMO — compute SHA-256 from finalized immutable PDF in production',
  retention: '7 years (demonstration policy)',
  distribution: ['CISO','Security Technical Manager','Digital Banking Product Owner','Risk Management','Internal Audit'],
  standardsBaselineId: 'SB-2026.08-A'
};

export const documentControl = {
  owner: reportMeta.laboratory,
  classification: reportMeta.classification,
  handling: 'Need-to-know distribution. Evidence containing credentials, tokens, personal data, or production identifiers must be redacted in report views and protected in the evidence repository.',
  versions: [
    {version:'0.1',date:'2026-08-05',author:'PT-011',change:'Initial assessment record and scope baseline',status:'Draft'},
    {version:'0.7',date:'2026-08-14',author:'PT-013',change:'Technical review; WSTG execution register completed',status:'Review'},
    {version:'1.0',date:'2026-08-16',author:'Security Reporting Office',change:'Final engineering report issued',status:'Final'}
  ],
  approvals: [
    {role:'Lead Assessor',name:'PT-011',decision:'Prepared',date:'2026-08-16'},
    {role:'Independent Technical Reviewer',name:reportMeta.technicalReviewer,decision:'Reviewed',date:'2026-08-16'},
    {role:'Security Technical Manager',name:reportMeta.reviewedBy,decision:'Approved',date:'2026-08-16'},
    {role:'Risk Owner',name:reportMeta.riskOwner,decision:'Acknowledged',date:'2026-08-16'}
  ]
};

export const assessmentContext = {
  purpose: 'Independently evaluate the security properties of the in-scope digital banking application and produce traceable engineering evidence suitable for remediation, management decision-making, independent review, and audit.',
  businessContext: 'The platform provides customer authentication, account views, beneficiary management, payment initiation, reporting, administrative support operations, and integration APIs.',
  securityContext: 'The system processes customer identity data, account information, authentication/session material, payment instructions, and operational audit records.',
  systemCriticality: 'MISSION CRITICAL',
  dataClassification: 'RESTRICTED / FINANCIAL & PERSONAL DATA',
  environment: 'Dedicated pre-production assessment environment with production-equivalent application build and synthetic customer data.',
  architecture: [
    'Internet / Mobile & Web Clients',
    'Web Application Firewall / API Gateway',
    'Web Front End',
    'Authentication & Session Service',
    'Digital Banking API Services',
    'Administrative Portal',
    'Core Integration Layer',
    'Relational Database / Audit Store'
  ],
  trustBoundaries: [
    'Untrusted Internet → Edge Security Boundary',
    'Authenticated Customer → Application Authorization Boundary',
    'Web/API Tier → Internal Service Boundary',
    'Application Services → Data Boundary',
    'Operations User → Privileged Administration Boundary'
  ]
};

export const objectives = [
  'Verify authentication, authorization, session, input-validation, business-logic, cryptographic, client-side, configuration, and error-handling controls.',
  'Establish evidence-backed WSTG test coverage for applicable in-scope functionality.',
  'Identify exploitable weaknesses and distinguish observed technical severity from organizational risk.',
  'Trace confirmed findings to requirements, test executions, PoCs, evidence, root causes, remediation, and verification criteria.',
  'Identify attack chains and systemic engineering causes that are not visible when findings are reviewed individually.',
  'Provide retest and residual-risk criteria suitable for closure governance.'
];

export const assets = [
  {id:'WEB-001',name:'Customer Web Application',type:'Web Application',url:'https://web.aurora.test',hostname:'web.aurora.test',ip:'10.40.12.21',environment:'Pre-production',version:'2026.08.3',build:'web-20260803.4',owner:'Digital Channels',criticality:'Critical',data:'Restricted'},
  {id:'API-001',name:'Digital Banking API',type:'REST API',url:'https://api.aurora.test',hostname:'api.aurora.test',ip:'10.40.12.22',environment:'Pre-production',version:'v3.18.2',build:'api-4f81bd2',owner:'Banking Platform',criticality:'Critical',data:'Restricted'},
  {id:'AUTH-001',name:'Identity & Session Service',type:'Authentication Service',url:'https://auth.aurora.test',hostname:'auth.aurora.test',ip:'10.40.12.23',environment:'Pre-production',version:'6.7.1',build:'iam-dc903f1',owner:'Identity Engineering',criticality:'Critical',data:'Highly Restricted'},
  {id:'ADMIN-001',name:'Operations Administration Portal',type:'Privileged Web Application',url:'https://admin.aurora.test',hostname:'admin.aurora.test',ip:'10.40.15.10',environment:'Pre-production',version:'2026.08.1',build:'admin-1a02ac9',owner:'Operations Technology',criticality:'Critical',data:'Restricted'}
];

export const scope = {
  inScope: assets.map(a=>a.id),
  sourceReview: {repository:'git.example.test/digital-banking',branch:'release/2026.08',commit:'4f81bd2c7e50e0d8c2cbd1aa3d89a1c83d1e5d74',mode:'Targeted white-box review for confirmed high-impact paths'},
  roles: ['Anonymous','Customer','Premium Customer','Support Operator','Operations Manager','Administrator'],
  protocols: ['HTTPS','HTTP/2','WebSocket where exposed'],
  outOfScope: [
    'Production customer data and production transaction execution',
    'Denial-of-service, volumetric load, destructive stress testing',
    'Social engineering and physical security',
    'Third-party payment processor beyond documented integration boundary',
    'Persistence, destructive data modification, or lateral movement outside explicit test environment'
  ]
};

export const rulesOfEngagement = [
  {activity:'Controlled exploitation',decision:'ALLOWED',condition:'Only to establish security impact using synthetic data and reversible actions.'},
  {activity:'Privilege escalation',decision:'ALLOWED',condition:'Within in-scope applications and supplied test identities.'},
  {activity:'Credential guessing / throttling validation',decision:'CONDITIONALLY ALLOWED',condition:'Rate-limited test accounts; no impact to shared identity infrastructure.'},
  {activity:'Data extraction',decision:'LIMITED',condition:'Minimum synthetic records necessary to prove impact; no bulk extraction.'},
  {activity:'Denial of service',decision:'PROHIBITED',condition:'No availability-impacting tests.'},
  {activity:'Persistence / malware deployment',decision:'PROHIBITED',condition:'Not required for application security objectives.'},
  {activity:'Testing window',decision:'ALLOWED',condition:'09:00–19:00 local laboratory window unless coordinated.'}
];

export const stopConditions = [
  'Unexpected service degradation, data-integrity risk, or cross-environment impact.',
  'Evidence of access to real customer data or production credentials.',
  'Security incident declaration by the client or laboratory incident coordinator.',
  'Any behavior outside approved Rules of Engagement.'
];

export const methodology = [
  {step:'01',name:'Authorization & Planning',detail:'Assessment authorization, scope, assumptions, test accounts, escalation contacts, evidence handling and Rules of Engagement frozen before execution.'},
  {step:'02',name:'Asset & Attack Surface Mapping',detail:'Enumerate in-scope applications, APIs, roles, entry points, trust boundaries, versions and exposed functionality.'},
  {step:'03',name:'Threat & Requirement Mapping',detail:'Map security requirements to test objectives using WSTG/ASVS and organization-specific controls.'},
  {step:'04',name:'Automated & Manual Verification',detail:'Use tools for discovery and acceleration, while security conclusions require analyst validation and traceable test execution records.'},
  {step:'05',name:'Controlled Exploitation',detail:'Demonstrate exploitability under approved conditions without unnecessary impact.'},
  {step:'06',name:'Evidence Preservation',detail:'Record requests, responses, screenshots, logs and metadata with evidence IDs, timestamps, redaction state and integrity hashes.'},
  {step:'07',name:'Finding & Root-Cause Analysis',detail:'Separate observation from interpretation; classify the weakness, determine root cause, blast radius, attack path and systemic relationships.'},
  {step:'08',name:'Severity & Organizational Risk',detail:'Calculate technical severity separately from contextual organizational risk and record confidence and assumptions.'},
  {step:'09',name:'Remediation Engineering',detail:'Define immediate mitigation, permanent fix, secure-design requirement, defense-in-depth and verification criteria.'},
  {step:'10',name:'Independent Review & Retest',detail:'High-impact conclusions receive technical review; remediation closure requires retest evidence and residual-risk decision.'}
];

export const scientificPrinciples = [
  ['Observation ≠ Interpretation','Record what was directly observed separately from causal or risk analysis.'],
  ['Reproducibility','A qualified independent tester should be able to repeat the recorded test under equivalent conditions.'],
  ['Traceability','Every material conclusion links backward to requirements, test execution and evidence, and forward to remediation and verification.'],
  ['Falsifiability','Verification criteria explicitly state what result would contradict the vulnerability claim or demonstrate successful remediation.'],
  ['Uncertainty','Confidence, limitations, assumptions and environment dependence are explicitly recorded.'],
  ['Evidence Integrity','Evidence is uniquely identified, timestamped, redacted when required, hashed and stored under controlled handling.'],
  ['Independent Verification','Critical and High findings require independent technical review before final issuance in this demonstration policy.']
];

export const standards = [
  {id:'STD-01',name:'OWASP Web Security Testing Guide',version:'v4.2 Stable',purpose:'Web application security test taxonomy and test references',use:'Coverage/Test Case Baseline'},
  {id:'STD-02',name:'OWASP Application Security Verification Standard',version:'5.0.0',purpose:'Application security verification requirements',use:'Security Requirement Mapping'},
  {id:'STD-03',name:'FIRST Common Vulnerability Scoring System',version:'CVSS v4.0',purpose:'Technical vulnerability severity characteristics',use:'Technical Severity'},
  {id:'STD-04',name:'MITRE Common Weakness Enumeration',version:'Version pinned by production platform',purpose:'Weakness classification',use:'Finding Classification'},
  {id:'STD-05',name:'MITRE CAPEC',version:'Version pinned by production platform',purpose:'Attack-pattern classification',use:'Attack Pattern Mapping'},
  {id:'STD-06',name:'MITRE ATT&CK',version:'Version pinned by production platform',purpose:'Adversary behavior / detection context',use:'Attack & Detection Mapping'},
  {id:'STD-07',name:'NIST SP 800-115',version:'Final',purpose:'Technical security testing and assessment planning/execution guidance',use:'Assessment Methodology'},
  {id:'STD-08',name:'NIST SP 800-30 Rev. 1',version:'Rev. 1',purpose:'Risk assessment concepts',use:'Organizational Risk Method'},
  {id:'STD-09',name:'ISO/IEC 27005',version:'2022',purpose:'Information security risk management',use:'Risk Governance'},
  {id:'STD-10',name:'ISO/IEC 29147',version:'2018',purpose:'Vulnerability disclosure guidance',use:'Vulnerability Communication'},
  {id:'STD-11',name:'ISO/IEC 30111',version:'2019',purpose:'Vulnerability handling processes',use:'Remediation / Handling Lifecycle'}
];

export const tools = [
  {name:'Burp Suite Professional',version:'2026.x demo',purpose:'HTTP interception, replay, manual validation',operator:'PT-011'},
  {name:'OWASP ZAP',version:'2.x demo',purpose:'Supplementary automated web checks',operator:'PT-012'},
  {name:'Nmap',version:'7.x demo',purpose:'Service verification within approved scope',operator:'PT-014'},
  {name:'Browser DevTools',version:'Current enterprise browser',purpose:'Client-side, storage and transport validation',operator:'PT-013'},
  {name:'Custom Evidence Collector',version:'SEVRF-EC 0.9 demo',purpose:'Evidence metadata, IDs, redaction state and manifests',operator:'Laboratory'}
];

export const riskMethodology = {
  principle:'Technical Severity and Organizational Risk are deliberately separate records. CVSS describes vulnerability severity characteristics; organizational risk incorporates asset criticality, exposure, threat context, business impact, existing controls and uncertainty.',
  likelihoodScale:['Rare','Unlikely','Possible','Likely','Almost Certain'],
  impactScale:['Negligible','Low','Moderate','Major','Severe'],
  riskScale:['Low','Moderate','High','Extreme'],
  decisionFactors:['Technical severity','Exploit preconditions','Exposure','Asset criticality','Business impact','Threat context','Existing controls','Compensating controls','Detection capability','Confidence'],
  acceptanceRule:'Accepted risk requires an accountable owner, documented rationale, compensating controls where applicable, approval, expiration/review date, and residual-risk statement.'
};

function secondPoc(item, index) {
  const isFail = item.verdict === 'FAIL';
  const isPartial = item.verdict === 'PARTIAL';
  return {
    id:`POC-${item.category}-${String(index+1).padStart(3,'0')}-B`,
    hypothesis:`The security control represented by ${item.id} remains effective when the request context, method, role, or input variant is changed within the approved test scope.`,
    preconditions:'Authorized secondary test identity or alternate request context; same in-scope asset; controlled non-destructive execution.',
    procedure:[
      'Establish the baseline behavior using the approved test identity.',
      'Change one security-relevant dimension (role, object, method, input encoding, browser context, or request path).',
      'Submit the alternate request while preserving all unrelated conditions.',
      'Capture response, application behavior, and any relevant logs.',
      'Compare the observation to the stated security requirement.'
    ],
    expected:'The security control should remain consistent across equivalent alternate request paths and contexts.',
    actual:isFail ? 'The alternate scenario reproduced behavior consistent with the confirmed finding.' : isPartial ? 'The alternate scenario produced inconsistent evidence and requires bounded follow-up verification.' : 'No bypass or security-relevant deviation was observed in the alternate scenario.',
    verdict:item.verdict,
    confidence:isFail?'CONFIRMED':isPartial?'MODERATE':'HIGH',
    reproduction:isFail?'2/2':'1/1',
    request:`POST /verification/${item.category.toLowerCase()}/${String(index+1).padStart(2,'0')} HTTP/1.1\nHost: ${item.asset.toLowerCase()}.aurora.test\nAuthorization: Bearer [REDACTED]\nX-Test-Variant: B`,
    response:isFail?'HTTP/1.1 200 OK\n\n{"verification":"unexpected behavior reproduced"}':isPartial?'HTTP/1.1 202 Accepted\n\n{"verification":"inconclusive variant"}':'HTTP/1.1 403 Forbidden\n\n{"verification":"security control enforced"}',
    evidence:[
      {id:`EVD-${String(index+1).padStart(4,'0')}-B-REQ`,type:'HTTP Transaction',timestamp:`2026-08-${String(4+(index%10)).padStart(2,'0')}T11:${String(index%60).padStart(2,'0')}:00+04:00`,collector:item.tester,source:'Intercept Proxy',sha256:hash(index+300),storage:`evidence/${item.id}/variant-b-request`,redaction:'REDACTED'},
      {id:`EVD-${String(index+1).padStart(4,'0')}-B-OBS`,type:'Screenshot / Observation',timestamp:`2026-08-${String(4+(index%10)).padStart(2,'0')}T11:${String((index+1)%60).padStart(2,'0')}:00+04:00`,collector:item.tester,source:'Browser / Test Client',sha256:hash(index+500),storage:`evidence/${item.id}/variant-b-observation`,redaction:'REDACTED'}
    ]
  };
}

function enrichOriginalPoc(poc,item,index) {
  return {
    ...poc,
    verdict:item.verdict,
    procedure:[
      'Prepare the approved test identity and establish a known-good baseline.',
      `Execute the WSTG test objective against ${item.asset}.`,
      'Modify only the security-relevant request/input dimension under test.',
      'Submit the request using the authorized assessment channel.',
      'Capture response and observable application behavior.',
      'Compare actual behavior with the expected security property and record verdict.'
    ],
    evidence:poc.evidence.map((e,i)=>({
      ...e,
      timestamp:`2026-08-${String(4+(index%10)).padStart(2,'0')}T10:${String((index+i)%60).padStart(2,'0')}:00+04:00`,
      collector:item.tester,
      source:i===0?'Intercept Proxy':'Browser / Test Client',
      storage:`evidence/${item.id}/${e.id}`,
      redaction:'REDACTED'
    }))
  };
}

export const wstgItems = baseWstgItems.map((item,index)=>{
  const applicable = item.verdict !== 'N/A';
  const pocs = applicable ? [enrichOriginalPoc(item.poc,item,index), secondPoc(item,index)] : [];
  return {
    ...item,
    versionedId:item.id.replace('WSTG-','WSTG-v42-'),
    applicable:applicable?'YES':'NO',
    applicabilityReason:applicable?'In-scope application behavior maps to this WSTG test objective.':'No applicable feature or technology is present in the approved assessment scope.',
    reviewer:`PT-${String(20+(index%3)).padStart(3,'0')}`,
    limitations:item.verdict==='PARTIAL'?'One bounded execution path could not be fully validated within the assessment window.':'No material test-specific limitation recorded.',
    hypotheses:[
      `H1 — The application satisfies the security property represented by ${item.id} for the primary tested path.`,
      `H2 — The control remains effective under an alternate role, request, input, or client context where applicable.`
    ],
    testScope:{asset:item.asset,roles: item.category==='ATHZ'?['Customer','Support Operator','Administrator']:['Anonymous','Customer'],methods:['GET','POST'],environment:'Pre-production'},
    pocs,
    pocCount:pocs.length,
    evidenceCount:pocs.reduce((n,p)=>n+p.evidence.length,0)
  };
});

const assetById = Object.fromEntries(assets.map(a=>[a.id,a]));

function capecFor(cwe){
  const map={'CWE-639':'CAPEC-1 / Accessing Functionality Not Properly Constrained by ACLs','CWE-89':'CAPEC-66 / SQL Injection','CWE-307':'CAPEC-112 / Brute Force','CWE-352':'CAPEC-62 / Cross Site Request Forgery','CWE-79':'CAPEC-63 / Cross-Site Scripting','CWE-434':'CAPEC-1 / Malicious File','CWE-918':'CAPEC-664 / SSRF'};
  return map[cwe] || 'Contextual CAPEC mapping required';
}

function attackTechniqueFor(f){
  if (f.wstg.includes('ATHZ')) return 'Initial Access / Privilege boundary abuse (contextual ATT&CK mapping)';
  if (f.wstg.includes('ATHN')) return 'Credential Access / Brute Force context';
  if (f.wstg.includes('INPV')) return 'Execution / Exploitation for Client/Server Execution context';
  return 'Contextual ATT&CK mapping — validate against deployment and adversary scenario';
}

export const findings = baseFindings.map((f,index)=>{
  const linkedTest = wstgItems.find(x=>x.id===f.wstg);
  const asset = assetById[f.asset];
  const evidenceIds = linkedTest ? linkedTest.pocs.flatMap(p=>p.evidence.map(e=>e.id)) : [];
  const pocIds = linkedTest ? linkedTest.pocs.map(p=>p.id) : [];
  const risk = riskFor(f.severity);
  return {
    ...f,
    findingVersion:'1.0',
    discoveryDate:linkedTest?.executionDate || '2026-08-10',
    validationDate:'2026-08-15',
    reporter:linkedTest?.tester || 'PT-011',
    validator:linkedTest?.reviewer || 'PT-020',
    reviewer:reportMeta.technicalReviewer,
    classification:{
      cwe:f.cwe,
      capec:capecFor(f.cwe),
      wstg:f.wstg,
      asvs:'Mapped security requirement in ASVS 5.0.0 baseline — exact requirement ID maintained in production control catalog',
      attack:attackTechniqueFor(f),
      cve:'N/A — application-specific finding',
      vendorAdvisory:'N/A'
    },
    affectedAsset:{
      id:f.asset,
      application:asset?.name || f.asset,
      component:f.endpoint,
      environment:asset?.environment || 'Pre-production',
      version:asset?.version || 'See asset register',
      build:asset?.build || 'See asset register',
      endpoint:f.endpoint,
      repository:scope.sourceReview.repository,
      branch:scope.sourceReview.branch,
      commit:scope.sourceReview.commit
    },
    securityRequirement:`The ${asset?.name || 'application'} shall enforce the intended security control represented by ${f.wstg} at the authoritative server-side trust boundary, regardless of client-controlled input or alternate request path.`,
    expectedBehavior:'The request should be rejected, safely processed, or constrained so that the protected security property cannot be violated.',
    actualBehavior:f.observation,
    preconditions:['Network access to in-scope assessment environment','Approved test identity where authentication is required','No destructive action required','Synthetic or non-sensitive test data'],
    reproductionSteps:[
      'Authenticate or establish the required baseline context using the approved test identity.',
      `Navigate or submit a baseline request to ${f.endpoint}.`,
      `Apply the security-relevant test variation associated with ${f.wstg}.`,
      'Submit the modified request and capture the complete response.',
      'Repeat using an independent equivalent context when practical.',
      `Observe the behavior recorded in evidence ${evidenceIds.slice(0,2).join(' and ') || 'linked evidence records'}.`
    ],
    pocIds,
    evidenceIds,
    technicalAnalysis:`The observed behavior indicates that the expected security property is not enforced consistently at the authoritative control point. The condition is reproducible in the documented assessment environment and is mapped to ${f.cwe}.`,
    rootCauseDetail:{category:f.rootCause,layer:f.asset==='API-001'?'API / Service Authorization & Input Boundary':f.asset==='AUTH-001'?'Identity / Session Boundary':'Web / Application Control Boundary',systemicPotential:index%3===0?'High':'Moderate'},
    attackPath:['External or authenticated actor','Reach affected feature / endpoint',`Trigger ${f.title}`,'Bypass or violate intended security property',f.businessImpact],
    exploitability:{attackVector:'Network',requiredAccess:f.wstg.includes('ATHN')?'Unauthenticated / account context dependent':'Low-privileged account where documented',requiredPrivilege:f.wstg.includes('AUTH')?'None':'Low / context dependent',userInteraction:f.cwe==='CWE-352'||f.cwe==='CWE-79'?'Required in representative scenario':'None in representative scenario',complexity:f.severity==='Critical'?'Low':'Low to Moderate',automationPotential:f.wstg.includes('ATHN')||f.cwe==='CWE-639'?'High':'Moderate',scalability:f.severity==='Critical'?'High':'Context dependent',detectability:'Moderate — depends on audit event coverage'},
    technicalImpact:{confidentiality:f.severity==='Critical'?'High':f.cwe==='CWE-352'?'Low':'Moderate',integrity:['CWE-89','CWE-352','CWE-434'].includes(f.cwe)?'High':'Moderate',availability:f.cwe==='CWE-89'?'Moderate':'Low',authorization:f.wstg.includes('ATHZ')?'High':'Contextual',authentication:f.wstg.includes('ATHN')?'High':'Contextual',privacy:['CWE-639','CWE-79','CWE-918'].includes(f.cwe)?'High':'Moderate'},
    businessImpactDetail:{statement:f.businessImpact,affectedUsers:f.severity==='Critical'?'Potentially multiple customer accounts':'Subset depends on affected workflow',affectedRecords:'Not enumerated — proof limited to minimum synthetic records',financial:'Potential fraud/remediation cost depending on exploit path',regulatory:'Potentially relevant if real regulated data were exposed',operational:'Incident response and service remediation effort',reputation:'Potential customer trust impact'},
    blastRadius:f.severity==='Critical'?'Multiple Accounts / Application-wide control class':f.severity==='High'?'Affected Application / Role Boundary':'Affected Workflow / Component',
    cvss:{version:'4.0',vector:f.cvssVector,baseScore:f.cvssScore,severity:f.severity},
    threatContext:{knownExploitation:'No claim made by this assessment',publicExploit:'Application-specific; no public exploit required for validation',exploitMaturity:'Proof-of-concept validated in assessment',epss:'N/A unless mapped to a public CVE',kev:'N/A unless mapped to a CISA KEV CVE'},
    organizationalRisk:{likelihood:f.severity==='Critical'?'Likely':f.severity==='High'?'Possible to Likely':'Possible',assetCriticality:asset?.criticality || 'Critical',businessImpact:f.severity==='Critical'?'Severe':f.severity==='High'?'Major':'Moderate',exposure:f.asset==='ADMIN-001'?'Restricted / authenticated':'Network-accessible in assessment topology',existingControls:'Authentication, edge controls, logging and application validation where present',compensatingControls:'Context dependent; none considered sufficient to close the finding',riskRating:risk,residualRisk:'Pending remediation and retest'},
    confidenceRecord:{rating:f.confidence.toUpperCase(),evidenceStrength:'Direct reproducible application evidence',reproductionCount:linkedTest?.pocs?.[0]?.reproduction || '3/3',independentValidation:'YES for Critical/High; sample-reviewed for Medium in demo'},
    remediationEngineering:{immediateMitigation:`Constrain or disable the affected path ${f.endpoint} if exposure cannot be safely controlled before permanent remediation.`,permanentFix:f.remediation,architecturalFix:`Move enforcement to the authoritative server-side control layer and centralize the relevant security policy so alternate clients/routes cannot bypass it.`,defenseInDepth:'Add security telemetry, negative regression tests, least privilege, and policy-as-code or centralized security middleware where applicable.'},
    secureDesignRequirement:`All equivalent access paths to ${f.endpoint} shall enforce the same deny-by-default security property server-side and shall not trust client-controlled state as proof of authorization or safety.`,
    verificationCriteria:[f.verification,'Original PoC no longer produces vulnerable behavior.','Alternate route/method/input variants are tested for regression.','Authorized business functionality remains operational.','Security telemetry records rejected abuse attempts where applicable.'],
    detection:{relevantLog:'Application authorization/input-validation/security audit log',event:`SECURITY_CONTROL_VIOLATION / ${f.id}`,siemRule:`Alert on repeated ${f.id}-relevant rejected or anomalous requests correlated by user, source, target and time window.`,telemetry:['Request correlation ID','Authenticated principal/role','Target resource/action','Security decision','Source metadata','Response code']},
    retest:{id:`RT-${f.id}-001`,date:'Pending remediation',tester:'Independent retest assignee',environment:'Same or production-equivalent controlled environment',applicationVersion:'Pending',build:'Pending',commit:'Pending',result:'NOT TESTED',testCases:[f.wstg,...pocIds],evidence:'To be attached on execution'},
    residualRisk:{rating:'PENDING',reason:'Cannot be finalized until remediation and retest evidence are complete.',compensatingControls:'To be reviewed at closure',riskOwner:reportMeta.riskOwner},
    riskAcceptance:{required:false,status:'NOT REQUESTED',owner:'—',reason:'—',approval:'—',acceptanceDate:'—',expirationDate:'—'},
    auditTrail:[
      {timestamp:`${linkedTest?.executionDate || '2026-08-10'}T10:15:00+04:00`,actor:linkedTest?.tester || 'PT-011',action:'Finding created from failed WSTG execution',old:'—',new:'Draft',reason:'Unexpected security-relevant behavior validated'},
      {timestamp:'2026-08-15T14:20:00+04:00',actor:linkedTest?.reviewer || 'PT-020',action:'Independent technical validation',old:'Draft',new:'Confirmed',reason:'Evidence and reproduction reviewed'},
      {timestamp:'2026-08-16T09:30:00+04:00',actor:reportMeta.reviewedBy,action:'Report issuance review',old:'Confirmed',new:'Open',reason:'Approved for remediation workflow'}
    ],
    priority:priorityFor(f.severity),
    targetSla:slaFor(f.severity)
  };
});

export const attackChains = [
  {id:'CHAIN-001',name:'Customer Data Access Chain',risk:'EXTREME',entry:'Authenticated customer account',steps:['SEC-011 Weak Password Policy','SEC-003 Weak Account Lockout Controls','SEC-001 Broken Object-Level Authorization'],target:'Customer account/profile data',impact:'Scaled cross-account data exposure if identity compromise and authorization weakness are combined.',conditions:'Valid or compromised customer identity; reachable API; predictable or obtained object references.'},
  {id:'CHAIN-002',name:'Administrative Capability Abuse',risk:'HIGH',entry:'Lower-privileged operations identity',steps:['SEC-012 Authorization Schema Bypass','SEC-008 Unrestricted File Type Upload'],target:'Administrative workflow / content-processing boundary',impact:'Expansion from authorization weakness into unsafe administrative content handling.',conditions:'Reachable alternate admin route and relevant workflow permission.'},
  {id:'CHAIN-003',name:'Server-Side Trust Boundary Pivot',risk:'HIGH',entry:'Authenticated integration feature',steps:['SEC-014 Server-Side Request Forgery','SEC-005 Weak TLS Configuration'],target:'Internal service / integration trust boundary',impact:'Increased ability to interact with unintended destinations; downstream impact depends on network egress and service authentication.',conditions:'Reachable preview feature and permissive destination/egress policy.'}
];

export const systemicRootCauses = [
  {id:'SRC-001',name:'Decentralized Authorization Enforcement',findings:['SEC-001','SEC-012'],layer:'API / Routing / Service',severity:'Critical',change:'Adopt centralized deny-by-default policy enforcement and mandatory object/action authorization tests.'},
  {id:'SRC-002',name:'Inconsistent Security Policy Across Components',findings:['SEC-005','SEC-009','SEC-010','SEC-013'],layer:'Edge / Platform / Session',severity:'High',change:'Move transport, header, method and cookie baselines into centrally managed platform policy with continuous conformance checks.'},
  {id:'SRC-003',name:'Unsafe Input / Content Boundary Handling',findings:['SEC-002','SEC-006','SEC-008','SEC-014'],layer:'Application / API Input',severity:'Critical',change:'Standardize typed input handling, contextual output encoding, safe query construction, URL destination controls and upload isolation.'},
  {id:'SRC-004',name:'Identity Abuse Resistance Gaps',findings:['SEC-003','SEC-011'],layer:'Identity',severity:'High',change:'Centralize credential policy, adaptive throttling, abuse telemetry and recovery controls.'}
];

export const remediationRoadmap = [
  {phase:'P0 — Emergency',window:'24–72 hours',focus:'Critical exploit paths / exposure reduction',items:['SEC-001','SEC-002'],owner:'Application & API Engineering',exit:'Immediate mitigation deployed and permanent fix in controlled validation.'},
  {phase:'P1 — High',window:'7 days',focus:'High-severity findings and attack-chain breakers',items:['SEC-003','SEC-004','SEC-006','SEC-008','SEC-012','SEC-014'],owner:'Product Security + Service Owners',exit:'Fix merged, security regression tests passing, ready for independent retest.'},
  {phase:'P2 — Platform',window:'30 days',focus:'Medium findings and centralized policy gaps',items:['SEC-005','SEC-007','SEC-009','SEC-010','SEC-011','SEC-013'],owner:'Platform / IAM / Web Engineering',exit:'Baseline policy centrally enforced and verified across all assets.'},
  {phase:'Strategic',window:'30–90 days',focus:'Systemic root causes and SDLC controls',items:['SRC-001','SRC-002','SRC-003','SRC-004'],owner:'Architecture + Security Engineering',exit:'Control owners, automated verification, telemetry and governance integrated into delivery lifecycle.'}
];

export const limitations = [
  'Assessment results apply to the specific versions, environment, roles, configuration, scope and time window documented in this report.',
  'Time-bounded testing cannot establish the absence of all vulnerabilities; a PASS verdict means no failure was observed under the recorded test conditions.',
  'Denial-of-service, destructive testing, production customer-data access and out-of-scope third-party systems were not tested.',
  'Automated tools were used as aids; findings shown as confirmed require analyst validation in this demonstration model.',
  'Business impact estimates are contextual engineering judgments and should be reconciled with formal enterprise risk processes.',
  'Static demo hashes and identities are illustrative; production evidence hashes must be calculated from immutable evidence bytes and protected by access control.'
];

export const assumptions = [
  'The pre-production build is representative of the intended production security architecture for tested components.',
  'Supplied test roles and permissions accurately represent the documented authorization model.',
  'Synthetic data faithfully exercises security-sensitive workflows without exposing real customer information.',
  'Network and edge controls present during testing are representative of the target deployment unless stated otherwise.'
];

export const assuranceStatement = 'Within the defined scope, Rules of Engagement, environment, test window and documented limitations, the laboratory executed the recorded verification activities and preserved traceable evidence for the conclusions presented. Absence of an observed finding is not proof that no vulnerability exists outside the tested conditions.';

export const authorizationCoverage = [
  {role:'Anonymous',GET:'Tested',POST:'Tested',PUT:'N/A',DELETE:'N/A',objectSwap:'N/A',roleBypass:'N/A',directAccess:'Tested'},
  {role:'Customer',GET:'Tested',POST:'Tested',PUT:'Tested',DELETE:'Tested',objectSwap:'Tested',roleBypass:'Tested',directAccess:'Tested'},
  {role:'Support Operator',GET:'Tested',POST:'Tested',PUT:'Tested',DELETE:'Limited',objectSwap:'Tested',roleBypass:'Tested',directAccess:'Tested'},
  {role:'Operations Manager',GET:'Tested',POST:'Tested',PUT:'Tested',DELETE:'Tested',objectSwap:'Tested',roleBypass:'Tested',directAccess:'Tested'},
  {role:'Administrator',GET:'Tested',POST:'Tested',PUT:'Tested',DELETE:'Tested',objectSwap:'Tested',roleBypass:'N/A',directAccess:'Tested'}
];

export const evidenceIndex = wstgItems.flatMap(test => test.pocs.flatMap(poc => poc.evidence.map(e=>({
  ...e,
  wstgId:test.id,
  pocId:poc.id,
  findingId:test.findingId || '—',
  asset:test.asset,
  verdict:test.verdict
}))));

export const testCaseRegister = wstgItems.map(t=>({
  testId:t.id,
  versionedId:t.versionedId,
  category:t.categoryName,
  title:t.title,
  objective:t.objective,
  applicable:t.applicable,
  asset:t.asset,
  tester:t.tester,
  reviewer:t.reviewer,
  date:t.executionDate,
  verdict:t.verdict,
  pocs:t.pocCount,
  evidence:t.evidenceCount,
  finding:t.findingId || '—',
  limitation:t.limitations
}));

export const glossary = [
  ['Assessment','Authorized, scoped security verification activity documented by this report.'],
  ['Finding','Evidence-backed security weakness record requiring engineering or risk disposition.'],
  ['PoC','A recorded proof/verification execution demonstrating or testing a security hypothesis.'],
  ['Evidence','Traceable artifact supporting a test observation or conclusion.'],
  ['Technical Severity','Vulnerability severity characteristics recorded separately from organizational risk.'],
  ['Organizational Risk','Contextual risk considering business impact, likelihood, asset criticality, controls and threat context.'],
  ['Residual Risk','Risk remaining after remediation or compensating controls.'],
  ['PASS','No failure observed under the documented test conditions; not a statement of absolute security.'],
  ['N/A','The test objective does not apply to the scoped technology or functionality.']
];

export const dataDictionary = [
  ['Finding ID','String','Required','Stable unique identifier for the engineering finding.'],
  ['Security Requirement','Text/Reference','Required','Property the system is expected to enforce.'],
  ['Observation','Text','Required','Directly observed behavior, separated from interpretation.'],
  ['Evidence IDs','Reference[]','Required','Traceable supporting artifacts.'],
  ['CWE','Reference','Required','Weakness classification when applicable.'],
  ['CVSS Vector','String','Required','Full technical severity vector, not score alone.'],
  ['Organizational Risk','Object','Required','Contextual likelihood/impact/control record.'],
  ['Root Cause','Object','Required','Causal engineering analysis and affected layer.'],
  ['Verification Criteria','Text[]','Required','Explicit tests required to establish remediation closure.'],
  ['Retest Record','Object','Conditional','Closure evidence after remediation.'],
  ['Residual Risk','Object','Conditional','Risk remaining after remediation/controls.'],
  ['Risk Acceptance','Object','Conditional','Owner, rationale, approval and expiration when risk is accepted.'],
  ['Audit Trail','Event[]','Required','Immutable history of material finding-state changes.']
];

export const reportAuditTrail = [
  {time:'2026-08-03 09:00',actor:'Assessment Coordinator',event:'Assessment authorized and scope frozen'},
  {time:'2026-08-14 18:30',actor:'Lead Assessor',event:'Primary WSTG execution window completed'},
  {time:'2026-08-15 16:00',actor:'Technical Review Team',event:'Critical/High findings independently reviewed'},
  {time:'2026-08-16 09:30',actor:'Security Technical Manager',event:'Final report approved for release'}
];

export const exportBundle = {
  reportMeta,
  documentControl,
  assessmentContext,
  objectives,
  assets,
  scope,
  rulesOfEngagement,
  stopConditions,
  methodology,
  scientificPrinciples,
  standards,
  tools,
  riskMethodology,
  categories,
  wstgItems,
  testCaseRegister,
  evidenceIndex,
  findings,
  attackChains,
  systemicRootCauses,
  remediationRoadmap,
  authorizationCoverage,
  limitations,
  assumptions,
  assuranceStatement,
  glossary,
  dataDictionary,
  reportAuditTrail
};
