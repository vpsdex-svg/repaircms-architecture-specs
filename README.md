# مستودع التوثيق والمخططات الهندسية الشاملة - RepairCMS Ultimate
## Complete Engineering Documentation, Database Schemas, REST API Specifications & Visual Manuals

---

## 1. فهرس المحتويات والمستندات المحفوظة

تم جمع وتوثيق كافة جوانب النظام (المعمارية، الواجهات البرمجية، قواعد البيانات، والتصاميم) وحفظها داخل مجلد `repaircms-core`:

```
repaircms-core/
├── docs/                                  # التوثيق الهندسي الشامل والرسومات والمواصفات
│   ├── FULL_APPLICATION_MANUAL.md        # الدليل التشغيلي والشامل لكافة شاشات المنظومة (46 KB)
│   ├── API_AND_TRACKING_DEEPDIVE.md      # التوثيق التفصيلي للـ API والتوكينات وبوابة RepairTracking (25 KB)
│   ├── ENTERPRISE_ARCHITECTURE.md        # تقرير الهندسة العكسية وعزل المستأجرين والـ FSM (16 KB)
│   ├── SYSTEM_ARCHITECTURE.md            # المخطط المعماري الهيكلي للمنظومة ورسومات Mermaid (18 KB)
│   ├── openapi.yaml                      # مواصفة الـ REST API الكاملة بصيغة OpenAPI 3.1
│   ├── schemas/                          # مخططات ونماذج قواعد البيانات
│   │   ├── schema.prisma                 # مخطط PostgreSQL العلائقي الشامل (22 جدولاً، 591 سطراً)
│   │   └── mongoose-models.ts            # نماذج MongoDB Mongoose الأصلية (MERN Stack)
│   └── screenshots/                      # 66 لقطة شاشة عالية الدقة لكافة الشاشات والنوافذ
│
├── data/                                 # البيانات والسجلات الحية المستخرجة
│   ├── seed-records.json                 # سجلات الحساب الفعلية المطابقة لـ Fix Berlin (#380468)
│   ├── main.js                           # حزمة المتصفح الأصلية المحللة (537 KB)
│   └── chunks.json                       # روابط وخرائط الـ 75 Chunks المقسمة
│
└── README.md                             # هذا الفهرس المرجعي الموحد
```

---

## 2. روابط مباشرة للمستندات والملفات:

1. **الدليل الشامل للتطبيق وشاشاته (مع 66 صورة)**:
   [FULL_APPLICATION_MANUAL.md](file:///C:/Users/IT%20Munir/.gemini/antigravity/scratch/repaircms-core/docs/FULL_APPLICATION_MANUAL.md)
2. **توثيق الـ APIs، التوكينات، الإعدادات، وبوابة RepairTracking**:
   [API_AND_TRACKING_DEEPDIVE.md](file:///C:/Users/IT%20Munir/.gemini/antigravity/scratch/repaircms-core/docs/API_AND_TRACKING_DEEPDIVE.md)
3. **تقرير المعمارية المؤسسية وعزل المستأجرين**:
   [ENTERPRISE_ARCHITECTURE.md](file:///C:/Users/IT%20Munir/.gemini/antigravity/scratch/repaircms-core/docs/ENTERPRISE_ARCHITECTURE.md)
4. **المخطط الهيكلي للنظام ورسومات الـ Mermaid**:
   [SYSTEM_ARCHITECTURE.md](file:///C:/Users/IT%20Munir/.gemini/antigravity/scratch/repaircms-core/docs/SYSTEM_ARCHITECTURE.md)
5. **مواصفة الـ REST API الكاملة (OpenAPI 3.1)**:
   [openapi.yaml](file:///C:/Users/IT%20Munir/.gemini/antigravity/scratch/repaircms-core/docs/openapi.yaml)
6. **مخطط قاعدة البيانات العلائقية (Prisma ORM)**:
   [schema.prisma](file:///C:/Users/IT%20Munir/.gemini/antigravity/scratch/repaircms-core/docs/schemas/schema.prisma)
7. **نماذج قاعدة بيانات MongoDB Mongoose الأصلية**:
   [mongoose-models.ts](file:///C:/Users/IT%20Munir/.gemini/antigravity/scratch/repaircms-core/docs/schemas/mongoose-models.ts)
8. **سجلات الحساب الفعلية (Fix Berlin)**:
   [seed-records.json](file:///C:/Users/IT%20Munir/.gemini/antigravity/scratch/repaircms-core/data/seed-records.json)
9. **مجلد لقطات الشاشة الـ 66**:
   [docs/screenshots/](file:///C:/Users/IT%20Munir/.gemini/antigravity/scratch/repaircms-core/docs/screenshots/)
