# دليل إدارة المشاريع في Portfolio

## 🎯 طرق إدارة المشاريع

### 1. **روابط YouTube/Vimeo (الأسهل والمجاني)** ⭐
```typescript
{
  video_url: 'https://youtube.com/watch?v=VIDEO_ID',
  thumbnail: '/thumbnails/project1.jpg'
}
```

**المميزات:**
- ✅ مجاني تماماً
- ✅ لا يستهلك مساحة الموقع
- ✅ فيديوهات عالية الجودة
- ✅ مشاركة سهلة

**الخطوات:**
1. ارفع الفيديو على YouTube
2. انسخ الرابط
3. أضفه للمشروع في `data/projects.ts`

### 2. **رفع مباشر على الموقع (Professional)**
```typescript
{
  video_url: '/videos/project1.mp4',
  thumbnail: '/thumbnails/project1.jpg'
}
```

**المميزات:**
- ✅ تحكم كامل في العرض
- ✅ لا اعتماد على خدمات خارجية
- ✅ أداء أفضل

**الخطوات:**
1. اضغط الفيديو لتقليل الحجم (HandBrake)
2. ارفعه في `public/videos/`
3. أضف الرابط في `data/projects.ts`

### 3. **خدمات التخزين السحابي (Cloudinary/Vimeo Pro)**
```typescript
{
  video_url: 'https://vimeo.com/VIDEO_ID',
  thumbnail: 'https://cloudinary.com/image.jpg'
}
```

## 📁 هيكل الملفات

```
public/
├── videos/          # فيديوهات المشاريع (اختياري)
├── thumbnails/      # صور مصغرة للمشاريع
└── og-image.svg     # صورة المشاركة
```

## 🛠️ أدوات مفيدة

### **ضغط الفيديوهات:**
- **HandBrake** (مجاني) - لضغط MP4
- **FFmpeg** - للتحويل المتقدم

### **تحسين الصور:**
- **TinyPNG** - ضغط PNG/JPG
- **ImageOptim** - تحسين الصور

### **استضافة الفيديوهات:**
- **YouTube** (مجاني)
- **Vimeo** (مدفوع للاحترافيين)
- **Cloudinary** (حتى 25GB مجاني)

## 📝 كيفية إضافة مشروع جديد

1. **أضف المشروع في `data/projects.ts`:**
```typescript
{
  id: 'proj-5',
  title: 'اسم المشروع',
  description: 'وصف المشروع',
  category: 'commercial', // أو 'motion-design', 'video-editing', 'promotional'
  year: 2024,
  duration: 'مدة الفيديو',
  technologies: ['Premiere Pro', 'After Effects'],
  featured: true, // أو false
  sort_order: 5,
  video_url: 'رابط الفيديو',
  thumbnail: '/thumbnails/project5.jpg'
}
```

2. **أضف الصورة المصغرة:**
   - احفظ الصورة في `public/thumbnails/`
   - حجم مثالي: 400x300px

3. **ادفع التغييرات:**
```bash
git add .
git commit -m "Add new project: اسم المشروع"
git push origin main
```

## 🎯 التوصية النهائية

**للمبتدئين:** استخدم YouTube - سهل ومجاني
**للاحترافيين:** ارفع الفيديوهات مباشرة + استخدم Cloudinary للصور

## 📞 تحتاج مساعدة؟
إذا كنت بحاجة لمساعدة في رفع فيديو معين أو إعداد خدمة تخزين، قل لي!