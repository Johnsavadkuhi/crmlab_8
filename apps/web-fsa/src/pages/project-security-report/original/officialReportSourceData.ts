/**
 * Source-controlled content transcribed from the supplied reference screenshots.
 *
 * COMPLIANCE RULE:
 * - Persian source wording is intentionally preserved verbatim; do not paraphrase it.
 * - Visible source anomalies are preserved instead of silently "fixing" the source.
 * - Layout is adapted to the report design system, but wording is source-locked.
 */

export const officialDocumentProfile = {
  documentIdentifier: 'SLB-W-05052229000001',
  documentCode: 'LQS-F708-02/00',
  systemName: 'سامانه کارا وب (تکریم ارباب و رجوع)',
  documentClassification: 'فوق محرمانه',
  systemAcceptanceDate: '۱۴۰۵/۰۳/۱۶',
  assessmentDate: '۱۴۰۵/۰۳/۳۱',
  reportIssueDate: '۱۴۰۵/۰۵/۰۵',
  systemVersion: '۱.۱.۱۰',
  client: 'بانک ملی ایران',
  contractor: 'اداره کل مهندسی املاک',
  operator: 'اداره کل مهندسی املاک',
  incomingLetterNumber: '۱۴۰۵.۳۳۳۲',
  assessmentRound: 'مرتبه اول',
  sourceCaptionFa: 'جدول ۱ : شناسنامه مستند',
  labelsFa: {
    documentIdentifier: 'شناسه مستند',
    documentCode: 'کد مدرک',
    systemName: 'نام سامانه',
    documentClassification: 'طبقه بندی مستند',
    systemAcceptanceDate: 'تاریخ پذیرش سامانه',
    assessmentDate: 'تاریخ آزمون',
    reportIssueDate: 'تاریخ صدور گزارش',
    systemVersion: 'نسخه سامانه',
    client: 'کارفرما',
    contractor: 'پیمانکار',
    operator: 'بهره بردار',
    incomingLetterNumber: 'شماره نامه دریافتی',
    assessmentRound: 'تعداد دفعات آزمون',
  },
};

export const reportQualityControl = {
  controller: 'حسین نوروزی',
  approvalDate: '۱۴۰۵/۰۵/۱۴',
  sourceCaptionFa: 'جدول ۲ : کنترل کیفیت گزارش',
  checksHeadingFa: 'موارد بررسی شده',
  approvalHeadingFa: 'تایید',
  checks: [
    {
      id: 'QC-01',
      label: 'Spelling and orthographic review',
      fa: 'مستند به لحاظ رعایت مسائل املایی مورد تایید است.',
      approved: true,
    },
    {
      id: 'QC-02',
      label: 'Persian writing and language review',
      fa: 'مستند به لحاظ رعایت مسائل نگارشی ادبیات فارسی مورد تایید است.',
      approved: true,
    },
    {
      id: 'QC-03',
      label: 'Scientific writing review',
      fa: 'مستند به لحاظ رعایت مسائل نگارش علمی مورد تایید است.',
      approved: true,
    },
    {
      id: 'QC-04',
      label: 'Technical and specialist review',
      fa: 'مستند به لحاظ رعایت مسائل فنی و تخصصی مورد تایید است.',
      approved: true,
    },
    {
      id: 'QC-05',
      label: 'Client-need adequacy review',
      fa: 'مستند جوابگوی نیاز واقعی کارفرما است.',
      approved: true,
    },
  ],
};

export const assessmentPersonnelHistoryCaptionFa = 'جدول ۳ : تاریخچه آزمونگران';

export const assessmentPersonnelHistory = [
  { row: '۱', tester: 'محمدرضا پایدار', assessmentStart: '۱۴۰۵/۰۳/۳۱', assessmentEnd: '۱۴۰۵/۰۴/۲۰', documentationApproval: '—', reportPreparation: '—' },
  { row: '۲', tester: 'میثم منصف', assessmentStart: '۱۴۰۵/۰۴/۰۶', assessmentEnd: '۱۳۴۸/۱۰/۱۱', documentationApproval: '—', reportPreparation: '—' },
  { row: '۳', tester: 'لیلا کابلی', assessmentStart: '۱۴۰۵/۰۳/۳۰', assessmentEnd: '۱۴۰۵/۰۴/۱۷', documentationApproval: '—', reportPreparation: '—' },
  { row: '۴', tester: 'محمد سوادکوهی', assessmentStart: '۱۴۰۵/۰۳/۳۰', assessmentEnd: '۱۴۰۵/۰۵/۰۵', documentationApproval: '—', reportPreparation: '—' },
  { row: '۵', tester: 'المیرا اسماعیلی', assessmentStart: '۱۴۰۵/۰۳/۳۰', assessmentEnd: '۱۴۰۵/۰۵/۰۶', documentationApproval: '—', reportPreparation: '—' },
  { row: '۶', tester: 'خدیجه داور', assessmentStart: '۱۴۰۵/۰۳/۳۱', assessmentEnd: '۱۴۰۵/۰۴/۰۲', documentationApproval: '—', reportPreparation: '—' },
  { row: '۷', tester: 'مهتاب دهقان', assessmentStart: '۱۴۰۵/۰۳/۳۰', assessmentEnd: '۱۴۰۵/۰۵/۰۶', documentationApproval: '—', reportPreparation: '—' },
  { row: '۸', tester: 'میثم منصف', assessmentStart: '—', assessmentEnd: '—', documentationApproval: '۱۴۰۵/۰۵/۰۵', reportPreparation: '۱۴۰۵/۰۵/۰۵' },
];

export const publicationRights = {
  titleFa: 'حق طبع و نشر',
  persianText:
    'این مستند، در تاریخ ۱۴۰۵/۰۵/۰۵ توسط آزمایشگاه امنیت و کیفیت نرم افزار بانک ملی ایران به منظور ارزیابی سامانه کارا وب (تکریم ارباب و رجوع) متعلق به اداره کل مهندسی املاک ارائه گردیده و ارزش و اعتبار دیگری ندارد. تمامی حقوق این اثر، متعلق به «آزمایشگاه امنیت و کیفیت نرم افزار بانک ملی ایران» بوده و هرگونه نسخه برداری از آن، شامل رونوشت، نسخه برداری الکترونیکی و یا ترجمه بخش یا تمام آن در گرو کسب اجازه کتبی از صاحب اثر است. همچنین مطالب این مستند بدون اطلاع قبلی به«آزمایشگاه امنیت و کیفیت نرم افزار بانک ملی ایران» غیرقابل تغییر است.',
  englishHeading: 'Copyright',
  englishLines: [
    '© Copyright 2024Corporation',
    'All rights reserved.',
    'Published',
  ],
  // Kept exactly as visible in the supplied source, including source-side spacing/word joins.
  englishText:
    'This document may not, in whole or in part, be copied, photocopied, reproduced, translated, orreduced to any machine-readable form without formal permission. Every effort has been made to ensure the accuracy of this document. However, shall not be liable for any error or for incidental or consequential damages pertinent tothe form, performance, or use of this document orthe examples within. The information herein is subject to change without notice toCorporation.',
};

export const assessmentBasisAndRiskDefinitions = {
  sectionTitleFa: 'تعاریف و مفاهیم',
  riskTitleFa: 'میزان مخاطرات',
  basis: {
    fa: 'سامانه ای که در این گزارش مورد بحث قرار گرفته است، در آزمایشگاه تحت استاندارد امنیتی ISO 15408 و سری کیفی ۲۵۰۰۰ و با استفاده از مدل های OWASP و ASVS مورد ارزیابی قرار گرفته است. این گزارش تنها شامل نسخه‌ای از محصول نرم افزاری است که تحت آزمون در محیط تنظیم شده خاص قرار گرفته است. بنابراین نتایج این گزارش نیز منوط به همین نسخه و محیط آزمون مربوطه است؛ این آزمایشگاه از نسخه های دیگر، بی اطلاع بوده و هیچ نوع مسئولیتی در رابطه با نسخه های دیگر ندارد. این سند حاوی اطلاعات محرمانه است و کلیه حقوق آن محفوظ و مشترکاً متعلق به آزمایشگاه امنیت و کیفیت نرم افزار بانک ملی ایران بوده و تکثیر یا توزیع تمام یا بخش هایی از آن به هر نحو و هر قالبی اعم از چاپی و الکترونیکی مجاز نیست.',
    en: 'The system discussed in this report was evaluated in the laboratory under ISO 15408, the 25000 quality series, and the OWASP and ASVS models. The report applies only to the tested software version and configured test environment.',
  },
  uncertainty: {
    fa: 'با توجه به عدم قطعیت های احتمالی در آزمون های امنیت نرم افزار، نبود آسیب پذیری به معنای نبود قطعی آن نمی باشد.',
    en: 'Because security testing may contain uncertainty, the absence of an observed vulnerability does not mean a vulnerability is certainly absent.',
  },
  riskIntroFa: 'این فیلد حاصل ضرب شدت و احتمال سوء استفاده از مخاطره ای است که برنامه ی کاربردی در صورت رعایت نکردن مورد آزمون با آن مواجه می شود و به صورت زیر طبقه بندی می گردد:',
  standards: ['ISO 15408', '۲۵۰۰۰', 'OWASP', 'ASVS'],
  sourceCaptionFa: 'جدول ۴ : میزان مخاطرات',
};

export const severityDefinitionRows = [
  {
    level: 'Informational',
    descriptionFa: 'آسیب پذیری هایی که تنها منجر به نشت اطلاعات کاربردی به فرد نفوذگر خواهد شد و به او در راستای طراحی حملات هدفمند کمک خواهد کرد',
    descriptionEn: 'Vulnerabilities that only lead to leakage of useful information to an intruder and help in designing targeted attacks.',
  },
  {
    level: 'Low',
    descriptionFa: 'آسیب پذیری هایی که دارای رتبه بندی پایین هستند، ممکن است اطلاعاتی را به کاربران غیر مجاز یا ناشناس جهت حمله به برنامه کاربردی نشت دهند',
    descriptionEn: 'Low-ranked vulnerabilities may leak information to unauthorized or unknown users for attacking the application.',
  },
  {
    level: 'Medium',
    descriptionFa: 'آسیب پذیری هایی که دارای رتبه بندی متوسط هستند، میتوانند برای مهاجم دسترسی کاربر غیر مجاز در برنامه کاربردی یا داده های حساس فراهم آورد',
    descriptionEn: 'Medium-ranked vulnerabilities can provide an attacker with unauthorized user access in the application or to sensitive data.',
  },
  {
    level: 'High',
    descriptionFa: 'آسیب پذیری هایی که دارای رتبه بندی بالا هستند، به طور مستقیم موجب می شود که مهاجم دسترسی به سیستم، برنامه کاربردی یا داده های حساس را در اختیار داشته باشد',
    descriptionEn: 'High-ranked vulnerabilities can directly provide an attacker access to the system, application, or sensitive data.',
  },
  {
    level: 'Critical',
    descriptionFa: 'آسیب پذیری هایی که دارای رتبه بندی بحرانی هستند باعث افزایش سطح دسترسی مهاجم بر روی سیستم قربانی، برنامه های کاربردی یا داده های حساس و همچنین دسترسی بیشتر به میزبان ها یا سایر سامانه های مجاور خواهد شد',
    descriptionEn: 'Critical vulnerabilities increase attacker access on the victim system, applications or sensitive data and can extend access to adjacent hosts or systems.',
  },
];

export const documentAccessControl = {
  titleFa: 'کنترل دسترسی',
  privilegesHeadingFa: 'اختیارات (در رابطه با مفاد این مدرک)',
  classificationHeadingFa: 'طبقه بندی (محرمانه / انتشار محدود / عادی)',
  classification: { fa: 'محرمانه', en: 'Confidential' },
  sourceCaptionFa: 'جدول ۵ : کنترل دسترسی',
  permissions: [
    {
      entityFa: 'آزمایشگاه', entityEn: 'Laboratory',
      useContent: true, changeContent: true, print: true, copyStore: true, sendExchange: true, destroy: true,
    },
    {
      entityFa: 'پیمانکار', entityEn: 'Contractor',
      useContent: true, changeContent: false, print: false, copyStore: true, sendExchange: true, destroy: true,
    },
    {
      entityFa: 'بهره بردار', entityEn: 'Operator',
      useContent: false, changeContent: false, print: true, copyStore: true, sendExchange: true, destroy: false,
    },
  ],
};

export const vulnerabilityIdentification = {
  titleFa: 'روش های شناسایی آسیب پذیری یک سامانه :',
  introFa: 'نحوه یافتن آسیب پذیری توسط آزمایشگاه امنیت و کیفیت نرم افزار مطابق یکی از روش های زیر میباشد.',
};

export const vulnerabilityIdentificationMethods = [
  {
    id: 'VID-01',
    fa: 'به صورت دستی توسط کارشناسان خبره',
    en: 'Manually by expert specialists',
  },
  {
    id: 'VID-02',
    fa: 'توسط ابزار های عمومی',
    en: 'Using public/general-purpose tools',
  },
  {
    id: 'VID-03',
    fa: 'توسط اسکریپت یا ابزارهای خصوصی آزمایشگاه امنیت و کیفیت نرم افزار',
    en: 'Using scripts or private tools of the Software Security and Quality Laboratory',
  },
];

export const testItemStructureSource = {
  titleFa: 'ساختار موارد آزمون:',
  introFa: 'بر اساس مدل اجرایی، از روشگان OWASP، موارد آزمون در این گزارش، می تواند در ارتباط با یک یا چند مورد آزمون از روشگان اصلی بوده؛ و نیز به یک یا چند کلاس مربوط باشد. همچنین هر مورد آزمون در این گزارش حاوی بخش های زیر است:',
};

export const testItemStructure = [
  {
    field: 'نام آزمون',
    sourceLabelFa: 'نام آزمون:',
    descriptionFa: 'در این بخش عنوان موارد آزمون مشخص می شود.',
    descriptionEn: 'The test-item title is specified in this section.',
  },
  {
    field: 'شدت آزمون',
    sourceLabelFa: 'شدت آزمون:',
    descriptionFa: 'در این بخش، شدت آسیب پذیری مورد نظر بر روی سامانه مشخص میگردد.',
    descriptionEn: 'The severity of the vulnerability under consideration on the system is specified.',
  },
  {
    field: 'POC URL',
    sourceLabelFa: 'آدرس صفحه آسیب پذیری (POC URL):',
    descriptionFa: 'در این بخش آدرس صفحه آسیب پذیری سامانه مورد نظر مشخص میگردد.',
    descriptionEn: 'The vulnerable page address of the system is specified.',
  },
  {
    field: 'Attack Vector',
    sourceLabelFa: 'روش حمله (Attack Vector):',
    descriptionFa: 'در این بخش محلی که بهره برداری از آسیب پذیری در آن امکان پذیر است.',
    descriptionEn: 'The place/context in which exploitation of the vulnerability is possible.',
  },
  {
    field: 'Attack Score',
    sourceLabelFa: 'امتیاز حمله (Attack Score):',
    descriptionFa: 'در این بخش امتیاز حمله بر اساس امتیاز دهی CVSS مشخص میگردد.',
    descriptionEn: 'The attack score is specified based on CVSS scoring.',
  },
];

export const cvss31Reference = {
  intro: {
    fa: 'CVSS یک استاندارد امتیازدهی به آسیب پذیری بوده که آزمایشگاه امنیت در راستای بررسی میزان خطر هر آسیب پذیری از آخرین نسخه آن (نسخه ۳.۱) استفاده می کند. در این نسخه از این سازوکار، ۸ پارامتر بررسی شده تا امتیاز نهایی که عددی بین صفر تا ده می باشد، محاسبه گردد. طبیعی است هر چه عدد به سمت ده نزدیک شود به معنی بالاتر بودن شدت آسیب پذیری می باشد. پارامتر های مرتبط به همراه توضیحات مختصر در جدول زیر آمده است :',
    en: 'CVSS is a vulnerability scoring standard. This source page describes CVSS version 3.1 and eight parameters used to calculate a final score from zero to ten.',
  },
  sourceCaptionFa: 'جدول ۶ : پارامتر های CVSS 3.1',
  possibleValuesIntroFa: 'همچنین مقادیر ممکن برای هر یک از پارامترها در جدول زیر آمده است :',
  possibleValuesCaptionFa: 'جدول ۷ : مقادیر ممکن برای هر یک از پارامتر های CVSS 3.1',
  parameters: [
    {
      classSource: 'Exploitability Metrics',
      code: 'AV',
      sourceName: 'Attack vector(AV)',
      valuesSourceName: 'Attack vector (AV)',
      descriptionFa: 'محلی که بهره برداری از آسیب پذیری امکانپذیر است.',
      descriptionEn: 'The location/context in which exploitation is possible.',
      values: ['Network (AV:N)', 'Adjacent Network (AV:A)', 'Local (AV:L)', 'Physical (AV:P)'],
    },
    {
      classSource: 'Exploitability Metrics',
      code: 'AC',
      sourceName: 'Attack Complexity(AC)',
      valuesSourceName: 'Attack Complexity (AC)',
      descriptionFa: 'میزان سختی بهره برداری از آسیب پذیری',
      descriptionEn: 'The difficulty of exploiting the vulnerability.',
      values: ['Low (AC:L)', 'High (AC:H)'],
    },
    {
      classSource: 'Exploitability Metrics',
      code: 'PR',
      sourceName: 'Privileges Required(PR)',
      valuesSourceName: 'Privileges Required (PR)',
      descriptionFa: 'میزان دسترسی که نفوذگر برای بهره برداری از آسیب پذیری نیاز دارد',
      descriptionEn: 'The access level the intruder needs to exploit the vulnerability.',
      values: ['None (PR:N)', 'Low (PR:L)', 'High (PR:H)'],
    },
    {
      classSource: 'Exploitability Metrics',
      code: 'UI',
      sourceName: 'User Interaction(UI)',
      valuesSourceName: 'User Interaction (UI)',
      descriptionFa: 'بررسی اینکه جهت بهره برداری از آسیب پذیری ، تعامل کاربری غیر از نفوذگر نیاز است یا خیر',
      descriptionEn: 'Whether interaction by a user other than the intruder is required.',
      values: ['None (UI:N)', 'Required (UI:R)'],
    },
    {
      classSource: 'Exploitability Metrics',
      code: 'S',
      sourceName: 'Scope(S)',
      valuesSourceName: 'Scope (S)',
      descriptionFa: 'آیا با بهره برداری از آسیب پذیری ، محدوده آزمون تغییر میکند یا خیر',
      descriptionEn: 'Whether exploitation changes the test scope.',
      values: ['Unchanged (S:U)', 'Changed (S:C)'],
    },
    {
      classSource: 'Impact metrics',
      code: 'C',
      sourceName: 'Confidentiality Impact(C)',
      valuesSourceName: 'Confidentiality Impact (C)',
      descriptionFa: 'میزان تاثیر آسیب پذیری بر روی محرمانگی سامانه',
      descriptionEn: 'The impact of the vulnerability on system confidentiality.',
      values: ['None (C:N)', 'Low (C:L)', 'High (C:H)'],
    },
    {
      classSource: 'Impact metrics',
      code: 'I',
      sourceName: 'Integrity Impact(I)',
      valuesSourceName: 'Integrity Impact (I)',
      descriptionFa: 'میزان تاثیر آسیب پذیری بر روی یکپارچگی سامانه',
      descriptionEn: 'The impact of the vulnerability on system integrity.',
      values: ['None (I:N)', 'Low (I:L)', 'High (I:H)'],
    },
    {
      classSource: 'Impact metrics',
      code: 'A',
      sourceName: 'Availability Impact(A)',
      valuesSourceName: 'Availability Impact (A)',
      descriptionFa: 'میزان تاثیر آسیب پذیری بر روی دسترسی پذیری سامانه',
      descriptionEn: 'The impact of the vulnerability on system availability.',
      values: ['None (A:N)', 'Low (A:L)', 'High (A:H)'],
    },
  ],
};


/**
 * Page 9 source: test-result semantics, evidence, remediation / hardening fields,
 * WAF hardening note, and the source OWASP ↔ CVSS 3.1 qualitative mapping.
 * Persian wording below is source-locked to the supplied screenshot.
 */
export const testOutcomeAndHardeningSource = {
  titleFa: 'نتیجه آزمون',
  resultIntroFa: 'در بخش، نتیجه هر آزمون، با یکی از ۴ حالت زیر مشخص می‌شود:',
  resultStates: [
    {
      code: 'PASS',
      fa: 'به این معنی است که محصول مورد ارزیابی، مورد آزمون را برآورده کرده است.',
    },
    {
      code: 'FAIL',
      fa: 'به این معنی است که محصول مورد ارزیابی این مورد آزمون را برآورده نکرده است.',
    },
    {
      code: 'Not Accessible',
      fa: 'به معنی آن است که این آزمون به هر دلیلی از جمله درخواست کارفرما، و یا عدم وجود عملکرد مربوطه در محصول مورد ارزیابی، انجام نشده است',
    },
    {
      code: 'Not Applicable',
      fa: 'به معنی آن است که این آزمون به هر دلیلی از جمله عدم کارکرد صحیح عملکرد مربوطه در محصول مورد ارزیابی، و یا عدم وجود دسترسی کافی برای انجام آزمون، انجام نشده است.',
    },
    {
      code: 'In Progress',
      fa: 'به معنی در حال اجرا می باشد.',
    },
  ],
  evidenceTitleFa: 'شواهد آزمون',
  evidenceTextFa: 'در این بخش، شواهد مربوط به اثبات نتایج بدست آمده در هر مورد آزمون، بصورت تصویر یا عکس و یا ارجاع به پرونده‌های دیگر ارائه می‌شود.',
  securitySolutionTitleFa: 'راهکار امنیتی',
  securitySolutionTextFa: 'در این بخش توضیحات مربوط به آسیب پذیری سامانه و راهکارهای ایمن سازی ارائه میگردد.',
  hardeningByTitleFa: 'امکان امن سازی توسط',
  hardeningByTextFa: 'در این بخش مشخص می شود که آسیب پذیری از کدام یک از دو حالت زیر قابل امن سازی است:',
  hardeningOptions: [
    {
      labelFa: 'تغییر در کد برنامه',
      descriptionFa: 'به این معنی که آسیب پذیری توسط توسعه دهنده سامانه مربوطه قابل رفع است.',
    },
    {
      labelFa: 'تغییر در تنظیمات وب سرور',
      descriptionFa: 'به این معنی که آسیب پذیری توسط ارائه دهنده سرویس سامانه مربوطه قابل رفع می باشد.',
    },
  ],
  wafTitleFa: 'امکان امن سازی توسط WAF',
  wafTextFa: 'در این بخش مشخص می شود که آسیب پذیری تا چه میزان توسط WAF قابلیت پنهان سازی دارد . (به عنوان یک راهکار کوتاه مدت می باشد.)',
  mappingIntroFa: 'در نگاشت کمی به کیفی این رتبه بندی، آسیب پذیری های بحرانی ( Critical )، پرخطر ( High )، خطرناک ( Medium ) و کم خطر (Low) با رنگ های متفاوت مشخص شده اند.',
  rankingHeadersFa: ['رتبه‌بندی OWASP', 'بازه امتیاز CVSS'],
  rankingRows: [
    { owaspFa: 'بحرانی', cvssRange: '9.0 - 10' },
    { owaspFa: 'پرخطر', cvssRange: '7.0 – 8.9' },
    { owaspFa: 'خطرناک', cvssRange: '4.0 – 6.9' },
    { owaspFa: 'کم‌خطر', cvssRange: '0.1 – 3.9' },
    { owaspFa: 'قبول', cvssRange: '0.0' },
  ],
  sourceCaptionFa: 'جدول ۸ : راهنمای رتبه بندی CVSS3.1',
};

/**
 * Page 10 source: penetration-test approach and assessment-team location.
 * Persian wording below is source-locked to the supplied screenshot.
 */
export const penetrationTestApproachSource = {
  approachTitleFa: '۲.۱-رویکرد آزمون نفوذ',
  introFa: 'بر اساس میزان آگاهی اولیه‌ی نفوذگر از محیط هدف ارزیابی، آزمون به ۳ مورد جعبه سیاه، جعبه سفید و جعبه خاکستری تقسیم می‌گردد که وجه تمایز آن‌ها به قرار زیر است:',
  boxDefinitions: [
    {
      labelFa: 'جعبه سفید',
      textFa: 'نفوذگر از تمامی سازوکارهای مقصد نفوذ آگاهی دارد (اطلاعاتی نظیر: نمودار معماری شبکه، کد منبع برنامه‌ی کاربردی، حساب های ریشه و فایل های پیکربندی)',
    },
    {
      labelFa: 'جعبه سیاه',
      textFa: 'نفوذگر اطلاعاتی بیشتر از یک کاربر معمولی از مقصد نفوذ ندارد.',
    },
    {
      labelFa: 'جعبه خاکستری',
      textFa: 'نفوذگر اطلاعات محدودی از مقصد دارد و برحسب میزان اطلاعات بین دو روش قبلی قرار می گیرد.',
    },
  ],
  selectedApproachFa: 'حال با توجه به اینکه اطلاعات کاربر ادمین در اختیار تیم ارزیاب بوده است، این ارزیابی در طیف جعبه خاکستری قرار می گیرد.',
  testTypesTitleFa: 'انواع تست نفوذ',
  reviewedHeadingFa: 'موارد بررسی شده',
  approvalHeadingFa: 'تایید',
  testTypes: [
    { labelFa: 'تست جعبه سیاه', approved: false },
    { labelFa: 'تست جعبه خاکستری', approved: true },
    { labelFa: 'تست جعبه سفید', approved: false },
  ],
  sourceCaptionFa: 'جدول ۱۱ : انواع تست نفوذ',
  locationTitleFa: '۲.۲-مکان گروه ارزیاب',
  locationIntroFa: 'جایگاه تیم ارزیاب به دو شکل کلی بوده است:',
  locationItemsFa: [
    'داخل سازمان کارفرما و دسترسی به پرتال خدمات غیر حضوری مانند دیگر کارکنان عمومی سازمان',
    'خارج از سازمان، مانند کاربران عمومی پرتال',
    'مکان آزمون آزمایشگاه امنیت و کیفیت نرم افزار بانک ملی ایران با سطح دسترسی داخلی/خارجی',
  ],
};


/**
 * Current ISO/IEC 15408 baseline researched for the 2026 report update.
 * The family codes and clause locations below are identifiers/catalogue metadata,
 * not reproductions of the normative requirement text.
 * Persian labels are internal report translations and are not asserted to be an
 * official Persian translation of ISO/IEC 15408.
 */
export const iso15408_2026Baseline = {
  researchedOn: '2026-09-05',
  currentPart2: 'ISO/IEC 15408-2:2026',
  edition: '5',
  publication: '2026-05',
  titleFa: 'خط مبنای جاری الزامات کارکردی ISO/IEC 15408 در سال 2026',
  revisionNoteFa: 'ISO/IEC 15408-2:2026 جایگزین نسخه 2022 شده و یک بازنگری فنی است. ساختار سند بازآرایی شده، اصطلاحات و روابط وابستگی و سلسله‌مراتب مؤلفه‌ها بازبینی شده و یادداشت‌های جدید مربوط به عملیات الزامات افزوده شده است.',
  applicabilityNoteFa: 'وجود یک خانواده الزام در کاتالوگ ISO/IEC 15408-2 به معنی قابل‌اعمال بودن خودکار آن برای هر محصول نیست. الزامات قابل‌اعمال باید بر اساس TOE و Security Target و در صورت استفاده، Protection Profile یا Package مربوط انتخاب و سپس ارزیابی شوند.',
  resultCarryForwardNoteFa: 'نتایج PASS/FAIL که در جدول زیر نمایش داده می‌شوند فقط از مستند مبنای قدیمی منتقل شده‌اند. این نتایج برای ادعای انطباق با نسخه 2026 باید در خط مبنای جدید دوباره تأیید یا بازآزمایی شوند. مواردی که نتیجه قدیمی قابل استناد برای آن‌ها در تصاویر موجود نیست با وضعیت «نیازمند ارزیابی» نمایش داده می‌شوند.',
  extendedRequirementsNoteFa: 'کدهای دارای پسوند _EXT که در گزارش قدیمی دیده می‌شوند جزء خانواده‌های پایه کاتالوگ ISO/IEC 15408-2:2026 نیستند. این موارد باید فقط در صورت تعریف در Protection Profile، PP-Module، Functional Package یا Security Target پروژه به عنوان الزام توسعه‌یافته نگهداری و ارزیابی شوند.',
  seriesParts: [
    { reference: 'ISO/IEC 15408-1:2026', edition: '5', publication: '2026-05', purposeFa: 'مقدمه و مدل عمومی ارزیابی امنیت فناوری اطلاعات', purposeEn: 'Introduction and general evaluation model' },
    { reference: 'ISO/IEC 15408-2:2026', edition: '5', publication: '2026-05', purposeFa: 'مؤلفه‌ها و کاتالوگ الزامات کارکردی امنیتی', purposeEn: 'Security functional components and catalogue' },
    { reference: 'ISO/IEC 15408-3:2026', edition: '5', publication: '2026-05', purposeFa: 'مؤلفه‌های الزامات اطمینان امنیتی', purposeEn: 'Security assurance components' },
    { reference: 'ISO/IEC 15408-4:2026', edition: '2', publication: '2026-05', purposeFa: 'چارچوب تعیین روش‌ها و فعالیت‌های ارزیابی', purposeEn: 'Framework for evaluation methods and activities' },
    { reference: 'ISO/IEC 15408-5:2026', edition: '2', publication: '2026-04', purposeFa: 'بسته‌های از پیش تعریف‌شده الزامات امنیتی', purposeEn: 'Pre-defined packages of security requirements' },
  ],
};

export const iso15408_2026FunctionalClasses = [
  {
    classCode: 'FAU', classNameFa: 'ممیزی امنیتی', clause: '8', families: [
      { code: 'FAU_ARP', clause: '8.3', nameFa: 'پاسخ خودکار به رویدادهای ممیزی امنیتی' },
      { code: 'FAU_GEN', clause: '8.4', nameFa: 'تولید داده‌های ممیزی امنیتی' },
      { code: 'FAU_SAA', clause: '8.5', nameFa: 'تحلیل داده‌های ممیزی امنیتی' },
      { code: 'FAU_SAR', clause: '8.6', nameFa: 'بازبینی داده‌های ممیزی امنیتی' },
      { code: 'FAU_SEL', clause: '8.7', nameFa: 'انتخاب رویدادهای ممیزی امنیتی' },
      { code: 'FAU_STG', clause: '8.8', nameFa: 'ذخیره‌سازی و حفاظت از داده‌های ممیزی امنیتی' },
    ],
  },
  {
    classCode: 'FCO', classNameFa: 'ارتباطات', clause: '9', families: [
      { code: 'FCO_NRO', clause: '9.3', nameFa: 'عدم انکار مبدأ' },
      { code: 'FCO_NRR', clause: '9.4', nameFa: 'عدم انکار دریافت' },
    ],
  },
  {
    classCode: 'FCS', classNameFa: 'پشتیبانی رمزنگاری', clause: '10', families: [
      { code: 'FCS_CKM', clause: '10.3', nameFa: 'مدیریت کلیدهای رمزنگاری' },
      { code: 'FCS_COP', clause: '10.4', nameFa: 'عملیات رمزنگاری' },
      { code: 'FCS_RBG', clause: '10.5', nameFa: 'تولید بیت تصادفی' },
      { code: 'FCS_RNG', clause: '10.6', nameFa: 'تولید عدد تصادفی' },
    ],
  },
  {
    classCode: 'FDP', classNameFa: 'حفاظت از داده‌های کاربر', clause: '11', families: [
      { code: 'FDP_ACC', clause: '11.3', nameFa: 'سیاست کنترل دسترسی' },
      { code: 'FDP_ACF', clause: '11.4', nameFa: 'توابع کنترل دسترسی' },
      { code: 'FDP_DAU', clause: '11.5', nameFa: 'اصالت‌سنجی داده‌ها' },
      { code: 'FDP_ETC', clause: '11.6', nameFa: 'خروج داده از TOE' },
      { code: 'FDP_IFC', clause: '11.7', nameFa: 'سیاست کنترل جریان اطلاعات' },
      { code: 'FDP_IFF', clause: '11.8', nameFa: 'توابع کنترل جریان اطلاعات' },
      { code: 'FDP_IRC', clause: '11.9', nameFa: 'کنترل نگهداری اطلاعات' },
      { code: 'FDP_ITC', clause: '11.10', nameFa: 'ورود داده از خارج TOE' },
      { code: 'FDP_ITT', clause: '11.11', nameFa: 'انتقال داخلی داده در TOE' },
      { code: 'FDP_RIP', clause: '11.12', nameFa: 'حفاظت از اطلاعات باقیمانده' },
      { code: 'FDP_ROL', clause: '11.13', nameFa: 'بازگردانی عملیات و داده' },
      { code: 'FDP_SDC', clause: '11.14', nameFa: 'محرمانگی داده‌های ذخیره‌شده' },
      { code: 'FDP_SDI', clause: '11.15', nameFa: 'یکپارچگی داده‌های ذخیره‌شده' },
      { code: 'FDP_UCT', clause: '11.16', nameFa: 'حفاظت از محرمانگی انتقال داده کاربر بین TSFها' },
      { code: 'FDP_UIT', clause: '11.17', nameFa: 'حفاظت از یکپارچگی انتقال داده کاربر بین TSFها' },
    ],
  },
  {
    classCode: 'FIA', classNameFa: 'شناسایی و احراز هویت', clause: '12', families: [
      { code: 'FIA_AFL', clause: '12.3', nameFa: 'مدیریت شکست‌های احراز هویت' },
      { code: 'FIA_API', clause: '12.4', nameFa: 'اثبات هویت در فرایند احراز هویت' },
      { code: 'FIA_ATD', clause: '12.5', nameFa: 'تعریف ویژگی‌های کاربر' },
      { code: 'FIA_SOS', clause: '12.6', nameFa: 'مشخص‌سازی و کنترل اسرار احراز هویت' },
      { code: 'FIA_UAU', clause: '12.7', nameFa: 'احراز هویت کاربر' },
      { code: 'FIA_UID', clause: '12.8', nameFa: 'شناسایی کاربر' },
      { code: 'FIA_USB', clause: '12.9', nameFa: 'پیوند کاربر و موضوع امنیتی' },
    ],
  },
  {
    classCode: 'FMT', classNameFa: 'مدیریت امنیت', clause: '13', families: [
      { code: 'FMT_LIM', clause: '13.3', nameFa: 'محدودسازی قابلیت‌ها و دسترس‌پذیری' },
      { code: 'FMT_MOF', clause: '13.4', nameFa: 'مدیریت رفتار توابع امنیتی TSF' },
      { code: 'FMT_MSA', clause: '13.5', nameFa: 'مدیریت ویژگی‌های امنیتی' },
      { code: 'FMT_MTD', clause: '13.6', nameFa: 'مدیریت داده‌های TSF' },
      { code: 'FMT_REV', clause: '13.7', nameFa: 'ابطال مجوزها و ویژگی‌های امنیتی' },
      { code: 'FMT_SAE', clause: '13.8', nameFa: 'انقضای ویژگی‌های امنیتی' },
      { code: 'FMT_SMF', clause: '13.9', nameFa: 'مشخص‌سازی توابع مدیریتی' },
      { code: 'FMT_SMR', clause: '13.10', nameFa: 'نقش‌های مدیریت امنیت' },
    ],
  },
  {
    classCode: 'FPR', classNameFa: 'حریم خصوصی', clause: '14', families: [
      { code: 'FPR_ANO', clause: '14.3', nameFa: 'ناشناس‌بودن' },
      { code: 'FPR_PSE', clause: '14.4', nameFa: 'استفاده از نام مستعار' },
      { code: 'FPR_UNL', clause: '14.5', nameFa: 'غیرقابل‌پیوند بودن فعالیت‌ها' },
      { code: 'FPR_UNO', clause: '14.6', nameFa: 'غیرقابل‌مشاهده بودن فعالیت‌ها' },
    ],
  },
  {
    classCode: 'FPT', classNameFa: 'حفاظت از TSF', clause: '15', families: [
      { code: 'FPT_EMS', clause: '15.3', nameFa: 'کنترل نشت و انتشار ناخواسته داده از TOE' },
      { code: 'FPT_FLS', clause: '15.4', nameFa: 'حفظ حالت امن در هنگام خطا' },
      { code: 'FPT_INI', clause: '15.5', nameFa: 'مقداردهی اولیه TSF' },
      { code: 'FPT_ITA', clause: '15.6', nameFa: 'دسترس‌پذیری داده‌های TSF صادرشده' },
      { code: 'FPT_ITC', clause: '15.7', nameFa: 'محرمانگی داده‌های TSF صادرشده' },
      { code: 'FPT_ITI', clause: '15.8', nameFa: 'یکپارچگی داده‌های TSF صادرشده' },
      { code: 'FPT_ITT', clause: '15.9', nameFa: 'حفاظت از انتقال داخلی داده‌های TSF در TOE' },
      { code: 'FPT_PHP', clause: '15.10', nameFa: 'حفاظت فیزیکی TSF' },
      { code: 'FPT_RCV', clause: '15.11', nameFa: 'بازیابی مورد اعتماد' },
      { code: 'FPT_RPL', clause: '15.12', nameFa: 'تشخیص حمله بازپخش' },
      { code: 'FPT_SSP', clause: '15.13', nameFa: 'پروتکل همگامی وضعیت' },
      { code: 'FPT_STM', clause: '15.14', nameFa: 'مهر زمانی و منبع زمان قابل اعتماد' },
      { code: 'FPT_TDC', clause: '15.15', nameFa: 'سازگاری داده‌های TSF میان TSFها' },
      { code: 'FPT_TEE', clause: '15.16', nameFa: 'آزمون موجودیت‌های خارجی' },
      { code: 'FPT_TRC', clause: '15.17', nameFa: 'سازگاری تکثیر داده‌های TSF در داخل TOE' },
      { code: 'FPT_TST', clause: '15.18', nameFa: 'خودآزمایی TSF' },
    ],
  },
  {
    classCode: 'FRU', classNameFa: 'استفاده از منابع', clause: '16', families: [
      { code: 'FRU_FLT', clause: '16.3', nameFa: 'تحمل خطا' },
      { code: 'FRU_PRS', clause: '16.4', nameFa: 'اولویت ارائه خدمت' },
      { code: 'FRU_RSA', clause: '16.5', nameFa: 'تخصیص منابع' },
    ],
  },
  {
    classCode: 'FTA', classNameFa: 'دسترسی به TOE', clause: '17', families: [
      { code: 'FTA_LSA', clause: '17.3', nameFa: 'محدودسازی دامنه ویژگی‌های قابل انتخاب' },
      { code: 'FTA_MCS', clause: '17.4', nameFa: 'محدودسازی نشست‌های همزمان' },
      { code: 'FTA_SSL', clause: '17.5', nameFa: 'قفل و خاتمه نشست' },
      { code: 'FTA_TAB', clause: '17.6', nameFa: 'بنرها و پیام‌های دسترسی TOE' },
      { code: 'FTA_TAH', clause: '17.7', nameFa: 'سابقه دسترسی به TOE' },
      { code: 'FTA_TSE', clause: '17.8', nameFa: 'برقراری نشست TOE' },
    ],
  },
  {
    classCode: 'FTP', classNameFa: 'مسیرها و کانال‌های مورد اعتماد', clause: '18', families: [
      { code: 'FTP_ITC', clause: '18.3', nameFa: 'کانال مورد اعتماد بین TSFها' },
      { code: 'FTP_PRO', clause: '18.4', nameFa: 'پروتکل کانال مورد اعتماد' },
      { code: 'FTP_TRP', clause: '18.5', nameFa: 'مسیر مورد اعتماد' },
    ],
  },
];

/**
 * Historical result marks visible in the supplied legacy ISO/IEC 15408 report
 * screenshots. They are carried only as legacy evidence and are not treated as
 * a 2026 conformance claim without revalidation.
 */
export const iso15408LegacyBaseFamilyResults = {
  pass: [
    'FAU_GEN','FAU_STG','FAU_SAR','FAU_SEL','FCS_CKM','FCS_COP','FIA_AFL','FIA_UAU','FIA_ATD','FIA_UID','FIA_USB',
    'FRU_FLT','FDP_RIP','FDP_ITC','FMT_MOF','FMT_MTD','FMT_SMF','FMT_SMR','FMT_MSA','FPT_FLS','FPT_TDC','FPT_STM',
    'FTA_SSL','FTA_MCS','FTA_TAH','FTA_TSE','FDP_ETC','FDP_SDI','FDP_ACC','FDP_ACF',
  ],
  fail: ['FTP_TRP','FPT_ITT'],
};

export const iso15408LegacyExtendedRequirements = [
  // These codes preserve the spelling/punctuation visible in the supplied legacy screenshots.
  { code: 'FCS-TLSS_EXT', legacyResult: 'PASS', noteFa: 'الزام توسعه‌یافته مشاهده‌شده در مستند مبنا؛ خارج از کاتالوگ پایه ISO/IEC 15408-2:2026.' },
  { code: 'FCS-TLSC_EXT', legacyResult: 'PASS', noteFa: 'الزام توسعه‌یافته مشاهده‌شده در مستند مبنا؛ خارج از کاتالوگ پایه ISO/IEC 15408-2:2026.' },
  { code: 'FIA_PMG_EXT', legacyResult: 'PASS', noteFa: 'الزام توسعه‌یافته مشاهده‌شده در مستند مبنا؛ خارج از کاتالوگ پایه ISO/IEC 15408-2:2026.' },
  { code: 'FPT_TUD_EXT', legacyResult: 'PASS', noteFa: 'الزام توسعه‌یافته مشاهده‌شده در مستند مبنا؛ خارج از کاتالوگ پایه ISO/IEC 15408-2:2026.' },
  { code: 'FCS_HTTPS_EXT', legacyResult: 'PASS', noteFa: 'الزام توسعه‌یافته مشاهده‌شده در مستند مبنا؛ خارج از کاتالوگ پایه ISO/IEC 15408-2:2026.' },
  { code: 'FCS-DTLS_EXT', legacyResult: 'PASS', noteFa: 'الزام توسعه‌یافته مشاهده‌شده در مستند مبنا؛ خارج از کاتالوگ پایه ISO/IEC 15408-2:2026.' },
];

export const iso15408_2026StandardsResearchAudit = {
  verifiedAsCurrentOn: '2026-09-05',
  part2Status: 'Published',
  part2PublicationDate: '2026-05-19',
  part2Supersedes: 'ISO/IEC 15408-2:2022',
  familyCount: 74,
  classCount: 11,
  legacyScreenshotBasePassCount: 30,
  legacyScreenshotBaseFailCount: 2,
  legacyScreenshotExtendedPassCount: 6,
  basis: 'ISO/IEC 15408-2:2026 published catalogue / table of contents and ISO current-edition records for Parts 1–5.',
};

/**
 * Items observed in the source that may look unusual but are intentionally not
 * changed without source-owner approval. This object is not rendered in the report.
 */
export const sourceTranscriptionAudit = {
  verifiedAgainstScreenshots: true,
  verifiedPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  preservedSourceAnomalies: [
    'Tester row 2 assessment-end date is shown as ۱۳۴۸/۱۰/۱۱ in the supplied source.',
    'The English copyright block visibly contains joined words: 2024Corporation, orreduced, tothe, orthe, toCorporation.',
    'The test-result source sentence says «یکی از ۴ حالت» while five result states are visibly listed; this source-side inconsistency is preserved.',
    'The legacy ISO 15408 screenshots visibly use hyphenated spellings FCS-TLSS_EXT, FCS-TLSC_EXT and FCS-DTLS_EXT; those source spellings are preserved in the legacy table.',
  ],
};
