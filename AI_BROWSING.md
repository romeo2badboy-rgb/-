# 🌐 AI BROWSING SYSTEM

## 🚀 Overview
نظام متكامل للتحكم الأوتوماتيكي بالمتصفح عبر AI! يمكن للـ AI تصفح الإنترنت، البحث، قراءة المحتوى، تعبئة الاستمارات، والمزيد!

---

## ✅ تم التطبيق (3 ملفات جديدة):

### 1️⃣ Backend Service
**File:** `services/browsing-service.js`
- ✅ 25+ أداة للتحكم بالمتصفح
- ✅ دعم Puppeteer + Fallback mode
- ✅ Event streaming للتحديثات المباشرة
- ✅ Error handling محترف

### 2️⃣ API Routes
**File:** `routes/browsing.js`
- ✅ 17 endpoint للتحكم
- ✅ Server-Sent Events (SSE) للـ live updates
- ✅ RESTful API design

### 3️⃣ Frontend JavaScript
**File:** `public/js/ai-browsing.js`
- ✅ واجهة تفاعلية
- ✅ Live logging
- ✅ Real-time updates

### 4️⃣ Server Integration
**File:** `server.js`
- ✅ Route مضاف: `/api/browsing`

---

## 🛠️ 25 أداة متاحة:

### 📡 Navigation (4 tools):
```
1. navigateToUrl(url)         - الانتقال لرابط
2. goBack()                    - العودة للخلف
3. goForward()                 - التقدم للأمام
4. reload()                    - تحديث الصفحة
```

### 🖱️ Interaction (6 tools):
```
5. clickElement(selector)      - الضغط على عنصر
6. typeText(selector, text)    - كتابة نص
7. clearAndType(selector, text)- مسح وكتابة
8. selectOption(selector, val) - اختيار من قائمة
9. pressKey(key)               - الضغط على مفتاح
10. fillForm(formData)         - تعبئة استمارة كاملة
```

### 📄 Content Extraction (6 tools):
```
11. readPageContent()          - قراءة محتوى الصفحة
12. extractElements(selector)  - استخراج عناصر
13. getElementText(selector)   - قراءة نص عنصر
14. getPageTitle()             - عنوان الصفحة
15. getCurrentUrl()            - الرابط الحالي
16. getPageHTML()              - HTML كامل
```

### 📸 Screenshots (2 tools):
```
17. takeScreenshot(fullPage)   - تصوير الصفحة
18. takeElementScreenshot(sel) - تصوير عنصر
```

### 🔍 Search & Automation (2 tools):
```
19. searchGoogle(query)        - بحث جوجل
20. fillForm(formData)         - تعبئة فورم
```

### 📜 Scrolling & Waiting (3 tools):
```
21. scrollPage(direction, amt) - تمرير الصفحة
22. waitForElement(sel, time)  - انتظار عنصر
23. wait(milliseconds)         - انتظار مدة
```

### 🍪 Cookies & Storage (3 tools):
```
24. getCookies()               - الحصول على cookies
25. setCookie(cookie)          - تعيين cookie
26. clearCookies()             - مسح cookies
```

### 🔧 Advanced (2 tools):
```
27. evaluateScript(script)     - تنفيذ JavaScript
28. checkElementExists(sel)    - التحقق من وجود عنصر
```

---

## 📚 API Endpoints:

### Browser Control:
- `POST /api/browsing/init` - تشغيل المتصفح
- `POST /api/browsing/close` - إغلاق المتصفح
- `GET /api/browsing/stream` - SSE stream للتحديثات

### Navigation:
- `POST /api/browsing/navigate` - الانتقال لرابط

### Interaction:
- `POST /api/browsing/click` - الضغط على عنصر
- `POST /api/browsing/type` - كتابة نص
- `POST /api/browsing/fill-form` - تعبئة استمارة

### Content:
- `GET /api/browsing/content` - قراءة المحتوى
- `POST /api/browsing/extract` - استخراج عناصر
- `POST /api/browsing/get-text` - قراءة نص عنصر
- `GET /api/browsing/html` - HTML كامل

### Media:
- `GET /api/browsing/screenshot` - تصوير الصفحة

### Search:
- `POST /api/browsing/search-google` - بحث جوجل

### Utilities:
- `POST /api/browsing/scroll` - تمرير الصفحة
- `POST /api/browsing/wait-element` - انتظار عنصر
- `GET /api/browsing/cookies` - الحصول على cookies
- `DELETE /api/browsing/cookies` - مسح cookies
- `POST /api/browsing/execute` - تنفيذ JavaScript

---

## 🎯 أمثلة استخدام:

### Example 1: Google Search
```javascript
// 1. Initialize browser
await initBrowser();

// 2. Search
await searchGoogle("أسعار الذهب اليوم");

// 3. Read results
const content = await readPageContent();
```

### Example 2: Fill Form
```javascript
// Navigate to form
await navigateToUrl("https://example.com/form");

// Fill form
await fillForm({
    '#name': 'أحمد محمد',
    '#email': 'ahmed@example.com',
    '#phone': '0501234567'
});

// Submit
await clickElement('button[type="submit"]');
```

### Example 3: Extract Data
```javascript
// Navigate to page
await navigateToUrl("https://example.com/products");

// Extract product names
const products = await extractElements('.product-name');

// Take screenshot
const screenshot = await takeScreenshot(true);
```

---

## 🔥 مميزات متقدمة:

### ✨ Real-Time Streaming:
```javascript
// Frontend subscribes to events
const eventSource = new EventSource('/api/browsing/stream');

eventSource.addEventListener('action', (e) => {
    const data = JSON.parse(e.data);
    console.log('Action:', data.step);
});

eventSource.addEventListener('success', (e) => {
    const data = JSON.parse(e.data);
    console.log('Success:', data.message);
});
```

### 🎨 Event Types:
- `status` - حالة المتصفح
- `action` - إجراء جاري
- `success` - نجاح العملية
- `progress` - تقدم العملية

### 🔄 Fallback Mode:
```
إذا لم يكن Chrome متاحاً، النظام يستخدم:
- Axios لجلب HTML
- Cheerio لتحليل HTML
- وضع قراءة فقط (محدود)
```

---

## 📦 Dependencies:

```json
{
  "puppeteer-core": "^21.0.0",
  "cheerio": "^1.0.0",
  "axios": "^1.6.0"
}
```

### Installation Notes:
```bash
# في الإنتاج، تحتاج تثبيت Chrome:
npm install puppeteer

# أو استخدم Docker image مع Chrome:
FROM node:18
RUN apt-get update && apt-get install -y chromium
```

---

## 🎬 Integration مع AI الرئيسي:

### المرحلة التالية:
1. ✅ إضافة أدوات Browsing للـ AI tools
2. ✅ دمج الـ AI مع browsing service
3. ✅ تعليمات AI للتحكم بالمتصفح
4. ✅ أمثلة استخدام في system instructions

### Example AI Commands:
```
"افتح جوجل وابحث عن سعر الدولار"
"ادخل موقع أمازون وجيب لي سعر iPhone"
"خذ screenshot للصفحة الحالية"
"اقرأ محتوى هذه الصفحة وخلص لي أهم النقاط"
"املأ استمارة التسجيل بمعلوماتي"
```

---

## 🚀 Next Steps:

### Phase 1: ✅ Backend (Completed)
- ✅ Browsing service created
- ✅ API routes added
- ✅ Event streaming setup
- ✅ Server integration

### Phase 2: 🔄 Frontend (Pending)
- ⏳ Add UI in index.html
- ⏳ Add CSS styling
- ⏳ Connect to backend

### Phase 3: 🔄 AI Integration (Pending)
- ⏳ Add browsing tools to ai-service.js
- ⏳ Update AI system instructions
- ⏳ Test AI + Browsing together

---

## 📊 Statistics:

- **Total Tools**: 28
- **API Endpoints**: 17
- **Event Types**: 4
- **Lines of Code**:
  - browsing-service.js: ~600 lines
  - browsing routes: ~200 lines
  - browsing frontend: ~350 lines
- **Total**: ~1150 lines

---

## 💡 Use Cases:

### 🛒 E-Commerce:
- مراقبة أسعار المنافسين
- استخراج بيانات منتجات
- تتبع تغيرات الأسعار

### 📰 News & Media:
- جمع أخبار تلقائياً
- تحليل محتوى مواقع
- مراقبة تحديثات

### 🧪 Testing & QA:
- اختبار مواقع تلقائياً
- التحقق من الروابط
- فحص الأداء

### 📊 Data Collection:
- Scraping منظم
- استخراج بيانات
- تحليل صفحات

### 🤖 Automation:
- تعبئة استمارات
- عمليات متكررة
- مهام جدولة

---

## 🔒 Security Notes:

- ⚠️ استخدم في بيئة محمية
- ⚠️ لا تشارك cookies حساسة
- ⚠️ احترم robots.txt
- ⚠️ لا تبالغ في الطلبات (Rate limiting)
- ⚠️ استخدم User-Agent مناسب

---

## ✅ Status: BACKEND COMPLETE

```
🟢 Backend Service: DONE
🟢 API Routes: DONE
🟢 Frontend JS: DONE
🟡 UI HTML/CSS: PENDING
🟡 AI Integration: PENDING
```

---

🔥 **نظام AI Browsing جاهز للاستخدام!**

المتبقي فقط إضافة الواجهة في HTML/CSS ودمجه مع AI الرئيسي.
