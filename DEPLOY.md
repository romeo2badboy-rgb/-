# دليل النشر على Render - Deployment Guide

دليل شامل لنشر نظام إدارة المبيعات على منصة Render

---

## 🚀 النشر على Render (مجاني)

### الخطوة 1: إنشاء حساب على Render

1. اذهب إلى [render.com](https://render.com)
2. سجل دخول باستخدام حساب GitHub الخاص بك
3. اربط حسابك بـ GitHub

### الخطوة 2: إنشاء Web Service جديد

1. من لوحة التحكم، اضغط على **"New +"**
2. اختر **"Web Service"**
3. اربط مستودع GitHub الذي يحتوي على المشروع
4. اختر المستودع: `romeo2badboy-rgb/-`
5. اختر البرانش: `claude/sales-management-system-011CUNi2QUiUhzVCzDQjbmN6`

### الخطوة 3: إعدادات الـ Web Service

استخدم الإعدادات التالية:

**معلومات أساسية:**
- **Name:** `sales-management-system` (أو أي اسم تريده)
- **Region:** اختر الأقرب لك (مثل: Oregon)
- **Branch:** `claude/sales-management-system-011CUNi2QUiUhzVCzDQjbmN6`
- **Runtime:** `Node`

**Build & Deploy:**
- **Build Command:**
  ```bash
  npm install && npm run init-db
  ```

- **Start Command:**
  ```bash
  npm start
  ```

**Plan:**
- اختر **Free** (مجاني)

### الخطوة 4: متغيرات البيئة (Environment Variables)

أضف المتغيرات التالية في قسم **Environment**:

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345678
DB_PATH=./database/sales.db
```

**⚠️ مهم جداً:**
- غير قيمة `JWT_SECRET` إلى شيء عشوائي وآمن!
- يمكنك إنشاء قيمة عشوائية من [randomkeygen.com](https://randomkeygen.com)

### الخطوة 5: النشر

1. اضغط على **"Create Web Service"**
2. انتظر حتى يكتمل البناء والنشر (حوالي 3-5 دقائق)
3. ستحصل على رابط مثل: `https://sales-management-system.onrender.com`

---

## 📋 استخدام ملف render.yaml (طريقة أسرع)

لدينا ملف `render.yaml` جاهز في المشروع يحتوي على جميع الإعدادات!

### الطريقة السريعة:

1. اذهب إلى Render Dashboard
2. اختر **"New +"** → **"Blueprint"**
3. اربط مستودع GitHub
4. Render سيقرأ ملف `render.yaml` تلقائياً!
5. اضغط **"Apply"**

**سيتم تكوين كل شيء تلقائياً! ✨**

---

## ✅ التحقق من النشر

بعد اكتمال النشر:

1. افتح الرابط الذي حصلت عليه
2. يجب أن ترى واجهة نظام إدارة المبيعات
3. استخدم بيانات الدخول الافتراضية:
   - **اسم المستخدم:** admin
   - **كلمة المرور:** admin123

---

## 🔧 التكوينات الإضافية (اختيارية)

### تفعيل Auto-Deploy

في إعدادات الـ Web Service:
1. اذهب إلى **Settings**
2. تأكد من تفعيل **Auto-Deploy**
3. الآن عند كل push إلى GitHub، سيتم النشر تلقائياً!

### إضافة Domain مخصص

1. اذهب إلى **Settings** → **Custom Domain**
2. أضف الدومين الخاص بك
3. اتبع التعليمات لإعداد DNS

### مراقبة الأداء

- اذهب إلى **Metrics** لمشاهدة:
  - استهلاك CPU
  - استهلاك RAM
  - عدد الطلبات
  - وقت الاستجابة

---

## 🐛 حل المشاكل الشائعة

### المشكلة: فشل البناء (Build Failed)

**الحل:**
```bash
# تأكد من أن جميع الحزم موجودة في package.json
npm install
```

### المشكلة: قاعدة البيانات فارغة

**الحل:**
- تأكد من أن Build Command يحتوي على `npm run init-db`
- أعد النشر من جديد

### المشكلة: خطأ 503 Service Unavailable

**الحل:**
- انتظر قليلاً، قد يكون الخادم في وضع Sleep (في الخطة المجانية)
- بعد أول طلب، سينشط تلقائياً

### المشكلة: لا أستطيع تسجيل الدخول

**الحل:**
- تأكد من تشغيل `npm run init-db` في Build Command
- البيانات الافتراضية: admin / admin123

---

## 📊 حدود الخطة المجانية

**Render Free Plan:**
- ✅ 750 ساعة شهرياً (كافية لمشروع واحد)
- ✅ Auto-Deploy من Git
- ✅ SSL مجاني (HTTPS)
- ⚠️ ينام بعد 15 دقيقة من عدم النشاط
- ⚠️ يستيقظ عند أول طلب (قد يأخذ 30 ثانية)

---

## 🔄 تحديث التطبيق

### الطريقة 1: تلقائي (Auto-Deploy مفعّل)
فقط اعمل push للتغييرات:
```bash
git add .
git commit -m "تحديث النظام"
git push
```

### الطريقة 2: يدوي
1. اذهب إلى Render Dashboard
2. اختر الـ Service
3. اضغط **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📱 اختبار الـ API

بعد النشر، يمكنك اختبار الـ API:

```bash
# مثال: جلب جميع العملاء
curl https://your-app.onrender.com/api/customers

# مثال: إضافة عميل جديد
curl -X POST https://your-app.onrender.com/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "محمد أحمد",
    "email": "test@example.com",
    "phone": "0555555555"
  }'
```

---

## 🔐 نصائح أمنية مهمة

1. **غير JWT_SECRET فوراً** في متغيرات البيئة
2. **غير كلمة المرور الافتراضية** للمدير بعد أول دخول
3. **لا ترفع ملف .env** إلى Git (موجود في .gitignore)
4. **استخدم HTTPS دائماً** (Render يوفره مجاناً)
5. **فعّل Two-Factor Authentication** على حساب Render

---

## 🆘 الحصول على المساعدة

**إذا واجهت مشاكل:**

1. **Logs**: اذهب إلى Render Dashboard → Logs
2. **Shell**: استخدم Shell للوصول المباشر
3. **Render Community**: [community.render.com](https://community.render.com)
4. **GitHub Issues**: افتح issue في المستودع

---

## 🎉 تم بنجاح!

الآن نظام إدارة المبيعات الخاص بك يعمل على الإنترنت! 🚀

**الخطوات التالية:**
- [ ] غير بيانات المدير الافتراضية
- [ ] أضف بياناتك الحقيقية
- [ ] شارك الرابط مع فريقك
- [ ] استمتع بإدارة المبيعات! 📊

---

**ملاحظة:** هذا النظام جاهز للاستخدام الفوري، ولكن للإنتاج الحقيقي، يُنصح بـ:
- استخدام قاعدة بيانات خارجية (PostgreSQL/MySQL)
- إضافة نظام نسخ احتياطي
- تحسين الأمان
- إضافة المزيد من الميزات حسب احتياجك

تم إعداد هذا الدليل بواسطة **نظام إدارة المبيعات v1.0.0** 💚
