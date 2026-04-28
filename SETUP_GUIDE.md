# دليل إعداد المشروع الكامل

## هيكل الملفات

```
portfolio-website/
├── app/
│   ├── admin/
│   │   └── page.tsx          ← داشبورد الإدارة
│   ├── project/[id]/
│   │   └── page.tsx          ← صفحة تفاصيل المشروع
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              ← الصفحة الرئيسية
├── components/
│   ├── Navigation.tsx
│   ├── Hero.tsx              ← يقرأ الإحصائيات من Supabase
│   ├── Portfolio.tsx         ← يقرأ المشاريع من Supabase
│   ├── ProjectCard.tsx
│   ├── Contact.tsx           ← يقرأ التواصل من Supabase
│   └── Footer.tsx
├── data/
│   └── projects.ts           ← بيانات احتياطية محلية
├── lib/
│   └── supabase.ts           ← إعداد Supabase client
├── types/
│   └── index.ts              ← TypeScript interfaces
├── supabase_schema.sql       ← شغّله في Supabase SQL Editor
├── .env.local.example        ← انسخه إلى .env.local
└── package.json
```

---

## خطوات الإعداد

### 1. إنشاء مشروع Supabase
- اذهب إلى https://supabase.com → New Project
- انتظر ~2 دقيقة حتى يتم الإنشاء

### 2. تشغيل قاعدة البيانات
- في Supabase → SQL Editor → New Query
- انسخ محتوى `supabase_schema.sql` والصقه واضغط Run ✅

### 3. الحصول على مفاتيح API
- في Supabase → Settings → API
- انسخ: Project URL، anon public key، service_role secret

### 4. إعداد ملف البيئة
```bash
cp .env.local.example .env.local
```
ثم عدّل `.env.local` بمفاتيحك الحقيقية واختر كلمة سر للداشبورد.

### 5. تثبيت المكتبات وتشغيل المشروع
```bash
npm install
npm run dev
```

### 6. الوصول للداشبورد
- الموقع: http://localhost:3000
- الداشبورد: http://localhost:3000/admin

---

## الداشبورد - التبويبات

| التبويب | ما يمكن تعديله |
|---------|----------------|
| المشاريع | إضافة / تعديل / حذف المشاريع |
| الإحصائيات | أرقام Hero (100+ مشروع، 50+ عميل...) |
| التواصل | البريد، الهاتف، الموقع، ساعات العمل |
| السوشيال ميديا | روابط Facebook, Instagram, LinkedIn, YouTube |

---

## النشر على Vercel

```bash
npm i -g vercel
vercel
```

في Vercel → Settings → Environment Variables أضف:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ADMIN_PASSWORD`

---

## ملاحظات مهمة

- لا ترفع `.env.local` على GitHub أبداً
- `NEXT_PUBLIC_ADMIN_PASSWORD` مرئية للعميل — للأمان الأعلى استخدم NextAuth لاحقاً
- `bg-gray-900` بدل `bg-black` في Tailwind v4
- كل المكونات تقرأ من Supabase أولاً، وتعود للبيانات المحلية عند الخطأ
