# الدليل المعماري والتقني التفصيلي لإعدادات النظام وواجهات البرمجة وبوابة التتبع
## Exhaustive Engineering Specification: Settings, Profiles, Customization, Notifications, Full REST API Catalog & RepairTracking Portal

---

## 1. التوثيق الشامل لإعدادات التطبيق والشركة والبروفايل والتخصيص

### 1.1 إعدادات الشركة والفروع (Company & Locations Module - `/company` & `/location`)

```mermaid
classDiagram
    class Company {
        +ObjectId _id
        +String name "Fix"
        +String legalName "Fix Repair Services UG"
        +String vatId "DE318492011"
        +String taxNumber "37/241/01928"
        +String eInvoiceId "04011000-12345-67"
        +String currency "EUR"
        +String timezone "Europe/Berlin"
        +Address address
        +BankDetails bank
        +String logoUrl
        +PlanSubscription plan
    }

    class Location {
        +ObjectId _id
        +ObjectId companyId
        +String name "Berlin Branch"
        +String code "BER-01"
        +String phone "159063277666"
        +String email "daser46507@drtall.com"
        +Address physicalAddress
        +Boolean isMainStore
        +OpeningHours schedule
    }

    class BankDetails {
        +String iban "DE89370400440532013000"
        +String bic "COBADEFFXXX"
        +String bankName "Commerzbank AG"
    }

    Company "1" *-- "many" Location : operates
    Company "1" *-- "1" BankDetails : banking
```

#### الحقول والبيانات التفصيلية:
1. **الملف التعريفي للشركة (Master Company Profile)**:
   - **الاسم التجاري (Commercial Name)**: `Fix`
   - **الشكل القانوني (Legal Form)**: `UG (haftungsbeschränkt) / GmbH / Einzelunternehmen`
   - **الرقم الضريبي (Steuernummer)**: نسق ألماني موحد (`37/241/01928`)
   - **الرقم الضريبي الأوروبي (USt-IdNr / EU VAT)**: نسق معتمد (`DE318492011`)
   - **معرف الفاتورة الإلكترونية (Leitweg-ID / Peppol)**: للتعامل مع القطاع الحكومي B2G (`04011000-12345-67`)
   - **العملة والنطاق الزمني**: `EUR (€)`، النطاق `Europe/Berlin`، وتنسيق الأرقام بفاصلة عشرية أوروبية (مثال: `149,00 €`).
2. **البيانات المصرفية الرسمية (Bank Account Details)**:
   - **رقم الحساب الدولي (IBAN)**: مع التحقق الحسابي المسبق من صحة الرقم (Mod-97 Check).
   - **رمز السويفت (BIC/SWIFT)**: 8 أو 11 حرفاً.
   - **اسم المصرف (Bank Name)**: يُطبع تلقائياً في تذييل الفواتير وعروض الأسعار مع كود QR للتحويل الفوري (EPC GiroCode).
3. **إدارة الفروع والمواقع (`/location`)**:
   - كل منشأة تدعم إنشاء فروع غير محدودة.
   - لكل فرع: عنوان فيزيائي، مخزن محلي منفصل، رقم هاتف مباشر، وصندوق نقدية يومي مستقل (Kassenbuch Register).

---

### 1.2 الملف الشخصي للمستخدم والأمان (User Profile & 2FA - `/profile`)

يضم الملف الشخصي تبويبين رئيسيين:

#### التبويب الأول: اللغة والمنطقة (Language & Region)
- **اسم العرض والصورة**: تعديل الاسم الأول، اسم العائلة، والمسمى الوظيفي (Position).
- **الدور الإداري (System Role)**: `OWNER` (مالك المنشأة بصلاحيات مطلقة).
- **اللغة المفضلة**: تدعم الإنجليزية والألمانية والفرنسية (`en`, `de`, `fr`).
- **تنسيق التاريخ والوقت**:
  - التاريخ: `DD.MM.YYYY` (المعيار الأوروبي).
  - الوقت: `24-hour format` (نظام الـ 24 ساعة العسكري).

#### التبويب الثاني: كلمة المرور والأمان والمصادقة الثنائية (Password & Security)
- **تغيير كلمة المرور**: حقول كلمة المرور الحالية، كلمة المرور الجديدة، وتأكيدها.
- **المصادقة الثنائية (Two-Factor Authentication - 2FA)**:
  1. **البريد الموثوق (Trusted E-Mail)**: زر تبديل (Switch) لإرسال رمز OTP من 6 أرقام عند تسجيل الدخول من جهاز جديد.
  2. **تطبيقات المصادقة (Authenticator App - TOTP)**: زر تبديل لتوليد مفتاح سرّي ورمز QR متوافق مع Google Authenticator و Authy (RFC 6238).

---

### 1.3 محرك التخصيص والمظهر (UI Customization & Themes)

يدعم النظام 8 سمات لونية مسبقة الإعداد يتم تطبيقها لحظياً عبر تعديل متغيرات CSS Root Tokens:

```css
/* CSS Theme Customization Tokens */
:root {
  --rc-primary: #2589f6;             /* اللون الأساسي للأزرار والحالات النشطة */
  --rc-primary-hover: #1e7cd2;       /* حالة التمرير */
  --rc-primary-light: #e5f2ff;       /* خلفية الحقول النشطة والشارات */
  --rc-sidebar-bg: #343655;          /* شريط التنقل الجانبي الأيقوني */
  --rc-surface: #ffffff;             /* البطاقات والقوائم المنبثقة */
  --rc-canvas-bg: #f0f3f7;           /* خلفية لوحة العمل الرئيسية */
  --rc-border: #dee3e8;              /* خطوط الفصل والحدود */
  --rc-status-booked: #f5a623;       /* شارة الأجهزة المستلمة حديثاً */
  --rc-status-progress: #2589f6;     /* شارة الصيانة الجارية */
  --rc-status-ready: #22c55e;        /* شارة الجاهز للتسليم */
  --rc-status-delivered: #8b98aa;    /* شارة الأجهزة المسلمة */
}
```

---

### 1.4 درج الإشعارات المباشر (Real-Time Notifications & Preferences)

- **جرس التنبيهات في الشريط العلوي (`/notification/user/:userId`)**:
  - يعرض قائمة منسدلة بالإشعارات اللحظية غير المقروءة، مقسمة حسب النوع (أمر صيانة جديد، سداد فاتورة، موافقة عميل على عرض سعر).
  - يحتوي على زر "تحديد الكل كمقروء" ومؤشر زمني نسبي (مثل: "منذ 10 دقائق").
- **درج إعدادات الإشعارات المنزلق (Notification Settings Drawer)**:
  - ينزلق من الطرف الأيمن للشاشة ويتيح ضبط قنوات التنبيه لكل حدث:
    | الحدث (Event Trigger) | إشعار النظام (In-App) | البريد الإلكتروني (Email) | التنبيه الصوتي (Sound) | رسالة SMS |
    |:---|:---:|:---:|:---:|:---:|
    | استلام جهاز صيانة جديد (New Job Intake) | ✔ | ✔ | ✔ | ✖ |
    | تغيير حالة الصيانة (Job Status Changed) | ✔ | ✖ | ✖ | ✖ |
    | موافقة العميل على عرض السعر (Quote Approved)| ✔ | ✔ | ✔ | ✖ |
    | سداد فاتورة صيانة (Invoice Paid) | ✔ | ✔ | ✖ | ✖ |
    | انخفاض رصيد قطعة غيار عن حد الطلب (Low Stock)| ✔ | ✔ | ✖ | ✖ |
    | رسالة جديدة من العميل عبر RepairTracking | ✔ | ✔ | ✔ | ✔ |

---

### 1.5 صفحات إعدادات المنظومة (Settings Pages Deep-Dive)

1. **الإعدادات العامة (`/general-setting-page`)**:
   - مواعيد العمل الرسمية، وفترة الضمان الافتراضية (Default Warranty: 180 Days)، وإعدادات الأرقام العشرية.
2. **إعدادات الملصقات والباركود (`/labelsettings`)**:
   - تحديد نوع الطابعة: طابعات الملصقات الحرارية (Zebra ZPL, Dymo, Brother) أو ورق ملصقات مكتبي A4.
   - مقاس الملصق: `50x25mm` أو `60x30mm`.
   - محتويات ملصق الجهاز: باركود رقم الصيانة (Code 128)، اسم العميل، موديل الجهاز، رمز القفل، وتاريخ الاستحقاق.
3. **إعدادات الإيصالات ونماذج الطباعة (`/receiptssettings/*`)**:
   - إيصال الاستلام A4 (Job Receipt): شروط الخدمة القانونية، خانة توقيع العميل، والتحذير من فقدان البيانات.
   - إيصال الكاشير الحراري (POS Thermal Receipt 80mm / 58mm): كود ESC/POS، بيانات الـ TSE الضريبية، وكود QR للـ GiroCode.
   - تقرير الفحص الفني (Service Report): جدول الفحص (Checklist) والملاحظات الهندسية.
   - تسلسل الترقيم (`/settings/receipt-numbering`): تخصيص البادئة والترقيم التلقائي للفواتير والطلبات (`JOB-{YYYY}-{SEQ}`).
4. **سير العمل والحالات المخصصة (`/statussettings`)**:
   - تخصيص ألوان ومسميات مراحل خط الأنابيب، وتحديد الحالة الافتراضية، وربط التحولات بإجراءات خلفية آلية.
5. **طرق الدفع (`/paymentmethods`)**:
   - تفعيل الدفع النقدي (مرتبط بالكاشير)، أجهزة نقاط البيع (SumUp, Zettle)، وبوابة الدفع الإلكتروني Ultimate FastPAY عبر Stripe.
6. **دليل الأجهزة والماركات (`/brand-models`)**:
   - إدارة شجرة الأجهزة (فئات: هواتف، أجهزة لوحية، حواسيب محمولة -> ماركات: Apple, Samsung -> موديلات: iPhone 15 Pro, S24 Ultra).
7. **بوابة العملاء والدعم الذاتي (`/customerportal`)**:
   - تخصيص الرابط الفرعي للورشة (`https://tracking.repaircms.com/:portalSlug`)، الشعار، أوقات الدوام، وتفعيل خيارات الموافقة الرقمية على عروض الأسعار والدفع الإلكتروني.

---

## 2. التوثيق الشامل لتوكينات المصادقة وترويسات الطلبات والردود لكافة واجهات الـ API

### 2.1 بنية ترويسات المصادقة وتوكن JWT (Authentication & Token Schema)

تعتمد كافة واجهات البرمجة الخلفية على معيار **JSON Web Token (RFC 7519)**:
- **ترويسة الطلب الإلزامية**:
  ```http
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YWVjZmMyZTI0NGYzZWM2N2U5MmRkMDEiLCJjb21wYW55SWQiOiI2YWVjZmMyZTI0NGYzZWM2N2U5MmRkMTAiLCJsb2NhdGlvbklkIjoiNmFlY2ZjMmUyNDRmM2VjNjdlOTJkZDIwIiwicm9sZSI6Ik9XTkVSIiwiZW50aXRsZW1lbnRzIjpbIlBST0NVUkVNRU5UIiwiQjJCX1BPUlRBTiIsIlBPU19DQVNIQk9PSyJdLCJpYXQiOjE3MzA4NDc5MzcsImV4cCI6MTczMDkzNDMzN30.signature
  Content-Type: application/json
  X-Location-ID: 6aecfc2e244f3ec67e92dd20
  ```
- **حقول التوكن (Decoded JWT Payload)**:
  ```json
  {
    "sub": "6aecfc2e244f3ec67e92dd01",
    "companyId": "6aecfc2e244f3ec67e92dd10",
    "locationId": "6aecfc2e244f3ec67e92dd20",
    "role": "OWNER",
    "email": "daser46507@drtall.com",
    "entitlements": ["PROCUREMENT", "B2B_PORTAL", "POS_CASHBOOK"],
    "iat": 1730847937,
    "exp": 1730934337
  }
  ```

---

### 2.2 دليل عقود الـ API الكاملة (Request / Response Payloads)

#### 1. استرجاع بيانات الملف الشخصي (User Profile)
- **الطلب**: `GET https://api-p.repaircms.com/user/{userId}`
- **الترويسات**: `Authorization: Bearer <token>`
- **رد الخادم (Response 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6aecfc2e244f3ec67e92dd01",
      "companyId": "6aecfc2e244f3ec67e92dd10",
      "name": "mini laptop",
      "firstName": "Mini",
      "lastName": "Laptop",
      "email": "daser46507@drtall.com",
      "role": "OWNER",
      "language": "en",
      "currency": "EUR",
      "timezone": "Europe/Berlin",
      "dateFormat": "DD.MM.YYYY",
      "timeFormat": "24h",
      "security": {
        "twoFactorEmail": false,
        "twoFactorApp": false
      }
    }
  }
  ```

#### 2. استرجاع بيانات الشركة (Company Profile)
- **الطلب**: `GET https://api-p.repaircms.com/company/user/{userId}`
- **رد الخادم (Response 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6aecfc2e244f3ec67e92dd39",
      "name": "Fix",
      "legalName": "Fix Repair Services UG",
      "vatId": "DE318492011",
      "taxNumber": "37/241/01928",
      "leitwegId": "04011000-12345-67",
      "currency": "EUR",
      "street": "Frankfurter Allee 53",
      "zipCode": "13357",
      "city": "berlin",
      "country": "Germany",
      "email": "daser46507@drtall.com",
      "phone": "159063277666",
      "planType": "TRIAL",
      "trialDaysRemaining": 14
    }
  }
  ```

#### 3. استعلام جدول وإحصائيات الصيانة (Jobs Overview)
- **الطلب**: `GET https://api-p.repaircms.com/job/user/complete/{userId}?page=1&limit=25&status=BOOKED&search=380468`
- **رد الخادم (Response 200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "6aecfdb1244f3ec67e92e307",
        "jobNumber": "380468",
        "trackingCode": "c66f53d99abd4c6b",
        "status": "BOOKED",
        "priority": "NORMAL",
        "customer": {
          "contactId": "6aecfd98244f3ec67e92e2d7",
          "displayName": "TEST TEST",
          "phone": "159063277666",
          "email": "daser46507@drtall.com"
        },
        "device": {
          "deviceType": "SMARTPHONE",
          "brand": "Apple",
          "model": "iPhone 15 Pro",
          "imei": "352099001761482",
          "color": "Titanium",
          "passcode": "1988"
        },
        "defect": {
          "customerReportedDefect": "Broken front OLED display, touch unresponsive",
          "technicianFindings": "Digitizer cracked"
        },
        "financials": {
          "totalGross": 189.00,
          "paidAmount": 50.00,
          "remainingBalance": 139.00
        },
        "createdAt": "2026-11-05T23:05:37.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 1,
      "totalPages": 1
    },
    "meta": {
      "statusSummary": {
        "BOOKED": 1,
        "IN_PROGRESS": 0,
        "READY_FOR_PICKUP": 0
      }
    }
  }
  ```

#### 4. إنشاء أمر صيانة جديد (Create Job Order)
- **الطلب**: `POST https://api-p.repaircms.com/job`
- **شحنة البيانات المرسلة (Request Body JSON)**:
  ```json
  {
    "userId": "6aecfc2e244f3ec67e92dd01",
    "companyId": "6aecfc2e244f3ec67e92dd10",
    "locationId": "6aecfc2e244f3ec67e92dd20",
    "customer": {
      "firstName": "Ahmet",
      "lastName": "Yilmaz",
      "phone": "+4917611223344",
      "email": "ahmet@example.de",
      "isBusiness": false
    },
    "device": {
      "deviceType": "SMARTPHONE",
      "brand": "Apple",
      "model": "iPhone 14 Pro",
      "imei": "354928110948215",
      "passcode": "1234",
      "accessories": ["Protective Case"]
    },
    "defect": {
      "customerReportedDefect": "Battery drains rapidly and device overheats",
      "checklist": [
        { "name": "Display & Touchscreen", "status": "PASS" },
        { "name": "Battery Health", "status": "FAIL", "notes": "Capacity at 68%" }
      ]
    },
    "priority": "HIGH",
    "dueAt": "2026-11-08T18:00:00.000Z"
  }
  ```
- **رد الخادم (Response 201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6aecff01244f3ec67e92e599",
      "jobNumber": "380469",
      "trackingCode": "a1b2c3d4e5f67890",
      "status": "BOOKED"
    },
    "message": "Job #380469 created successfully"
  }
  ```

#### 5. ترحيل حالة الطلب في آلة الحالات (Transition Status)
- **الطلب**: `PATCH https://api-p.repaircms.com/job/{jobId}/status`
- **شحنة البيانات المرسلة (Request Body JSON)**:
  ```json
  {
    "nextStatus": "READY_FOR_PICKUP",
    "changedByUserId": "6aecfc2e244f3ec67e92dd01",
    "comment": "Screen replacement complete, QA testing passed",
    "notifyCustomer": true,
    "notificationChannel": "SMS"
  }
  ```
- **رد الخادم (Response 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6aecfdb1244f3ec67e92e307",
      "jobNumber": "380468",
      "status": "READY_FOR_PICKUP",
      "completedAt": "2026-11-06T00:45:00.000Z"
    },
    "message": "Job #380468 transitioned to READY_FOR_PICKUP"
  }
  ```

#### 6. إشعار رسائل SMS التلقائية (Seven.io Integration)
- **الطلب**: `POST https://api-p.repaircms.com/integrations/sms/send`
- **شحنة البيانات المرسلة (Request Body JSON)**:
  ```json
  {
    "to": "+49159063277666",
    "text": "Dear customer, your device repair #380468 at Fix is completed and ready for pickup!",
    "from": "FixBerlin"
  }
  ```
- **رد الخادم (Response 200 OK)**:
  ```json
  {
    "success": true,
    "smsId": "7io_msg_98412894",
    "cost": 0.075,
    "currency": "EUR"
  }
  ```

---

## 3. المعمارية الهندسية لبوابة تتبع العملاء المستقلة (RepairTracking Portal)

### 3.1 هيكل الروابط وآلية التحقق الصارمة (Public Tracking Architecture)

بوابة التتبع المفتوحة للجمهور تعمل كخدمة ويب منفصلة على النطاق:
`https://tracking.repaircms.com/:portalSlug` (مثال المنشأة الحالية: `https://tracking.repaircms.com/pMOoTOxoDa`)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as العميل النهائي (Customer)
    participant Portal as بوابة التتبع (tracking.repaircms.com)
    participant Gateway as API Gateway (api-p.repaircms.com)
    participant Database as قاعدة البيانات (MongoDB Replica)

    Customer->>Portal: زيارة الرابط المطبوع على الإيصال أو SMS
    Note over Portal: التحقق من كود المنشأة pMOoTOxoDa
    Portal->>Customer: عرض صفحة الدخول مع شعار وعنوان ورشة Fix
    Customer->>Portal: إدخال كود التتبع المكون من 16 خانة (c66f53d99abd4c6b)
    Note over Portal: التحقق الرياضي: ^[0-9a-fA-F]{16}$
    Portal->>Gateway: POST /tracking/verify-job { slug, trackingId }
    Gateway->>Database: استعلام JobModel.findOne({ trackingCode: trackingId })
    Database-->>Gateway: كائن الصيانة المجرد من البيانات الحساسة
    Gateway-->>Portal: شحنة بيانات العرض العامة (Sanitized Payload)
    Portal->>Customer: عرض شريط المراحل الحية، صور العطل، وزر الموافقة والدفع
```

### 3.2 مواصفات أمان كود التتبع (The 16-Hex Tracking Token Invariant)
- أثبت الفحص الحي لواجهة تسجيل التتبع أن المنظومة تفرض قيد تحقق برمجي صارم:
  `Please enter the 16-character job tracking ID (0-9, A-F).`
- **التحليل الأمني والمعماري**:
  - يتكون الكود من 16 حرفاً ست عشرياً (64 بت من العشوائية / Cryptographic Entropy).
  - يمنع هجمات التخمين التتابعي (Sequential Enumeration Attacks) التي قد تحدث لو كان التتبع يعتمد على رقم الصيانة فقط مثل `#380468`.
  - **حجب البيانات الحساسة (Zero-PII Exposure)**: لا يُعاد للعميل أي تفاصيل حساسة (مثل عنوان الإقامة الكامل أو الإيميل الداخلي أو تكلفة شراء القطع Net Cost) لحماية خصوصية العميل وسرية تكاليف الورشة.

### 3.3 المكونات التفاعلية داخل صفحة التتبع
1. **شريط المراحل الحركي (Interactive Stepper Pipeline)**:
   مؤشر يوضح المرحلة الفعلية للجهاز (تم الاستلام -> قيد الفحص -> بانتظار الموافقة -> قيد الصيانة -> جاهز للاستلام -> تم التسليم).
2. **نافذة عروض الأسعار والتوقيع الرقمي (Quotation Approval & Signature Canvas)**:
   إذا كان الجهاز في حالة `QUOTATION_SENT`، يظهر للعميل زر لعرض تفاصيل القطع والأجور مع لوحة توقيع إلكترونية تعمل باللمس (HTML5 Canvas Signature)، أو إمكانية رفض العرض مع كتابة السبب.
3. **الدفع الإلكتروني اللحظي (Instant Checkout via Ultimate FastPAY)**:
   تضمين واجهة Stripe Elements المصغرة للسماح للعميل بسداد الفاتورة أو الدفعة المقدمة عبر بطاقة الائتمان أو Apple Pay / Google Pay مباشرة من هاتفه.
4. **المحادثة المباشرة مع الفني (Direct Workshop Chat)**:
   قناة تواصل فورية تتيح للعميل كتابة استفسار يظهر مباشرة في درج إشعارات الفني المسؤول عن الجهاز.

---

## 4. تقييم خبير المعماريات البرمجية (Senior Principal Architect's Appraisal)

بصفتي خبيراً متخصصاً في هندسة البرمجيات السحابية والأنظمة الموزعة، أقدم هذا التقييم الفني المعمق لمنظومة RepairCMS:

### 4.1 نقاط القوة المعمارية (Architectural Merits)
1. **نمذجة ممتازة لبيانات مجال الصيانة (Domain Data Modeling)**:
   استيعاب كافة متطلبات قطاع صيانة الأجهزة المعقدة (أكواد القفل، أنماط القفل 3x3، قائمة الفحص الفني، مطابقة أرقام IMEI عبر خوارزمية Luhn، وحسابات الهوامش الربحية التلقائية).
2. **الامتثال المالي الصارم للقوانين الأوروبية (European Fiscal Compliance)**:
   تطبيق معايير KassenSichV الألمانية عبر الربط مع أجهزة TSE لحماية الكاشير من التلاعب، وتوليد الفواتير الإلكترونية ZUGFeRD 2.3 المتوافقة مع EN 16931.
3. **عزل منطقي متين للبيانات (Multi-Tenancy Indexing)**:
   الفهرسة المركبة على `{ companyId: 1, ... }` تضمن بقاء الاستعلامات محصورة ضمن حدود المستأجر الواحد بسرعة استجابة تقل عن 50ms.

### 4.2 الثغرات الهندسية والديون التقنية (Critical Technical Debt & Bottlenecks)
1. **الحزمة البرمجية الثقيلة (Monolithic Bundle Splitting)**:
   الحزمة الأساسية للواجهة الأمامية بحجم `537 KB` (Gzipped) مقسمة إلى أكثر من 75 ملف Chunk ديناميكي. هذا يسبب بطئاً ملحوظاً (Cold-Start Latency) عند تشغيل النظام على أجهزة تابلت متواضعة داخل ورش الصيانة.
   - **الحل الهندسي الموصى به**: إعادة تقسيم الكود (Code Splitting) القائم على المسارات (Route-Based Dynamic Imports) وتطبيق Prefetching للمسارات الأكثر استخداماً فقط.
2. **تضارب نمط تسمية نقاط النهاية (API Naming Inconsistency)**:
   النظام يخلط بين نمط الـ REST القياسي القائم على الموارد (مثل `/contacts`, `/job/:jobId`) ونمط الـ RPC القديم المرتبط بالمستخدم (مثل `/job/user/complete/:userId`, `/stock-entry/get-stock-value/:userId`).
   - **الحل الهندسي الموصى به**: توحيد المعمارية لتكون Resource-Oriented بالكامل مع تمرير سياق المستأجر في الترويسات (Headers) وليس في مسار الـ URL.
3. **شلال الطلبات المتتالية عند بدء التشغيل (Waterfall Request Bottleneck)**:
   عند تسجيل دخول الفني، تُطلق الواجهة الأمامية ما يزيد عن 12 طلب GET متزامن (`/notification`, `/quick-task`, `/device-type`, `/job-receipt`, `/invoice-receipt`, إلخ)، مما يرهق خادم الـ Node.js الخلفي.
   - **الحل الهندسي الموصى به**: بناء طبقة **BFF (Backend-For-Frontend)** أو GraphQL Gateway لتجميع هذه البيانات في طلب واحد (Single Aggregation Request: `/api/v1/bootstrap`).
4. **تأمين بوابة التتبع ضد هجمات حجب الخدمة (DDoS & Rate Limiting)**:
   نظراً لأن بوابة التتبع مفتوحة للجمهور، يجب تطبيق قيود استخدام صارمة عبر Redis Token Bucket بمعدل لا يتجاوز 10 محاولات لكل دقيقة لكل IP لمنع محاولات التخمين الآلي لكود الـ 16 خانة.
