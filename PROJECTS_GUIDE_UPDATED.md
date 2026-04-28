# دليل إدارة المشاريع في Portfolio - الإصدار المحدث

## 🎯 طرق إدارة المشاريع

### 1. **Embed Codes (الأفضل للمظهر الاحترافي)** ⭐

#### **YouTube Embed:**
1. اذهب للفيديو على YouTube
2. اضغط **Share** → **Embed**
3. انسخ الكود الكامل
```html
<!-- مثال على كود الـ embed -->
<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
```

#### **Vimeo Embed:**
1. اذهب للفيديو على Vimeo
2. اضغط **Share** → **Embed**
3. انسخ الكود

#### **TikTok Embed:**
1. اذهب للفيديو على TikTok
2. اضغط **Share** → **Embed**
3. انسخ الكود

### 2. **روابط مباشرة (سهلة):**
```typescript
{
  video_url: 'https://youtube.com/watch?v=VIDEO_ID',
  thumbnail: '/thumbnails/project1.jpg'
}
```

### 3. **رفع مباشر على الموقع:**
```typescript
{
  video_url: '/videos/project1.mp4',
  thumbnail: '/thumbnails/project1.jpg'
}
```

## 📱 **المنصات التي تدعم Embed:**

| المنصة | Embed | مجاني | ملاحظات |
|--------|-------|-------|----------|
| **YouTube** | ✅ | ✅ | الأفضل للمبتدئين |
| **Vimeo** | ✅ | ⚠️ محدود | أحترافي أكثر |
| **TikTok** | ✅ | ✅ | للمحتوى القصير |
| **Behance** | ✅ | ✅ | للمشاريع التصميمية |
| **Dailymotion** | ✅ | ✅ | بديل لليوتيوب |
| **Wistia** | ✅ | ❌ | مدفوع - احترافي جداً |
| **Vidyard** | ✅ | ❌ | مدفوع - للمبيعات |

## 🛠️ **كيفية إضافة مشروع جديد**

### **للمشاريع مع Embed:**
```typescript
{
  id: 'proj-5',
  title: 'اسم المشروع',
  description: 'وصف المشروع',
  category: 'commercial',
  year: 2024,
  duration: '30 ثانية',
  technologies: ['Premiere Pro', 'After Effects'],
  featured: true,
  sort_order: 5,
  embed_code: '<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" ...></iframe>',
  thumbnail: '/thumbnails/project5.jpg'
}
```

### **للمشاريع مع روابط:**
```typescript
{
  id: 'proj-5',
  title: 'اسم المشروع',
  description: 'وصف المشروع',
  category: 'commercial',
  year: 2024,
  duration: '30 ثانية',
  technologies: ['Premiere Pro', 'After Effects'],
  featured: true,
  sort_order: 5,
  video_url: 'https://youtube.com/watch?v=VIDEO_ID',
  thumbnail: '/thumbnails/project5.jpg'
}
```

## ⚡ **نصائح للأداء:**

### **ضغط الفيديوهات:**
- **HandBrake**: ضغط MP4 بمعدل 2000-5000 kbps
- **FFmpeg**: `ffmpeg -i input.mp4 -vcodec libx264 -crf 23 output.mp4`

### **تحسين الصور:**
- **TinyPNG**: ضغط JPEG/PNG
- **أبعاد مثالية**: 400x300px للصور المصغرة

## 🎯 **التوصية النهائية:**

1. **للمبتدئين**: YouTube + Embed codes
2. **للاحترافيين**: Vimeo Pro + Embed
3. **للخصوصية**: رفع مباشر على الموقع

## 📞 **تحتاج مساعدة؟**
إذا كنت تريد مساعدة في إعداد embed لفيديو معين، أرسل لي الرابط وسأساعدك!