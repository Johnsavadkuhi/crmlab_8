export type ReportLocale = "en" | "fa";
export type ReportText = { en: string; fa: string };

export const tx = (value: ReportText, locale: ReportLocale) => value[locale];

const categories = [
  ["INFO", "Information Gathering", "جمع‌آوری اطلاعات", [
    ["Conduct Search Engine Discovery Reconnaissance for Information Leakage", "بررسی موتورهای جست‌وجو برای کشف نشت اطلاعات"],
    ["Fingerprint Web Server", "شناسایی و اثرانگشت‌برداری وب‌سرور"],
    ["Review Webserver Metafiles for Information Leakage", "بررسی فایل‌های متادیتای وب‌سرور برای نشت اطلاعات"],
    ["Enumerate Applications on Webserver", "شمارش و شناسایی برنامه‌های روی وب‌سرور"],
    ["Review Webpage Content for Information Leakage", "بررسی محتوای صفحات برای نشت اطلاعات"],
    ["Identify Application Entry Points", "شناسایی نقاط ورود برنامه"],
    ["Map Execution Paths Through Application", "ترسیم مسیرهای اجرای برنامه"],
    ["Fingerprint Web Application Framework", "شناسایی فریم‌ورک برنامه وب"],
    ["Fingerprint Web Application", "اثر انگشت برنامه وب"],
    ["Map Application Architecture", "ترسیم معماری برنامه"],
  ]],
  ["CONF", "Configuration and Deployment Management Testing", "آزمون پیکربندی و مدیریت استقرار", [
    ["Test Network Infrastructure Configuration", "آزمون پیکربندی زیرساخت شبکه"],
    ["Test Application Platform Configuration", "آزمون پیکربندی پلتفرم برنامه"],
    ["Test File Extensions Handling for Sensitive Information", "آزمون مدیریت پسوند فایل‌های حساس"],
    ["Review Old Backup and Unreferenced Files for Sensitive Information", "بررسی فایل‌های قدیمی، پشتیبان و بدون ارجاع برای اطلاعات حساس"],
    ["Enumerate Infrastructure and Application Admin Interfaces", "شناسایی رابط‌های مدیریتی زیرساخت و برنامه"],
    ["Test HTTP Methods", "آزمون متدهای HTTP"],
    ["Test HTTP Strict Transport Security", "آزمون HSTS"],
    ["Test RIA Cross Domain Policy", "آزمون سیاست Cross-Domain در RIA"],
    ["Test File Permission", "آزمون مجوزهای فایل"],
    ["Test for Subdomain Takeover", "آزمون تصاحب زیردامنه"],
    ["Test Cloud Storage", "آزمون فضای ذخیره‌سازی ابری"],
  ]],
  ["IDNT", "Identity Management Testing", "آزمون مدیریت هویت", [
    ["Test Role Definitions", "آزمون تعریف نقش‌ها"],
    ["Test User Registration Process", "آزمون فرایند ثبت‌نام کاربر"],
    ["Test Account Provisioning Process", "آزمون فرایند ایجاد و تخصیص حساب"],
    ["Testing for Account Enumeration and Guessable User Account", "آزمون شمارش حساب و حساب‌های قابل حدس"],
    ["Testing for Weak or Unenforced Username Policy", "آزمون سیاست ضعیف یا اعمال‌نشده نام کاربری"],
  ]],
  ["ATHN", "Authentication Testing", "آزمون احراز هویت", [
    ["Testing for Credentials Transported over an Encrypted Channel", "آزمون انتقال اعتبارنامه روی کانال رمزنگاری‌شده"],
    ["Testing for Default Credentials", "آزمون اعتبارنامه‌های پیش‌فرض"],
    ["Testing for Weak Lock Out Mechanism", "آزمون مکانیزم ضعیف قفل حساب"],
    ["Testing for Bypassing Authentication Schema", "آزمون دور زدن سازوکار احراز هویت"],
    ["Testing for Vulnerable Remember Password", "آزمون قابلیت آسیب‌پذیر یادآوری رمز عبور"],
    ["Testing for Browser Cache Weaknesses", "آزمون ضعف‌های کش مرورگر"],
    ["Testing for Weak Password Policy", "آزمون سیاست ضعیف رمز عبور"],
    ["Testing for Weak Security Question Answer", "آزمون پرسش و پاسخ امنیتی ضعیف"],
    ["Testing for Weak Password Change or Reset Functionalities", "آزمون ضعف در تغییر یا بازیابی رمز عبور"],
    ["Testing for Weaker Authentication in Alternative Channel", "آزمون احراز هویت ضعیف‌تر در کانال جایگزین"],
  ]],
  ["ATHZ", "Authorization Testing", "آزمون مجوزدهی", [
    ["Testing Directory Traversal File Include", "آزمون پیمایش دایرکتوری و File Include"],
    ["Testing for Bypassing Authorization Schema", "آزمون دور زدن سازوکار مجوزدهی"],
    ["Testing for Privilege Escalation", "آزمون ارتقای سطح دسترسی"],
    ["Testing for Insecure Direct Object References", "آزمون ارجاع مستقیم ناامن به شیء (IDOR)"],
  ]],
  ["SESS", "Session Management Testing", "آزمون مدیریت نشست", [
    ["Testing for Session Management Schema", "آزمون سازوکار مدیریت نشست"],
    ["Testing for Cookies Attributes", "آزمون ویژگی‌های Cookie"],
    ["Testing for Session Fixation", "آزمون Session Fixation"],
    ["Testing for Exposed Session Variables", "آزمون متغیرهای نشست افشاشده"],
    ["Testing for Cross Site Request Forgery", "آزمون CSRF"],
    ["Testing for Logout Functionality", "آزمون عملکرد خروج از حساب"],
    ["Testing Session Timeout", "آزمون Timeout نشست"],
    ["Testing for Session Puzzling", "آزمون Session Puzzling"],
    ["Testing for Session Hijacking", "آزمون ربایش نشست"],
  ]],
  ["INPV", "Input Validation Testing", "آزمون اعتبارسنجی ورودی", [
    ["Testing for Reflected Cross Site Scripting", "آزمون XSS بازتابی"],
    ["Testing for Stored Cross Site Scripting", "آزمون XSS ذخیره‌شده"],
    ["Testing for HTTP Verb Tampering", "آزمون دستکاری Verbهای HTTP"],
    ["Testing for HTTP Parameter Pollution", "آزمون HTTP Parameter Pollution"],
    ["Testing for SQL Injection", "آزمون SQL Injection"],
    ["Testing for LDAP Injection", "آزمون LDAP Injection"],
    ["Testing for XML Injection", "آزمون XML Injection"],
    ["Testing for SSI Injection", "آزمون SSI Injection"],
    ["Testing for XPath Injection", "آزمون XPath Injection"],
    ["Testing for IMAP SMTP Injection", "آزمون IMAP/SMTP Injection"],
    ["Testing for Code Injection", "آزمون تزریق کد"],
    ["Testing for Command Injection", "آزمون Command Injection"],
    ["Testing for Format String Injection", "آزمون Format String Injection"],
    ["Testing for Incubated Vulnerability", "آزمون آسیب‌پذیری‌های نهفته"],
    ["Testing for HTTP Splitting Smuggling", "آزمون HTTP Splitting/Smuggling"],
    ["Testing for HTTP Incoming Requests", "آزمون درخواست‌های ورودی HTTP"],
    ["Testing for Host Header Injection", "آزمون Host Header Injection"],
    ["Testing for Server-side Template Injection", "آزمون Server-Side Template Injection"],
    ["Testing for Server-Side Request Forgery", "آزمون SSRF"],
  ]],
  ["ERRH", "Testing for Error Handling", "آزمون مدیریت خطا", [
    ["Testing for Improper Error Handling", "آزمون مدیریت نامناسب خطا"],
    ["Testing for Stack Traces", "آزمون افشای Stack Trace"],
  ]],
  ["CRYP", "Testing for Weak Cryptography", "آزمون رمزنگاری ضعیف", [
    ["Testing for Weak Transport Layer Security", "آزمون ضعف TLS"],
    ["Testing for Padding Oracle", "آزمون Padding Oracle"],
    ["Testing for Sensitive Information Sent via Unencrypted Channels", "آزمون ارسال اطلاعات حساس در کانال رمزنگاری‌نشده"],
    ["Testing for Weak Encryption", "آزمون رمزنگاری ضعیف"],
  ]],
  ["BUSL", "Business Logic Testing", "آزمون منطق کسب‌وکار", [
    ["Test Business Logic Data Validation", "آزمون اعتبارسنجی داده در منطق کسب‌وکار"],
    ["Test Ability to Forge Requests", "آزمون امکان جعل درخواست"],
    ["Test Integrity Checks", "آزمون کنترل‌های یکپارچگی"],
    ["Test for Process Timing", "آزمون زمان‌بندی فرایند"],
    ["Test Number of Times a Function Can Be Used Limits", "آزمون محدودیت دفعات استفاده از یک قابلیت"],
    ["Testing for the Circumvention of Work Flows", "آزمون دور زدن Workflow"],
    ["Test Defenses Against Application Misuse", "آزمون دفاع در برابر سوءاستفاده از برنامه"],
    ["Test Upload of Unexpected File Types", "آزمون بارگذاری نوع فایل غیرمنتظره"],
    ["Test Upload of Malicious Files", "آزمون بارگذاری فایل مخرب"],
  ]],
  ["CLNT", "Client-side Testing", "آزمون سمت کاربر", [
    ["Testing for DOM-Based Cross Site Scripting", "آزمون DOM-Based XSS"],
    ["Testing for JavaScript Execution", "آزمون اجرای JavaScript"],
    ["Testing for HTML Injection", "آزمون HTML Injection"],
    ["Testing for Client-side URL Redirect", "آزمون Redirect سمت کاربر"],
    ["Testing for CSS Injection", "آزمون CSS Injection"],
    ["Testing for Client-side Resource Manipulation", "آزمون دستکاری منابع سمت کاربر"],
    ["Testing Cross Origin Resource Sharing", "آزمون CORS"],
    ["Testing for Cross Site Flashing", "آزمون Cross Site Flashing"],
    ["Testing for Clickjacking", "آزمون Clickjacking"],
    ["Testing WebSockets", "آزمون WebSocket"],
    ["Testing Web Messaging", "آزمون Web Messaging"],
    ["Testing Browser Storage", "آزمون ذخیره‌سازی مرورگر"],
    ["Testing for Cross Site Script Inclusion", "آزمون Cross Site Script Inclusion"],
  ]],
] as const;

const fail = new Set(["CONF-06","CONF-07","ATHN-03","ATHN-07","ATHZ-02","ATHZ-04","SESS-02","SESS-05","INPV-01","INPV-05","INPV-19","CRYP-01","BUSL-08","CLNT-09"]);
const partial = new Set(["INFO-04","IDNT-03","ATHN-10","SESS-09","INPV-16","BUSL-04"]);
const na = new Set(["CONF-08","CLNT-08"]);
const findingMap: Record<string,string> = {
  "ATHZ-04":"SEC-001","INPV-05":"SEC-002","ATHN-03":"SEC-003","SESS-05":"SEC-004","CRYP-01":"SEC-005","INPV-01":"SEC-006","CLNT-09":"SEC-007","BUSL-08":"SEC-008","CONF-06":"SEC-009","CONF-07":"SEC-010","ATHN-07":"SEC-011","ATHZ-02":"SEC-012","SESS-02":"SEC-013","INPV-19":"SEC-014"
};

export type EvidenceRecord = { id:string; type:string; timestamp:string; sha256:string; collector:string; source:string; redaction:string };
export type PocRecord = { id:string; verdict:"PASS"|"FAIL"|"INCONCLUSIVE"; role:string; endpoint:string; hypothesis:ReportText; expected:ReportText; actual:ReportText; procedure:ReportText[]; request:string; response:string; confidence:string; reproduction:string; evidence:EvidenceRecord[]; findingId?:string };
export type WstgRecord = { id:string; versionedId:string; category:string; categoryName:ReportText; title:ReportText; applicable:boolean; verdict:"PASS"|"FAIL"|"PARTIAL"|"N/A"; findingId?:string; objective:ReportText; limitation:ReportText; pocs:PocRecord[] };

function digest(seed:number){ const h="0123456789abcdef"; return Array.from({length:64},(_,i)=>h[(seed*7+i*11)%16]).join(""); }
function evidence(id:string, seed:number, type:string):EvidenceRecord { return { id:`EVD-${id}-${type==='Request'?'REQ':'RES'}`, type, timestamp:`2026-08-${String(3+(seed%12)).padStart(2,'0')}T${String(9+(seed%8)).padStart(2,'0')}:20:00+04:00`, sha256:digest(seed), collector:`PT-${String(11+(seed%5)).padStart(3,'0')}`, source:"Security test harness / intercepting proxy", redaction:"Secrets redacted" }; }

let globalIndex=0;
export const wstgRecords:WstgRecord[] = categories.flatMap(([code,nameEn,nameFa,titles]) => titles.map(([titleEn,titleFa], localIndex)=>{
  const index=globalIndex++;
  const short=`${code}-${String(localIndex+1).padStart(2,'0')}`;
  const verdict:WstgRecord['verdict']=na.has(short)?"N/A":fail.has(short)?"FAIL":partial.has(short)?"PARTIAL":"PASS";
  const findingId=findingMap[short];
  const endpoint=code==="ATHN"?"/auth/login":code==="ATHZ"?"/api/v1/resources/{id}":code==="INPV"?"/api/v1/search":"/application/test-target";
  const pocs:PocRecord[]=verdict==="N/A"?[]:[0,1].map(variant=>{
    const pocId=`POC-${code}-${String(index+1).padStart(3,'0')}-${variant+1}`;
    const pocVerdict:PocRecord['verdict']=verdict==="FAIL"&&variant===0?"FAIL":verdict==="PARTIAL"&&variant===0?"INCONCLUSIVE":"PASS";
    return { id:pocId, verdict:pocVerdict, role: code==="ATHZ"?(["Customer","Operator"][variant]):code==="ATHN"?"Anonymous":"Authenticated user", endpoint, hypothesis:{en:`The application must satisfy ${short} under the ${variant===0?'primary':'alternate'} test condition.`,fa:`برنامه باید الزام ${short} را در شرایط آزمون ${variant===0?'اصلی':'جایگزین'} رعایت کند.`}, expected:{en:"The documented security property is enforced and unsafe behavior is rejected.",fa:"خاصیت امنیتی تعریف‌شده اعمال شود و رفتار ناامن رد شود."}, actual:pocVerdict==="FAIL"?{en:"The expected security property was violated and reproducible evidence was captured.",fa:"خاصیت امنیتی مورد انتظار نقض شد و شواهد قابل تکرار ثبت گردید."}:pocVerdict==="INCONCLUSIVE"?{en:"Evidence was insufficient for a defensible pass/fail conclusion.",fa:"شواهد برای نتیجه‌گیری قابل دفاع PASS/FAIL کافی نبود."}:{en:"No violation was observed under this specific recorded condition.",fa:"در این شرایط مشخص و ثبت‌شده نقضی مشاهده نشد."}, procedure:[{en:"Establish the authorized test context.",fa:"زمینه مجاز آزمون را ایجاد کنید."},{en:`Reach ${endpoint}.`,fa:`به مسیر ${endpoint} دسترسی پیدا کنید.`},{en:"Apply the controlled security mutation.",fa:"تغییر کنترل‌شده امنیتی را اعمال کنید."},{en:"Compare expected and actual behavior and capture evidence.",fa:"رفتار مورد انتظار و واقعی را مقایسه و شواهد را ثبت کنید."}], request:`${variant===0?'GET':'POST'} ${endpoint} HTTP/1.1\nHost: project-target.example\nAuthorization: Bearer [REDACTED]\nX-WSTG-Test: WSTG-v42-${short}`, response:pocVerdict==="FAIL"?`HTTP/1.1 200 OK\nX-Assessment-Result: SECURITY-PROPERTY-VIOLATED\nFinding: ${findingId}`:pocVerdict==="INCONCLUSIVE"?"HTTP/1.1 202 Accepted\nX-Assessment-Result: INCONCLUSIVE":"HTTP/1.1 403 Forbidden\nX-Assessment-Result: EXPECTED-CONTROL-OBSERVED", confidence:pocVerdict==="FAIL"?"CONFIRMED":pocVerdict==="INCONCLUSIVE"?"MODERATE":"HIGH", reproduction:pocVerdict==="FAIL"?"3/3":pocVerdict==="INCONCLUSIVE"?"1/2":"2/2", findingId:pocVerdict==="FAIL"?findingId:undefined, evidence:[evidence(pocId,index*2+variant,"Request"),evidence(pocId,index*2+variant+200,"Response")] };
  });
  return { id:`WSTG-${short}`,versionedId:`WSTG-v42-${short}`,category:code,categoryName:{en:nameEn,fa:nameFa},title:{en:titleEn,fa:titleFa},applicable:verdict!=="N/A",verdict,findingId,objective:{en:`Verify ${titleEn.toLowerCase()} for the authorized project scope.`,fa:`بررسی ${titleFa} در محدوده مجاز پروژه.`},limitation:verdict==="PARTIAL"?{en:"One alternate path remained inconclusive.",fa:"یک مسیر جایگزین بدون نتیجه قطعی باقی ماند."}:verdict==="N/A"?{en:"The required feature is not implemented in the assessed scope.",fa:"قابلیت مورد نیاز در محدوده ارزیابی پیاده‌سازی نشده است."}:{en:"No material limitation recorded for this test record.",fa:"محدودیت بااهمیتی برای این رکورد آزمون ثبت نشده است."},pocs };
}));

export const categorySummary = categories.map(([code,en,fa])=>({code,name:{en,fa}}));

export type Finding = {
  id:string; title:ReportText; severity:"Critical"|"High"|"Medium"; cvss:number; vector:string; risk:"Extreme"|"High"|"Moderate"; cwe:string; wstg:string; asset:string; endpoint:string; status:string; observation:ReportText; expected:ReportText; actual:ReportText; rootCause:ReportText; technicalAnalysis:ReportText; businessImpact:ReportText; blastRadius:ReportText; remediation:ReportText; verification:ReportText[]; attackPath:ReportText[]; confidence:string;
};

const F=(id:string,titleEn:string,titleFa:string,severity:Finding['severity'],cvss:number,risk:Finding['risk'],cwe:string,wstg:string,asset:string,endpoint:string,obsEn:string,obsFa:string,rootEn:string,rootFa:string,impactEn:string,impactFa:string,remEn:string,remFa:string):Finding=>({
  id,title:{en:titleEn,fa:titleFa},severity,cvss,risk,cwe,wstg,asset,endpoint,status:"Open / Under remediation",vector:`CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:${severity==='Critical'?'H':'L'}/VI:${severity==='Critical'?'H':'L'}/VA:N`,observation:{en:obsEn,fa:obsFa},expected:{en:"The authoritative server-side control must enforce the documented security requirement and deny unsafe states by default.",fa:"کنترل مرجع سمت سرور باید الزام امنیتی تعریف‌شده را اعمال و وضعیت‌های ناامن را به‌صورت پیش‌فرض رد کند."},actual:{en:"The controlled test produced behavior inconsistent with the expected security property.",fa:"آزمون کنترل‌شده رفتاری ناسازگار با خاصیت امنیتی مورد انتظار ایجاد کرد."},rootCause:{en:rootEn,fa:rootFa},technicalAnalysis:{en:`The weakness is rooted in ${rootEn.toLowerCase()} and was reproduced through the linked WSTG test execution.`,fa:`این ضعف ناشی از ${rootFa} است و از طریق اجرای آزمون WSTG مرتبط بازتولید شد.`},businessImpact:{en:impactEn,fa:impactFa},blastRadius:{en:severity==='Critical'?"Potentially multiple accounts / critical data boundary":"Affected workflow and users reaching the vulnerable path",fa:severity==='Critical'?"احتمالاً چندین حساب / مرز داده حیاتی":"Workflow و کاربران در معرض مسیر آسیب‌پذیر"},remediation:{en:remEn,fa:remFa},verification:[{en:"Re-run the original PoC against the remediated build.",fa:"PoC اصلی را روی Build اصلاح‌شده دوباره اجرا کنید."},{en:"Test alternate routes, methods and roles for regression.",fa:"مسیرها، متدها و نقش‌های جایگزین را برای Regression آزمایش کنید."},{en:"Confirm authorized functionality still works.",fa:"تأیید کنید عملکرد مجاز همچنان صحیح کار می‌کند."}],attackPath:[{en:"Authorized/remote entry point",fa:"نقطه ورود مجاز/از راه دور"},{en:"Security control weakness",fa:"ضعف کنترل امنیتی"},{en:titleEn,fa:titleFa},{en:impactEn,fa:impactFa}],confidence:"CONFIRMED"
});

export const findings:Finding[]=[
  F("SEC-001","Broken Object-Level Authorization","نقص مجوزدهی در سطح شیء","Critical",9.3,"Extreme","CWE-639","WSTG-ATHZ-04","API","/api/v1/customers/{id}","A low-privileged user could retrieve another user's resource by changing an object identifier.","کاربر با سطح دسترسی پایین با تغییر شناسه شیء توانست منبع متعلق به کاربر دیگری را دریافت کند.","Missing centralized server-side ownership authorization.","نبود کنترل متمرکز مالکیت و مجوزدهی سمت سرور","Cross-account exposure of customer information.","افشای اطلاعات بین حساب‌های مختلف مشتریان","Enforce centralized object-level authorization on every resource access.","روی هر دسترسی به منبع، مجوزدهی متمرکز در سطح شیء اعمال شود."),
  F("SEC-002","SQL Injection in Reporting Filter","تزریق SQL در فیلتر گزارش‌گیری","Critical",9.1,"Extreme","CWE-89","WSTG-INPV-05","API","/api/v1/reports/search","A reporting filter changed backend query semantics.","فیلتر گزارش‌گیری معنای Query سمت سرور را تغییر داد.","Unsafe dynamic SQL query composition.","ساخت ناامن Query پویا در SQL","Potential unauthorized database read/write through the application principal.","امکان دسترسی غیرمجاز به داده‌های پایگاه داده از طریق دسترسی برنامه","Use parameterized queries and typed query builders; remove string concatenation.","از Query پارامتری و Query Builder نوع‌دار استفاده و الحاق رشته حذف شود."),
  F("SEC-003","Weak Account Lockout Controls","کنترل ضعیف قفل حساب","High",7.1,"High","CWE-307","WSTG-ATHN-03","Identity","/auth/login","Repeated failed login attempts were insufficiently throttled.","تلاش‌های ناموفق متوالی ورود به اندازه کافی محدود نشدند.","Inconsistent adaptive rate limiting across authentication routes.","اعمال ناسازگار Rate Limit تطبیقی در مسیرهای احراز هویت","Increased feasibility of credential stuffing and password guessing.","افزایش امکان Credential Stuffing و حدس رمز عبور","Apply adaptive throttling and abuse telemetry consistently across all auth routes.","محدودسازی تطبیقی و Telemetry سوءاستفاده در تمام مسیرهای احراز هویت یکسان اعمال شود."),
  F("SEC-004","Cross-Site Request Forgery on Profile Change","CSRF در تغییر پروفایل","High",7.4,"High","CWE-352","WSTG-SESS-05","Web","/account/profile","A state-changing profile request lacked robust anti-CSRF validation.","درخواست تغییردهنده وضعیت پروفایل فاقد اعتبارسنجی قوی ضد CSRF بود.","Missing request-integrity enforcement for cookie-authenticated state changes.","نبود کنترل یکپارچگی درخواست برای تغییرات مبتنی بر Cookie","Unintended account changes in a victim session.","امکان تغییر ناخواسته حساب در نشست قربانی","Apply framework anti-CSRF tokens, SameSite policy and origin checks where appropriate.","توکن ضد CSRF فریم‌ورک، سیاست SameSite و کنترل Origin در جای مناسب اعمال شود."),
  F("SEC-005","Weak TLS Configuration","پیکربندی ضعیف TLS","Medium",5.8,"Moderate","CWE-326","WSTG-CRYP-01","Edge","TLS listener","The endpoint accepted transport settings below the laboratory baseline.","Endpoint تنظیمات انتقال ضعیف‌تر از Baseline آزمایشگاه را پذیرفت.","Transport-security baseline drift between edge profiles.","انحراف پیکربندی امنیت انتقال بین پروفایل‌های Edge","Reduced transport confidentiality assurance.","کاهش اطمینان از محرمانگی لایه انتقال","Centralize and continuously validate TLS protocol/cipher policy.","سیاست پروتکل و Cipherهای TLS متمرکز و به‌صورت مستمر اعتبارسنجی شود."),
  F("SEC-006","Reflected Cross-Site Scripting","XSS بازتابی","High",7.0,"High","CWE-79","WSTG-INPV-01","Web","/search?q=","Untrusted search input reached an executable browser context.","ورودی غیرقابل اعتماد جست‌وجو به Context قابل اجرای مرورگر رسید.","Missing context-aware output encoding in a legacy rendering path.","نبود Encoding متناسب با Context در مسیر Render قدیمی","Potential script execution in a victim browser session.","امکان اجرای Script در نشست مرورگر قربانی","Use context-aware output encoding and safe templating; validate CSP as defense in depth.","Encoding متناسب با Context و Template امن استفاده و CSP به‌عنوان دفاع مکمل اعتبارسنجی شود."),
  F("SEC-007","Missing Clickjacking Protection","نبود محافظت در برابر Clickjacking","Medium",5.1,"Moderate","CWE-1021","WSTG-CLNT-09","Web","/payments/confirm","A sensitive page could be embedded by an external origin.","صفحه حساس توسط Origin خارجی قابل Frame شدن بود.","Missing frame-ancestor restrictions.","نبود محدودیت frame-ancestors","Users could be tricked into unintended interactions.","کاربر ممکن است به تعامل ناخواسته با کنترل‌های حساس فریب داده شود","Set CSP frame-ancestors and compatible frame protections.","CSP frame-ancestors و کنترل‌های سازگار ضد Frame اعمال شود."),
  F("SEC-008","Unrestricted File Type Upload","بارگذاری بدون محدودیت نوع فایل","High",8.1,"High","CWE-434","WSTG-BUSL-08","Web","/support/attachments","Unexpected file types passed server-side validation.","نوع فایل غیرمنتظره از اعتبارسنجی سمت سرور عبور کرد.","File validation relied on client-controlled metadata.","اعتبارسنجی فایل به Metadata قابل کنترل توسط Client متکی بود","Unsafe content may be stored or delivered from the application origin.","محتوای ناامن ممکن است ذخیره یا از Origin برنامه ارائه شود","Allowlist required formats, validate content server-side and isolate storage/delivery.","فرمت‌های مجاز Allowlist، محتوا سمت سرور اعتبارسنجی و ذخیره/ارائه ایزوله شود."),
  F("SEC-009","Unsafe HTTP Method Exposure","افشای متدهای غیرضروری HTTP","Medium",5.4,"Moderate","CWE-749","WSTG-CONF-06","Edge","Web server","Unrequired HTTP methods were exposed by the web tier.","متدهای HTTP غیرضروری توسط لایه وب در دسترس بودند.","Broad default method policy at proxy/application layers.","سیاست پیش‌فرض بیش از حد باز برای متدها در Proxy/برنامه","Expanded protocol attack surface.","افزایش سطح حمله پروتکلی","Restrict methods to an explicit allowlist at edge and application layers.","متدها در Edge و Application به Allowlist صریح محدود شوند."),
  F("SEC-010","Incomplete HSTS Policy","سیاست ناقص HSTS","Medium",4.8,"Moderate","CWE-319","WSTG-CONF-07","Web","HTTPS headers","One hostname returned an incomplete HSTS policy.","یک Host سیاست HSTS ناقص بازگرداند.","Security header policy drift across delivery tiers.","انحراف سیاست Headerهای امنیتی در لایه‌های ارائه","Weaker downgrade protection than intended.","محافظت ضعیف‌تر از مقدار مورد انتظار در برابر Downgrade","Centralize the HSTS policy for all intended production hosts.","سیاست HSTS برای تمام Hostهای هدف به‌صورت متمرکز اعمال شود."),
  F("SEC-011","Weak Password Policy","سیاست ضعیف رمز عبور","Medium",5.6,"Moderate","CWE-521","WSTG-ATHN-07","Identity","/account/password","An alternate password-change flow accepted a weak password.","مسیر جایگزین تغییر رمز عبور یک رمز ضعیف را پذیرفت.","Credential policy inconsistency between identity workflows.","ناسازگاری سیاست اعتبارنامه بین Workflowهای هویت","Higher likelihood of account compromise through weak credentials.","افزایش احتمال تصاحب حساب از طریق اعتبارنامه ضعیف","Unify password validation and compromised-password checks across all flows.","اعتبارسنجی رمز و بررسی رمزهای افشاشده در تمام Flowها یکپارچه شود."),
  F("SEC-012","Authorization Schema Bypass on Admin Route","دور زدن مجوزدهی در مسیر مدیریتی","High",8.6,"Extreme","CWE-285","WSTG-ATHZ-02","Admin","/admin/export","An alternate route reached an administrative operation without the expected policy decision.","یک مسیر جایگزین بدون تصمیم مجوزدهی مورد انتظار به عملیات مدیریتی رسید.","Authorization middleware inconsistency between routes.","ناسازگاری Middleware مجوزدهی بین Routeها","Potential unauthorized administrative capability and data export.","امکان دسترسی غیرمجاز به قابلیت مدیریتی و خروجی داده","Enforce authorization in the authoritative backend service with deny-by-default policy.","مجوزدهی در سرویس مرجع Backend با سیاست deny-by-default اعمال شود."),
  F("SEC-013","Session Cookie Attribute Weakness","ضعف ویژگی‌های Cookie نشست","Medium",5.3,"Moderate","CWE-614","WSTG-SESS-02","Identity","Session cookie","A refresh-flow cookie omitted a required security attribute.","Cookie مربوط به Refresh یکی از ویژگی‌های امنیتی الزامی را نداشت.","Cookie policy was duplicated across components.","سیاست Cookie بین Componentها تکراری و ناسازگار بود","Reduced browser-side session protection.","کاهش محافظت نشست در مرورگر","Centralize Secure/HttpOnly/SameSite policy for every authentication cookie.","سیاست Secure/HttpOnly/SameSite برای همه Cookieهای احراز هویت متمرکز شود."),
  F("SEC-014","Server-Side Request Forgery","جعل درخواست سمت سرور (SSRF)","High",8.2,"Extreme","CWE-918","WSTG-INPV-19","API","/api/v1/integrations/preview","A server-side URL feature could connect beyond the intended destination allowlist.","قابلیت URL سمت سرور توانست خارج از Allowlist مقصد اتصال برقرار کند.","Insufficient destination validation and egress restrictions.","اعتبارسنجی ناکافی مقصد و محدودیت ضعیف Egress","Potential access to internal services reachable from the application network.","امکان دسترسی به سرویس‌های داخلی قابل دسترس از شبکه برنامه","Use strict destination allowlists, canonical parsing, redirect revalidation and egress controls.","Allowlist سختگیرانه مقصد، Parse استاندارد، اعتبارسنجی Redirect و کنترل Egress اعمال شود."),
];

export const standards = [
  ["OWASP WSTG","4.2","Web application security testing scenarios / سناریوهای آزمون امنیت وب"],
  ["OWASP ASVS","5.0.0","Application security verification requirements / الزامات راستی‌آزمایی امنیت برنامه"],
  ["NIST SP 800-115","Final","Technical security testing and assessment / آزمون و ارزیابی فنی امنیت"],
  ["NIST SP 800-30 Rev.1","Rev.1","Risk assessment / ارزیابی ریسک"],
  ["CVSS","4.0","Technical vulnerability severity / شدت فنی آسیب‌پذیری"],
  ["ISO/IEC 27005","2022","Information security risk management / مدیریت ریسک امنیت اطلاعات"],
  ["ISO/IEC 29147","2018","Vulnerability disclosure / افشای آسیب‌پذیری"],
  ["ISO/IEC 30111","2019","Vulnerability handling / مدیریت و رسیدگی به آسیب‌پذیری"],
  ["CWE","Assessment snapshot","Weakness classification / طبقه‌بندی ضعف"],
  ["CAPEC / MITRE ATT&CK","Assessment snapshot","Attack-pattern/adversary context / زمینه الگوی حمله و رفتار مهاجم"],
] as const;

export const attackChains = [
  {id:"CHAIN-001", title:{en:"Cross-account data exposure",fa:"افشای داده بین حساب‌ها"}, findings:["SEC-013","SEC-001"], impact:{en:"Unauthorized access to another customer's information",fa:"دسترسی غیرمجاز به اطلاعات مشتری دیگر"}, risk:"Extreme"},
  {id:"CHAIN-002", title:{en:"Administrative capability expansion",fa:"گسترش قابلیت‌های مدیریتی"}, findings:["SEC-009","SEC-012"], impact:{en:"Unauthorized administrative export",fa:"خروجی مدیریتی غیرمجاز"}, risk:"Extreme"},
  {id:"CHAIN-003", title:{en:"Credential attack amplification",fa:"تقویت حمله به اعتبارنامه"}, findings:["SEC-011","SEC-003"], impact:{en:"Increased account takeover feasibility",fa:"افزایش امکان تصاحب حساب"}, risk:"High"},
];

export const rootCauses = [
  {id:"SRC-001", title:{en:"Authorization policy inconsistency",fa:"ناسازگاری سیاست مجوزدهی"}, findings:["SEC-001","SEC-012"], action:{en:"Centralize authorization decisions and add negative policy tests.",fa:"تصمیم‌های مجوزدهی متمرکز و آزمون‌های منفی Policy اضافه شوند."}},
  {id:"SRC-002", title:{en:"Security configuration drift",fa:"انحراف پیکربندی امنیتی"}, findings:["SEC-005","SEC-009","SEC-010","SEC-013"], action:{en:"Adopt centrally governed security baselines and drift detection.",fa:"Baselineهای امنیتی متمرکز و کنترل Drift پیاده‌سازی شوند."}},
  {id:"SRC-003", title:{en:"Unsafe input/output handling variance",fa:"ناسازگاری در مدیریت امن ورودی/خروجی"}, findings:["SEC-002","SEC-006","SEC-014"], action:{en:"Use typed input contracts, safe interpreters, encoding and egress policy.",fa:"Contractهای نوع‌دار ورودی، APIهای امن، Encoding و سیاست Egress استفاده شود."}},
  {id:"SRC-004", title:{en:"Security requirement inconsistency across workflows",fa:"ناسازگاری الزامات امنیتی بین Workflowها"}, findings:["SEC-003","SEC-004","SEC-008","SEC-011"], action:{en:"Create reusable security control components and regression tests.",fa:"Componentهای امنیتی قابل استفاده مجدد و آزمون Regression ایجاد شوند."}},
];

export const executiveText = {
  purpose:{en:"Determine the security posture of the selected project through evidence-backed testing, risk analysis and remediation verification.",fa:"تعیین وضعیت امنیتی پروژه انتخاب‌شده از طریق آزمون مبتنی بر شواهد، تحلیل ریسک و راستی‌آزمایی اصلاحات."},
  assurance:{en:"This report records behavior observed under the defined scope, time window, permissions and methodology. A PASS result means the documented hypothesis was not falsified by the recorded tests; it is not a certification of absolute security.",fa:"این گزارش رفتار مشاهده‌شده در محدوده، بازه زمانی، مجوزها و روش تعریف‌شده را ثبت می‌کند. PASS فقط به این معناست که فرضیه ثبت‌شده در آزمون‌های انجام‌شده نقض نشده و به‌معنای گواهی امنیت مطلق نیست."},
};
