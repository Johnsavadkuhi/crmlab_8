const categoryDefinitions = [
  ['INFO','Information Gathering', [
    'Conduct Search Engine Discovery Reconnaissance for Information Leakage','Fingerprint Web Server','Review Webserver Metafiles for Information Leakage','Enumerate Applications on Webserver','Review Webpage Content for Information Leakage','Identify Application Entry Points','Map Execution Paths Through Application','Fingerprint Web Application Framework','Fingerprint Web Application','Map Application Architecture']],
  ['CONF','Configuration and Deployment Management Testing', [
    'Test Network Infrastructure Configuration','Test Application Platform Configuration','Test File Extensions Handling for Sensitive Information','Review Old Backup and Unreferenced Files for Sensitive Information','Enumerate Infrastructure and Application Admin Interfaces','Test HTTP Methods','Test HTTP Strict Transport Security','Test RIA Cross Domain Policy','Test File Permission','Test for Subdomain Takeover','Test Cloud Storage']],
  ['IDNT','Identity Management Testing', [
    'Test Role Definitions','Test User Registration Process','Test Account Provisioning Process','Testing for Account Enumeration and Guessable User Account','Testing for Weak or Unenforced Username Policy']],
  ['ATHN','Authentication Testing', [
    'Testing for Credentials Transported over an Encrypted Channel','Testing for Default Credentials','Testing for Weak Lock Out Mechanism','Testing for Bypassing Authentication Schema','Testing for Vulnerable Remember Password','Testing for Browser Cache Weaknesses','Testing for Weak Password Policy','Testing for Weak Security Question Answer','Testing for Weak Password Change or Reset Functionalities','Testing for Weaker Authentication in Alternative Channel']],
  ['ATHZ','Authorization Testing', [
    'Testing Directory Traversal File Include','Testing for Bypassing Authorization Schema','Testing for Privilege Escalation','Testing for Insecure Direct Object References']],
  ['SESS','Session Management Testing', [
    'Testing for Session Management Schema','Testing for Cookies Attributes','Testing for Session Fixation','Testing for Exposed Session Variables','Testing for Cross Site Request Forgery','Testing for Logout Functionality','Testing Session Timeout','Testing for Session Puzzling','Testing for Session Hijacking']],
  ['INPV','Input Validation Testing', [
    'Testing for Reflected Cross Site Scripting','Testing for Stored Cross Site Scripting','Testing for HTTP Verb Tampering','Testing for HTTP Parameter Pollution','Testing for SQL Injection','Testing for LDAP Injection','Testing for XML Injection','Testing for SSI Injection','Testing for XPath Injection','Testing for IMAP SMTP Injection','Testing for Code Injection','Testing for Command Injection','Testing for Format String Injection','Testing for Incubated Vulnerability','Testing for HTTP Splitting Smuggling','Testing for HTTP Incoming Requests','Testing for Host Header Injection','Testing for Server-side Template Injection','Testing for Server-Side Request Forgery']],
  ['ERRH','Testing for Error Handling', ['Testing for Improper Error Handling','Testing for Stack Traces']],
  ['CRYP','Testing for Weak Cryptography', ['Testing for Weak Transport Layer Security','Testing for Padding Oracle','Testing for Sensitive Information Sent via Unencrypted Channels','Testing for Weak Encryption']],
  ['BUSL','Business Logic Testing', ['Test Business Logic Data Validation','Test Ability to Forge Requests','Test Integrity Checks','Test for Process Timing','Test Number of Times a Function Can Be Used Limits','Testing for the Circumvention of Work Flows','Test Defenses Against Application Misuse','Test Upload of Unexpected File Types','Test Upload of Malicious Files']],
  ['CLNT','Client-side Testing', ['Testing for DOM-Based Cross Site Scripting','Testing for JavaScript Execution','Testing for HTML Injection','Testing for Client-side URL Redirect','Testing for CSS Injection','Testing for Client-side Resource Manipulation','Testing Cross Origin Resource Sharing','Testing for Cross Site Flashing','Testing for Clickjacking','Testing WebSockets','Testing Web Messaging','Testing Browser Storage','Testing for Cross Site Script Inclusion']]
];

export const categories = categoryDefinitions.map(([code,name,items])=>({code,name,count:items.length}));

export const reportMeta = {
  title: 'Security Engineering Assessment Report',
  project: 'Aurora Digital Banking Platform',
  assessmentId: 'ASM-2026-041',
  reportId: 'SER-2026-041',
  version: '1.0',
  classification: 'CONFIDENTIAL',
  startDate: '2026-08-03',
  endDate: '2026-08-14',
  preparedBy: 'Application Security Laboratory',
  reviewedBy: 'Security Technical Manager'
};

const failing = new Set(['CONF-06','CONF-07','ATHN-03','ATHN-07','ATHZ-02','ATHZ-04','SESS-02','SESS-05','INPV-01','INPV-05','INPV-19','CRYP-01','BUSL-08','CLNT-09']);
const partial = new Set(['INFO-04','IDNT-03','ATHN-10','SESS-09','INPV-16','BUSL-04']);
const na = new Set(['CONF-08','CLNT-08']);

const findingMap = {
  'ATHZ-04':'SEC-001','INPV-05':'SEC-002','ATHN-03':'SEC-003','SESS-05':'SEC-004','CRYP-01':'SEC-005',
  'INPV-01':'SEC-006','CLNT-09':'SEC-007','BUSL-08':'SEC-008','CONF-06':'SEC-009','CONF-07':'SEC-010',
  'ATHN-07':'SEC-011','ATHZ-02':'SEC-012','SESS-02':'SEC-013','INPV-19':'SEC-014'
};

const assets = ['WEB-001','API-001','AUTH-001','ADMIN-001'];
const dateFor = i => `2026-08-${String(4 + (i%10)).padStart(2,'0')}`;
const hash = seed => Array.from({length:64},(_,i)=>'abcdef0123456789'[(seed*7+i*3)%16]).join('');

function objectiveFor(title){
  return `Verify that the application securely handles ${title.toLowerCase().replace(/^testing for |^test /,'')} within the defined assessment scope.`;
}

function makePoc(item, index, verdict){
  const safePath = `/demo/${item.category.toLowerCase()}/${String(index+1).padStart(2,'0')}`;
  const expected = verdict==='N/A' ? 'The test is not applicable to the assessed functionality.' : 'The application should enforce the expected security control and reject unauthorized or malformed behavior.';
  const actual = verdict==='FAIL' ? 'The expected security control was not consistently enforced under the tested condition.' : verdict==='PARTIAL' ? 'The control was present, but coverage or behavior was inconsistent in one constrained scenario.' : verdict==='N/A' ? 'No applicable feature or execution path was present in scope.' : 'No control bypass or vulnerable behavior was observed under the tested conditions.';
  return {
    id:`POC-${item.category}-${String(index+1).padStart(3,'0')}`,
    hypothesis:`The assessed application should satisfy the security property represented by ${item.id} for the selected asset and user context.`,
    preconditions:'Authorized test account; assessment environment; in-scope asset; non-destructive test conditions.',
    expected,
    actual,
    confidence: verdict==='FAIL' ? 'CONFIRMED' : verdict==='PARTIAL' ? 'MODERATE' : 'HIGH',
    reproduction: verdict==='FAIL' ? '3/3' : '1/1',
    request:`GET ${safePath} HTTP/1.1\nHost: test.aurora.local\nAuthorization: Bearer [REDACTED]\nX-Assessment-ID: ASM-2026-041`,
    response: verdict==='FAIL' ? 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"result":"unexpected security-relevant behavior observed"}' : verdict==='N/A' ? 'NOT EXECUTED — NOT APPLICABLE' : 'HTTP/1.1 403 Forbidden\nContent-Type: application/json\n\n{"result":"control enforced in tested scenario"}',
    evidence:[
      {id:`EVD-${String(index+1).padStart(4,'0')}-REQ`,type:'HTTP Transaction',sha256:hash(index+1)},
      {id:`EVD-${String(index+1).padStart(4,'0')}-IMG`,type:'Screenshot',sha256:hash(index+101)}
    ]
  };
}

let globalIndex=0;
export const wstgItems = categoryDefinitions.flatMap(([category, categoryName, titles]) => titles.map((title, idx) => {
  globalIndex += 1;
  const short = `${category}-${String(idx+1).padStart(2,'0')}`;
  const verdict = na.has(short) ? 'N/A' : failing.has(short) ? 'FAIL' : partial.has(short) ? 'PARTIAL' : 'PASS';
  const base = {
    id:`WSTG-${short}`,
    category,
    categoryName,
    title,
    objective: objectiveFor(title),
    asset: assets[(globalIndex + idx)%assets.length],
    tester:`PT-${String(11 + (globalIndex%5)).padStart(3,'0')}`,
    executionDate:dateFor(globalIndex),
    verdict,
    findingId:findingMap[short] || null
  };
  return {...base,poc:makePoc(base,globalIndex-1,verdict)};
}));

export const findings = [
  {id:'SEC-001',title:'Broken Object-Level Authorization',severity:'Critical',cvssScore:'9.3',cwe:'CWE-639',wstg:'WSTG-ATHZ-04',asset:'API-001',endpoint:'/api/v1/customers/{id}',status:'Open',confidence:'Confirmed',observation:'A low-privileged customer account could retrieve another customer profile after changing the object identifier.',rootCause:'Server-side object ownership was not enforced before resource retrieval.',businessImpact:'Potential cross-account exposure of customer personal information and regulated data.',remediation:'Enforce centralized object-level authorization on every resource access and deny by default.',verification:'Customer A cannot read or modify Customer B resources through any direct or alternate endpoint.',cvssVector:'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:L/VA:N/SC:H/SI:N/SA:N'},
  {id:'SEC-002',title:'SQL Injection in Reporting Filter',severity:'Critical',cvssScore:'9.1',cwe:'CWE-89',wstg:'WSTG-INPV-05',asset:'API-001',endpoint:'/api/v1/reports/search',status:'Open',confidence:'Confirmed',observation:'A report filter parameter influenced a backend SQL statement in a manner inconsistent with parameterized query handling.',rootCause:'Dynamic query construction mixed untrusted input with SQL syntax.',businessImpact:'Potential unauthorized access to sensitive application data and database functions.',remediation:'Use parameterized queries, typed query builders, least-privilege database accounts and regression tests.',verification:'All report filters remain functional while crafted metacharacters are treated strictly as data.',cvssVector:'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:H/VA:L/SC:N/SI:N/SA:N'},
  {id:'SEC-003',title:'Weak Account Lockout Controls',severity:'High',cvssScore:'7.1',cwe:'CWE-307',wstg:'WSTG-ATHN-03',asset:'AUTH-001',endpoint:'/auth/login',status:'Open',confidence:'Confirmed',observation:'Repeated failed authentication attempts were not sufficiently throttled for the tested account.',rootCause:'Rate limiting and adaptive abuse controls were not consistently applied at the authentication boundary.',businessImpact:'Increased feasibility of password guessing and credential-stuffing attacks.',remediation:'Implement adaptive throttling, abuse telemetry, progressive delay and protected recovery paths.',verification:'Automated repeated failures trigger effective throttling without enabling trivial denial of service against users.',cvssVector:'CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N'},
  {id:'SEC-004',title:'Cross-Site Request Forgery on Profile Change',severity:'High',cvssScore:'7.4',cwe:'CWE-352',wstg:'WSTG-SESS-05',asset:'WEB-001',endpoint:'/account/profile',status:'Open',confidence:'Confirmed',observation:'A state-changing profile operation lacked a robust anti-CSRF validation mechanism in the tested flow.',rootCause:'State-changing request accepted ambient session credentials without validating request origin or anti-CSRF token.',businessImpact:'An authenticated user could be induced to perform unintended account changes.',remediation:'Apply framework-native anti-CSRF controls, SameSite cookie policy and origin validation where appropriate.',verification:'Cross-origin state-changing requests fail while legitimate first-party operations remain functional.',cvssVector:'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:A/VC:N/VI:H/VA:N/SC:N/SI:N/SA:N'},
  {id:'SEC-005',title:'Weak TLS Configuration',severity:'Medium',cvssScore:'5.8',cwe:'CWE-326',wstg:'WSTG-CRYP-01',asset:'WEB-001',endpoint:'TLS listener',status:'Open',confidence:'Confirmed',observation:'The public TLS endpoint accepted configuration choices below the organization target baseline.',rootCause:'Transport security baseline was not centrally enforced across edge services.',businessImpact:'Reduced confidentiality assurance and increased exposure to transport-layer downgrade or cryptographic weakness scenarios.',remediation:'Adopt a centrally managed TLS baseline and continuously validate certificates, protocols and cipher configuration.',verification:'Only approved protocol versions and cipher suites are accepted across all in-scope endpoints.',cvssVector:'CVSS:4.0/AV:N/AC:H/AT:P/PR:N/UI:N/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N'},
  {id:'SEC-006',title:'Reflected Cross-Site Scripting',severity:'High',cvssScore:'7.0',cwe:'CWE-79',wstg:'WSTG-INPV-01',asset:'WEB-001',endpoint:'/search?q=',status:'Open',confidence:'Confirmed',observation:'A reflected search value reached an HTML response context without the expected output encoding.',rootCause:'Context-aware output encoding was not consistently applied.',businessImpact:'Potential execution of attacker-controlled browser script in a victim session.',remediation:'Apply context-aware encoding and safe templating; validate CSP as defense in depth.',verification:'Untrusted values are rendered as inert text in all output contexts.',cvssVector:'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:A/VC:L/VI:L/VA:N/SC:L/SI:L/SA:N'},
  {id:'SEC-007',title:'Missing Clickjacking Protection',severity:'Medium',cvssScore:'5.1',cwe:'CWE-1021',wstg:'WSTG-CLNT-09',asset:'WEB-001',endpoint:'/payments/confirm',status:'Open',confidence:'Confirmed',observation:'A sensitive workflow could be framed by an external origin in the tested browser configuration.',rootCause:'Frame-ancestor restrictions were absent on sensitive application pages.',businessImpact:'Users could be tricked into interacting with hidden or disguised controls.',remediation:'Set CSP frame-ancestors and compatible frame protection headers.',verification:'Sensitive application pages cannot be embedded by unauthorized origins.',cvssVector:'CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N'},
  {id:'SEC-008',title:'Unrestricted File Type Upload',severity:'High',cvssScore:'8.1',cwe:'CWE-434',wstg:'WSTG-BUSL-08',asset:'WEB-001',endpoint:'/support/attachments',status:'Open',confidence:'Confirmed',observation:'The attachment workflow accepted file categories outside the documented business requirement.',rootCause:'File validation relied on insufficient client-controlled metadata and extension checks.',businessImpact:'Potential storage or delivery of unsafe content and expansion of application attack surface.',remediation:'Allowlist required file formats; validate content server-side; isolate storage and delivery domains.',verification:'Only approved formats are accepted and uploaded content cannot execute in application origin.',cvssVector:'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:L/VI:H/VA:L/SC:L/SI:L/SA:N'},
  {id:'SEC-009',title:'Unsafe HTTP Method Exposure',severity:'Medium',cvssScore:'5.4',cwe:'CWE-749',wstg:'WSTG-CONF-06',asset:'WEB-001',endpoint:'Web server',status:'Open',confidence:'Confirmed',observation:'Methods not required by the application were exposed by the web tier.',rootCause:'HTTP method policy was not minimized at the edge and application layers.',businessImpact:'Unnecessary protocol surface can enable unexpected application behavior or future misconfiguration abuse.',remediation:'Restrict methods to the explicit application allowlist at every relevant layer.',verification:'Unapproved methods return a consistent rejection response.',cvssVector:'CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N'},
  {id:'SEC-010',title:'Incomplete HSTS Policy',severity:'Medium',cvssScore:'4.8',cwe:'CWE-319',wstg:'WSTG-CONF-07',asset:'WEB-001',endpoint:'HTTPS response headers',status:'Open',confidence:'Confirmed',observation:'Strict-Transport-Security policy did not match the approved production transport baseline.',rootCause:'Security headers were configured independently across delivery tiers.',businessImpact:'Users may receive weaker transport downgrade protection than intended.',remediation:'Centralize HSTS policy with appropriate max-age and subdomain strategy.',verification:'All intended production hosts return the approved HSTS policy over HTTPS.',cvssVector:'CVSS:4.0/AV:A/AC:H/AT:P/PR:N/UI:P/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N'},
  {id:'SEC-011',title:'Weak Password Policy',severity:'Medium',cvssScore:'5.6',cwe:'CWE-521',wstg:'WSTG-ATHN-07',asset:'AUTH-001',endpoint:'/account/password',status:'Open',confidence:'Confirmed',observation:'The tested password policy permitted weak choices that did not meet the organization credential standard.',rootCause:'Credential policy controls were not aligned with centralized identity requirements.',businessImpact:'Increased likelihood of successful credential guessing and account compromise.',remediation:'Adopt organization password policy, breached-password checks and MFA risk controls.',verification:'Weak and known-compromised password choices are rejected consistently across all password-setting flows.',cvssVector:'CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N'},
  {id:'SEC-012',title:'Authorization Schema Bypass on Admin Route',severity:'High',cvssScore:'8.6',cwe:'CWE-285',wstg:'WSTG-ATHZ-02',asset:'ADMIN-001',endpoint:'/admin/export',status:'Open',confidence:'Confirmed',observation:'An alternate request path reached an administrative operation without the expected authorization decision.',rootCause:'Authorization enforcement differed between routing layers.',businessImpact:'Potential access to administrative capabilities by lower-privileged users.',remediation:'Enforce authorization in the authoritative backend service and use deny-by-default policy.',verification:'All routes, aliases and methods enforce the same role and permission requirements.',cvssVector:'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:H/VA:L/SC:N/SI:N/SA:N'},
  {id:'SEC-013',title:'Session Cookie Attribute Weakness',severity:'Medium',cvssScore:'5.3',cwe:'CWE-614',wstg:'WSTG-SESS-02',asset:'AUTH-001',endpoint:'Session cookie',status:'Open',confidence:'Confirmed',observation:'A session cookie did not consistently carry the complete set of organization-required security attributes.',rootCause:'Cookie policy was configured per component instead of through a centralized session policy.',businessImpact:'Reduced browser-side session protection in selected request contexts.',remediation:'Standardize Secure, HttpOnly and appropriate SameSite attributes for all authentication cookies.',verification:'All authentication and session cookies expose the approved attributes in every login and refresh flow.',cvssVector:'CVSS:4.0/AV:N/AC:H/AT:P/PR:N/UI:P/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N'},
  {id:'SEC-014',title:'Server-Side Request Forgery',severity:'High',cvssScore:'8.2',cwe:'CWE-918',wstg:'WSTG-INPV-19',asset:'API-001',endpoint:'/api/v1/integrations/preview',status:'Open',confidence:'Confirmed',observation:'A server-side integration preview feature could be induced to initiate requests beyond the intended destination allowlist.',rootCause:'Server-side URL handling lacked strict destination validation and egress restrictions.',businessImpact:'Potential interaction with internal network services or cloud metadata endpoints depending on environment controls.',remediation:'Use strict destination allowlists, canonical URL parsing, network egress controls and protected metadata services.',verification:'Requests to unapproved schemes, hosts, IP ranges and redirect destinations are blocked before network access.',cvssVector:'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:L/VA:L/SC:H/SI:L/SA:N'}
];
