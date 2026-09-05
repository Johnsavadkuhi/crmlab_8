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
 * Items observed in the source that may look unusual but are intentionally not
 * changed without source-owner approval. This object is not rendered in the report.
 */
export const sourceTranscriptionAudit = {
  verifiedAgainstScreenshots: true,
  verifiedPages: [1, 2, 3, 4, 5, 6, 7, 8],
  preservedSourceAnomalies: [
    'Tester row 2 assessment-end date is shown as ۱۳۴۸/۱۰/۱۱ in the supplied source.',
    'The English copyright block visibly contains joined words: 2024Corporation, orreduced, tothe, orthe, toCorporation.',
  ],
};
