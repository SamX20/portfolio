'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Project, Stat, ContactInfo, SocialLink, CATEGORIES } from '@/types';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

// ─── helpers ──────────────────────────────────────────────────────────────────
const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const inputCls =
  'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/30 transition-all';

const labelCls = 'block text-xs font-semibold text-gray-400 mb-1.5';

// ─── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (pw === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_auth', '1');
        onLogin();
      } else {
        setErr(true);
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0a0f' }}>
      <motion.div
        className="w-full max-w-sm p-8 rounded-2xl border border-white/8"
        style={{ background: 'rgba(255,255,255,0.03)' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
            تسجيل دخول لإدارة الصفحة
          </div>
          <p className="text-gray-500 text-sm">لوحة التحكم</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>كلمة السر</label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setErr(false); }}
              placeholder="••••••••"
              className={`${inputCls} ${err ? 'border-red-500/60' : ''}`}
              autoFocus
            />
            {err && <p className="text-red-400 text-xs mt-1.5">كلمة السر غير صحيحة</p>}
          </div>
          <button
            type="submit"
            disabled={loading || !pw}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white text-sm disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Project Form Modal ────────────────────────────────────────────────────────
function ProjectModal({
  project,
  onSave,
  onClose,
}: {
  project: Partial<Project> | null;
  onSave: () => void;
  onClose: () => void;
}) {
  const isNew = !project?.id;
  const [form, setForm] = useState<Partial<Project>>({
    title: '', description: '', category: 'video-editing',
    year: new Date().getFullYear(), duration: '',
    technologies: [], featured: false, sort_order: 0,
    video_url: '', ...project,
  });
  const [techInput, setTechInput] = useState(form.technologies?.join(', ') || '');
  const [saving, setSaving] = useState(false);

  const set = (k: keyof Project, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!supabase) {
      alert('Supabase غير مكوّن');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      technologies: techInput.split(',').map(t => t.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };
    if (isNew) {
      delete payload.id;
      await supabase.from('projects').insert(payload);
    } else {
      await supabase.from('projects').update(payload).eq('id', form.id!);
    }
    setSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        className="w-full max-w-lg rounded-2xl border border-white/8 overflow-hidden"
        style={{ background: '#13131f' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
          <h3 className="font-bold text-white text-base">{isNew ? 'إضافة مشروع جديد' : 'تعديل المشروع'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>
        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>عنوان المشروع *</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="عنوان المشروع" className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>الوصف *</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="وصف المشروع" className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>التصنيف *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls} style={{ appearance: 'none' }}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>السنة</label>
              <input type="number" value={form.year} onChange={e => set('year', +e.target.value)} className={inputCls} min={2000} max={2099} />
            </div>
            <div>
              <label className={labelCls}>المدة</label>
              <input type="text" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="مثال: 2 دقيقة" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>الترتيب</label>
              <input type="number" value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} className={inputCls} min={0} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>التقنيات (مفصولة بفاصلة)</label>
              <input type="text" value={techInput} onChange={e => setTechInput(e.target.value)} placeholder="After Effects, Premiere Pro, Cinema 4D" className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>رابط الفيديو (اختياري)</label>
              <input type="url" value={form.video_url} onChange={e => set('video_url', e.target.value)} placeholder="https://..." className={inputCls} />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => set('featured', !form.featured)}
                className={`w-11 h-6 rounded-full transition-all duration-300 relative ${form.featured ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-white/10'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${form.featured ? 'right-0.5' : 'left-0.5'}`} />
              </button>
              <label className="text-sm text-gray-300 cursor-pointer" onClick={() => set('featured', !form.featured)}>مشروع مميز ⭐</label>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-all">إلغاء</button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title || !form.description}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            {saving ? 'جاري الحفظ...' : isNew ? 'إضافة المشروع' : 'حفظ التعديلات'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<'profile' | 'projects' | 'stats' | 'contact' | 'social' | 'skills' | 'testimonials' | 'sections'>('profile');

  // Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [skills, setSkills] = useState([
    { id: '1', name: 'Adobe After Effects', level: 95, category: 'motion-design' },
    { id: '2', name: 'Adobe Premiere Pro', level: 90, category: 'video-editing' },
    { id: '3', name: 'Adobe Photoshop', level: 85, category: 'design' },
    { id: '4', name: 'Cinema 4D', level: 80, category: '3d-modeling' },
    { id: '5', name: 'NanoBanana 2', level: 80, category: 'AI-tools' },
  ]);
  const [testimonials, setTestimonials] = useState([
    { id: '1', name: 'أحمد محمد', company: 'شركة الإعلانات المتحدة', content: 'عمل رائع جداً في تصميم الفيديو الترويجي لمنتجاتنا. الجودة عالية والإبداع واضح.', rating: 5 },
    { id: '2', name: 'فاطمة علي', company: 'مدرسة الرياض', content: 'ساعدنا في إنتاج فيديوهات تعليمية ممتازة للطلاب. المونتاج احترافي والمحتوى جذاب.', rating: 5 },
  ]);
  const [sections, setSections] = useState({
    hero: {
      title: 'مرحباً، أنا محمد علي',
      subtitle: 'مصمم ومحرر فيديو احترافي',
      description: 'أحول أفكارك إلى محتوى بصري مذهل يجذب الجمهور ويحقق أهدافك التسويقية.',
      cta_text: 'شاهد أعمالي',
      cta_link: '#portfolio'
    },
    about: {
      title: 'من أنا',
      content: 'محترف في إنتاج المحتوى البصري والمونتاج والتصميم. خبرة واسعة في مجال الإعلانات التجارية، الفيديوهات التعليمية، والموشن جرافيك.',
      experience_years: '5+',
      projects_completed: '100+'
    },
    footer: {
      copyright: '© 2024 محمد علي. جميع الحقوق محفوظة.',
      tagline: 'نصنع المحتوى الذي يتحدث عن نفسه'
    }
  });
  const [profile, setProfile] = useState({
    name: 'محمد علي',
    title: 'مصمم ومحرر فيديو احترافي',
    description: 'محترف في إنتاج المحتوى البصري والمونتاج والتصميم. شاهد أعمالي في مجال الإعلانات التجارية، الفيديوهات التعليمية، والموشن جرافيك بأحدث التقنيات.',
    avatar: '',
    resume: ''
  });
  const [loading, setLoading] = useState(true);

  // UI state
  const [projectModal, setProjectModal] = useState<Partial<Project> | null | false>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === '1') setAuthed(true);
  }, []);


  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [p, s, c, so] = await Promise.all([
      supabase.from('projects').select('*').order('sort_order'),
      supabase.from('stats').select('*'),
      supabase.from('contact_info').select('*'),
      supabase.from('social_links').select('*').order('sort_order'),
    ]);
    if (p.data) {
      setProjects(p.data);
    }
    if (s.data) {
      setStats(s.data);
    }
    if (c.data) {
      setContacts(c.data);
    }
    if (so.data) {
      setSocials(so.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { if (authed) fetchAll(); }, [authed, fetchAll]);

  const deleteProject = async (id: string) => {
    if (!supabase) {
      showToast('Supabase غير متوفر؛ لا يمكن حذف المشروع عالماً', 'error');
      setDeleteConfirm(null);
      return;
    }
    await supabase.from('projects').delete().eq('id', id);
    setDeleteConfirm(null);
    showToast('تم حذف المشروع');
    fetchAll();
  };

  const deleteStat = async (id: string) => {
    if (!supabase) {
      showToast('Supabase غير متوفر؛ لا يمكن حذف الإحصائية عالماً', 'error');
      setDeleteConfirm(null);
      return;
    }
    await supabase.from('stats').delete().eq('id', id);
    setDeleteConfirm(null);
    showToast('تم حذف الإحصائية');
    fetchAll();
  };

  const deleteContact = async (id: string) => {
    if (!supabase) {
      showToast('Supabase غير متوفر؛ لا يمكن حذف معلومات التواصل عالماً', 'error');
      setDeleteConfirm(null);
      return;
    }
    await supabase.from('contact_info').delete().eq('id', id);
    setDeleteConfirm(null);
    showToast('تم حذف معلومات التواصل');
    fetchAll();
  };

  const deleteSocial = async (id: string) => {
    if (!supabase) {
      showToast('Supabase غير متوفر؛ لا يمكن حذف الرابط عالماً', 'error');
      setDeleteConfirm(null);
      return;
    }
    await supabase.from('social_links').delete().eq('id', id);
    setDeleteConfirm(null);
    showToast('تم حذف الرابط');
    fetchAll();
  };

  const addProject = () => {
    setProjectModal({
      title: '', description: '', category: 'video-editing',
      year: new Date().getFullYear(), duration: '',
      technologies: [], featured: false, sort_order: 0,
      video_url: '',
    });
  };

  const addStat = () => {
    const newStat: Stat = {
      id: Date.now().toString(),
      value: '0',
      label: 'إحصائية جديدة',
    };
    setStats([...stats, newStat]);
    showToast('تمت إضافة إحصائية جديدة');
  };

  const addContact = () => {
    const newContact: ContactInfo = {
      id: Date.now().toString(),
      icon: '📧',
      title: 'معلومات تواصل جديدة',
      content: '',
      href: '',
    };
    setContacts([...contacts, newContact]);
    showToast('تمت إضافة معلومات تواصل جديدة');
  };

  const addSocial = () => {
    const newSocial: SocialLink = {
      id: Date.now().toString(),
      name: 'Facebook',
      url: '',
      sort_order: socials.length,
    };
    setSocials([...socials, newSocial]);
    showToast('تمت إضافة رابط جديد');
  };

  const saveStat = async (s: Stat) => {
    if (!supabase) {
      showToast('Supabase غير متوفر؛ لا يمكن حفظ الإحصائية عالماً', 'error');
      return;
    }
    await supabase.from('stats').update({ value: s.value, label: s.label }).eq('id', s.id);
    showToast('تم حفظ الإحصائية ✓');
    fetchAll();
  };

  const saveContact = async (c: ContactInfo) => {
    if (!supabase) {
      showToast('Supabase غير متوفر؛ لا يمكن حفظ معلومات التواصل عالماً', 'error');
      return;
    }
    await supabase.from('contact_info').update(c).eq('id', c.id);
    showToast('تم حفظ معلومات التواصل ✓');
    fetchAll();
  };

  const saveSocial = async (s: SocialLink) => {
    if (!supabase) {
      showToast('Supabase غير متوفر؛ لا يمكن حفظ الرابط عالماً', 'error');
      return;
    }
    await supabase.from('social_links').update({ url: s.url }).eq('id', s.id);
    showToast('تم حفظ الرابط ✓');
    fetchAll();
  };

  const saveProfile = async () => {
    showToast('تم حفظ الملف الشخصي ✓');
  };

  const saveSkill = async (skill: any) => {
    const updatedSkills = skills.map(s => s.id === skill.id ? skill : s);
    setSkills(updatedSkills);
    showToast('تم حفظ المهارة ✓');
  };

  const saveTestimonial = async (testimonial: any) => {
    const updatedTestimonials = testimonials.map(t => t.id === testimonial.id ? testimonial : t);
    setTestimonials(updatedTestimonials);
    showToast('تم حفظ الشهادة ✓');
  };

  const saveSections = async () => {
    showToast('تم حفظ الأقسام ✓');
  };

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const tabs = [
    { id: 'profile',     label: 'الملف الشخصي',   icon: '👤', count: 1 },
    { id: 'sections',    label: 'الأقسام',        icon: '📄', count: 3 },
    { id: 'skills',      label: 'المهارات',       icon: '⚡', count: skills.length },
    { id: 'testimonials', label: 'الشهادات',      icon: '⭐', count: testimonials.length },
    { id: 'projects',    label: 'المشاريع',       icon: '🎬', count: projects.length },
    { id: 'stats',       label: 'الإحصائيات',     icon: '📊', count: stats.length },
    { id: 'contact',     label: 'التواصل',         icon: '📞', count: contacts.length },
    { id: 'social',      label: 'السوشيال ميديا', icon: '🔗', count: socials.length },
  ] as const;

  return (
    <div dir="rtl" style={{ background: '#0a0a0f', minHeight: '100vh', fontFamily: 'var(--font-cairo), sans-serif' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed top-5 left-1/2 z-50 px-5 py-3 rounded-xl font-semibold text-sm shadow-2xl"
            style={{
              transform: 'translateX(-50%)',
              background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
              color: toast.type === 'success' ? '#4ade80' : '#f87171',
            }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
            <motion.div
              className="p-6 rounded-2xl border border-red-500/30 text-center max-w-xs w-full mx-4"
              style={{ background: '#13131f' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-3xl mb-3">🗑️</div>
              <p className="text-white font-bold mb-1">حذف المشروع؟</p>
              <p className="text-gray-500 text-sm mb-5">هذا الإجراء لا يمكن التراجع عنه</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-all">إلغاء</button>
                <button onClick={() => deleteProject(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-all">حذف</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Modal */}
      <AnimatePresence>
        {projectModal !== false && (
          <ProjectModal
            project={projectModal}
            onSave={() => { setProjectModal(false); fetchAll(); showToast(projectModal?.id ? 'تم تعديل المشروع ✓' : 'تمت إضافة المشروع ✓'); }}
            onClose={() => setProjectModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Portfolio</div>
          <span className="text-gray-600 text-sm">/ لوحة التحكم</span>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false); }}
          className="text-gray-600 hover:text-red-400 transition-colors text-sm flex items-center gap-1.5"
        >
          خروج ↩
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Tab Bar */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/8 hover:text-white border border-white/6'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${tab === t.id ? 'bg-white/20' : 'bg-white/8'}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-600">جاري التحميل...</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} variants={fade} initial="hidden" animate="visible">

              {/* ── PROFILE TAB ── */}
              {tab === 'profile' && (
                <div>
                  <h2 className="text-white font-bold text-lg mb-5">الملف الشخصي</h2>
                  <p className="text-gray-600 text-sm mb-6">هذه المعلومات تظهر في قسم Hero وAbout في الصفحة الرئيسية</p>
                  <div className="space-y-6">
                    <div className="p-5 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <h3 className="text-white font-semibold mb-4">المعلومات الأساسية</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>الاسم الكامل</label>
                          <input
                            type="text"
                            value={profile.name}
                            onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                            className={inputCls}
                            placeholder="محمد علي"
                          />
                        </div>
                        <div>
                          <label className={labelCls}>المسمى الوظيفي</label>
                          <input
                            type="text"
                            value={profile.title}
                            onChange={e => setProfile(prev => ({ ...prev, title: e.target.value }))}
                            className={inputCls}
                            placeholder="مصمم ومحرر فيديو احترافي"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className={labelCls}>الوصف الشخصي</label>
                        <textarea
                          value={profile.description}
                          onChange={e => setProfile(prev => ({ ...prev, description: e.target.value }))}
                          className={`${inputCls} h-24 resize-none`}
                          placeholder="اكتب وصفاً عن نفسك وخبراتك..."
                        />
                      </div>
                    </div>

                    <div className="p-5 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <h3 className="text-white font-semibold mb-4">الوسائط</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>رابط الصورة الشخصية</label>
                          <input
                            type="url"
                            value={profile.avatar}
                            onChange={e => setProfile(prev => ({ ...prev, avatar: e.target.value }))}
                            className={inputCls}
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className={labelCls}>رابط السيرة الذاتية (PDF)</label>
                          <input
                            type="url"
                            value={profile.resume}
                            onChange={e => setProfile(prev => ({ ...prev, resume: e.target.value }))}
                            className={inputCls}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={saveProfile}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                      حفظ الملف الشخصي
                    </button>
                  </div>
                </div>
              )}

              {/* ── SKILLS TAB ── */}
              {tab === 'skills' && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white font-bold text-lg">المهارات والخبرات ({skills.length})</h2>
                    <button
                      onClick={() => {
                        const newSkill = {
                          id: Date.now().toString(),
                          name: '',
                          level: 80,
                          category: 'motion-design'
                        };
                        const updatedSkills = [...skills, newSkill];
                        setSkills(updatedSkills);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                      + إضافة مهارة
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-6">هذه المهارات تظهر في قسم المهارات في الصفحة الرئيسية</p>
                  <div className="space-y-4">
                    {skills.map(skill => (
                      <div key={skill.id} className="p-5 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className={labelCls}>اسم المهارة</label>
                            <input
                              type="text"
                              value={skill.name}
                              onChange={e => { const v = e.target.value; setSkills(prev => prev.map(x => x.id === skill.id ? { ...x, name: v } : x)); }}
                              className={inputCls}
                              placeholder="Adobe After Effects"
                            />
                          </div>
                          <div>
                            <label className={labelCls}>المستوى (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={skill.level}
                              onChange={e => { const v = +e.target.value; setSkills(prev => prev.map(x => x.id === skill.id ? { ...x, level: v } : x)); }}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>الفئة</label>
                            <select
                              value={skill.category}
                              onChange={e => { const v = e.target.value; setSkills(prev => prev.map(x => x.id === skill.id ? { ...x, category: v } : x)); }}
                              className={inputCls}
                            >
                              <option value="motion-design">موشن جرافيك</option>
                              <option value="video-editing">مونتاج فيديو</option>
                              <option value="design">تصميم</option>
                              <option value="3d-modeling">نمذجة ثلاثية الأبعاد</option>
                              <option value="3d-modeling">ادوات الذكاء الإصطناعي</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">المستوى الحالي</span>
                            <span className="text-sm text-purple-400 font-semibold">{skill.level}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => saveSkill(skill)}
                          className="mt-4 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs hover:shadow-lg transition-all"
                        >
                          حفظ المهارة
                        </button>
                        <button
                          onClick={() => {
                            setSkills(prev => prev.filter(x => x.id !== skill.id));
                            showToast('تم حذف المهارة');
                          }}
                          className="mt-4 ml-2 px-5 py-2 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-all"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TESTIMONIALS TAB ── */}
              {tab === 'testimonials' && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white font-bold text-lg">شهادات العملاء ({testimonials.length})</h2>
                    <button
                      onClick={() => {
                        const newTestimonial = {
                          id: Date.now().toString(),
                          name: '',
                          company: '',
                          content: '',
                          rating: 5
                        };
                        const updatedTestimonials = [...testimonials, newTestimonial];
                        setTestimonials(updatedTestimonials);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                      + إضافة شهادة
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-6">هذه الشهادات تظهر في قسم الشهادات في الصفحة الرئيسية</p>
                  <div className="space-y-4">
                    {testimonials.map(testimonial => (
                      <div key={testimonial.id} className="p-5 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className={labelCls}>اسم العميل</label>
                            <input
                              type="text"
                              value={testimonial.name}
                              onChange={e => { const v = e.target.value; setTestimonials(prev => prev.map(x => x.id === testimonial.id ? { ...x, name: v } : x)); }}
                              className={inputCls}
                              placeholder="أحمد محمد"
                            />
                          </div>
                          <div>
                            <label className={labelCls}>الشركة/المؤسسة</label>
                            <input
                              type="text"
                              value={testimonial.company}
                              onChange={e => { const v = e.target.value; setTestimonials(prev => prev.map(x => x.id === testimonial.id ? { ...x, company: v } : x)); }}
                              className={inputCls}
                              placeholder="شركة الإعلانات المتحدة"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className={labelCls}>محتوى الشهادة</label>
                          <textarea
                            value={testimonial.content}
                            onChange={e => { const v = e.target.value; setTestimonials(prev => prev.map(x => x.id === testimonial.id ? { ...x, content: v } : x)); }}
                            className={`${inputCls} h-20 resize-none`}
                            placeholder="اكتب محتوى الشهادة..."
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <label className={labelCls}>التقييم:</label>
                            <select
                              value={testimonial.rating}
                              onChange={e => { const v = +e.target.value; setTestimonials(prev => prev.map(x => x.id === testimonial.id ? { ...x, rating: v } : x)); }}
                              className={`${inputCls} w-20`}
                            >
                              <option value={5}>⭐⭐⭐⭐⭐</option>
                              <option value={4}>⭐⭐⭐⭐</option>
                              <option value={3}>⭐⭐⭐</option>
                              <option value={2}>⭐⭐</option>
                              <option value={1}>⭐</option>
                            </select>
                          </div>
                          <button
                            onClick={() => saveTestimonial(testimonial)}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs hover:shadow-lg transition-all"
                          >
                            حفظ الشهادة
                          </button>
                          <button
                            onClick={() => {
                              setTestimonials(prev => prev.filter(x => x.id !== testimonial.id));
                              showToast('تم حذف الشهادة');
                            }}
                            className="px-5 py-2 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-all ml-2"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SECTIONS TAB ── */}
              {tab === 'sections' && (
                <div>
                  <h2 className="text-white font-bold text-lg mb-5">إدارة الأقسام</h2>
                  <p className="text-gray-600 text-sm mb-6">تحكم في محتوى الأقسام المختلفة في الصفحة الرئيسية</p>

                  {/* Hero Section */}
                  <div className="mb-8">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <span className="text-xl">🚀</span>
                      قسم Hero
                    </h3>
                    <div className="p-5 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className={labelCls}>العنوان الرئيسي</label>
                          <input
                            type="text"
                            value={sections.hero.title}
                            onChange={e => setSections(prev => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))}
                            className={inputCls}
                            placeholder="مرحباً، أنا محمد علي"
                          />
                        </div>
                        <div>
                          <label className={labelCls}>العنوان الفرعي</label>
                          <input
                            type="text"
                            value={sections.hero.subtitle}
                            onChange={e => setSections(prev => ({ ...prev, hero: { ...prev.hero, subtitle: e.target.value } }))}
                            className={inputCls}
                            placeholder="مصمم ومحرر فيديو احترافي"
                          />
                        </div>
                        <div>
                          <label className={labelCls}>نص الدعوة للعمل</label>
                          <input
                            type="text"
                            value={sections.hero.cta_text}
                            onChange={e => setSections(prev => ({ ...prev, hero: { ...prev.hero, cta_text: e.target.value } }))}
                            className={inputCls}
                            placeholder="شاهد أعمالي"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelCls}>الوصف</label>
                          <textarea
                            value={sections.hero.description}
                            onChange={e => setSections(prev => ({ ...prev, hero: { ...prev.hero, description: e.target.value } }))}
                            className={`${inputCls} h-20 resize-none`}
                            placeholder="اكتب وصفاً جذاباً..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="mb-8">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <span className="text-xl">👨‍💻</span>
                      قسم من أنا
                    </h3>
                    <div className="p-5 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>عنوان القسم</label>
                          <input
                            type="text"
                            value={sections.about.title}
                            onChange={e => setSections(prev => ({ ...prev, about: { ...prev.about, title: e.target.value } }))}
                            className={inputCls}
                            placeholder="من أنا"
                          />
                        </div>
                        <div>
                          <label className={labelCls}>سنوات الخبرة</label>
                          <input
                            type="text"
                            value={sections.about.experience_years}
                            onChange={e => setSections(prev => ({ ...prev, about: { ...prev.about, experience_years: e.target.value } }))}
                            className={inputCls}
                            placeholder="5+"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelCls}>المحتوى</label>
                          <textarea
                            value={sections.about.content}
                            onChange={e => setSections(prev => ({ ...prev, about: { ...prev.about, content: e.target.value } }))}
                            className={`${inputCls} h-24 resize-none`}
                            placeholder="اكتب محتوى قسم من أنا..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="mb-8">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <span className="text-xl">📄</span>
                      قسم Footer
                    </h3>
                    <div className="p-5 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className={labelCls}>نص حقوق النشر</label>
                          <input
                            type="text"
                            value={sections.footer.copyright}
                            onChange={e => setSections(prev => ({ ...prev, footer: { ...prev.footer, copyright: e.target.value } }))}
                            className={inputCls}
                            placeholder="© 2024 محمد علي. جميع الحقوق محفوظة."
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelCls}>الشعار</label>
                          <input
                            type="text"
                            value={sections.footer.tagline}
                            onChange={e => setSections(prev => ({ ...prev, footer: { ...prev.footer, tagline: e.target.value } }))}
                            className={inputCls}
                            placeholder="نصنع المحتوى الذي يتحدث عن نفسه"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={saveSections}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    حفظ جميع الأقسام
                  </button>
                </div>
              )}

              {/* ── PROJECTS TAB ── */}
              {tab === 'projects' && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white font-bold text-lg">المشاريع ({projects.length})</h2>
                    <button
                      onClick={() => setProjectModal({})}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                      + إضافة مشروع
                    </button>
                  </div>
                  <div className="space-y-3">
                    {projects.map(p => (
                      <motion.div
                        key={p.id}
                        layout
                        className="flex items-center gap-4 p-4 rounded-xl border border-white/6 hover:border-purple-500/25 transition-all"
                        style={{ background: 'rgba(255,255,255,0.02)' }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: 'rgba(168,85,247,0.12)' }}
                        >
                          {p.category === 'motion-design' ? '🎬' : p.category === 'video-editing' ? '✂️' : p.category === 'promotional' ? '📣' : '🏢'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-white font-semibold text-sm truncate">{p.title}</p>
                            {p.featured && <span className="text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 px-2 py-0.5 rounded-full flex-shrink-0">⭐ مميز</span>}
                          </div>
                          <p className="text-gray-600 text-xs truncate">{p.description}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-purple-400">{CATEGORIES.find(c => c.value === p.category)?.label}</span>
                            <span className="text-xs text-gray-700">·</span>
                            <span className="text-xs text-gray-600">{p.year}</span>
                            {p.duration && <><span className="text-xs text-gray-700">·</span><span className="text-xs text-gray-600">{p.duration}</span></>}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setProjectModal(p)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(p.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/8 border border-red-500/15 text-red-400 hover:bg-red-500/15 transition-all text-xs font-semibold"
                          >
                            حذف
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    {projects.length === 0 && (
                      <div className="text-center py-16 text-gray-700">لا توجد مشاريع بعد. أضف مشروعك الأول!</div>
                    )}
                  </div>
                </div>
              )}

              {/* ── STATS TAB ── */}
              {tab === 'stats' && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white font-bold text-lg">الإحصائيات ({stats.length})</h2>
                    <button
                      onClick={() => {
                        const newStat = {
                          id: Date.now().toString(),
                          value: '100+',
                          label: 'مشروع منجز'
                        };
                        const updatedStats = [...stats, newStat];
                        setStats(updatedStats);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                      + إضافة إحصائية
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-6">هذه الأرقام تظهر في قسم Hero في الصفحة الرئيسية</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.map(s => (
                      <div key={s.id} className="p-5 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <label className={labelCls}>القيمة</label>
                        <input
                          type="text"
                          value={s.value}
                          onChange={e => { const v = e.target.value; setStats(prev => prev.map(x => x.id === s.id ? { ...x, value: v } : x)); }}
                          className={`${inputCls} text-2xl font-black mb-3`}
                          placeholder="100+"
                        />
                        <label className={labelCls}>التسمية</label>
                        <input
                          type="text"
                          value={s.label}
                          onChange={e => { const v = e.target.value; setStats(prev => prev.map(x => x.id === s.id ? { ...x, label: v } : x)); }}
                          className={inputCls}
                          placeholder="مشروع منجز"
                        />
                        <button
                          onClick={() => saveStat(s)}
                          className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs hover:shadow-lg transition-all"
                        >
                          حفظ
                        </button>
                        <button
                          onClick={() => {
                            setStats(prev => prev.filter(x => x.id !== s.id));
                            showToast('تم حذف الإحصائية');
                          }}
                          className="w-full mt-2 py-2 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-all"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── CONTACT TAB ── */}
              {tab === 'contact' && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white font-bold text-lg">معلومات التواصل ({contacts.length})</h2>
                    <button
                      onClick={() => {
                        const newContact = {
                          id: Date.now().toString(),
                          title: 'الإيميل',
                          content: '',
                          href: '',
                          icon: '📧'
                        };
                        const updatedContacts = [...contacts, newContact];
                        setContacts(updatedContacts);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                      + إضافة معلومات تواصل
                    </button>
                  </div>
                  <div className="space-y-4">
                    {contacts.map(c => (
                      <div key={c.id} className="p-5 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl">{c.icon}</span>
                          <span className="text-white font-semibold">{c.title}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>المحتوى</label>
                            <input
                              type="text"
                              value={c.content}
                              onChange={e => { const v = e.target.value; setContacts(prev => prev.map(x => x.id === c.id ? { ...x, content: v } : x)); }}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>الرابط (href)</label>
                            <input
                              type="text"
                              value={c.href}
                              onChange={e => { const v = e.target.value; setContacts(prev => prev.map(x => x.id === c.id ? { ...x, href: v } : x)); }}
                              className={inputCls}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => saveContact(c)}
                          className="mt-3 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs hover:shadow-lg transition-all"
                        >
                          حفظ
                        </button>
                        <button
                          onClick={() => {
                            setContacts(prev => prev.filter(x => x.id !== c.id));
                            showToast('تم حذف معلومات التواصل');
                          }}
                          className="mt-3 ml-2 px-5 py-2 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-all"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SOCIAL TAB ── */}
              {tab === 'social' && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white font-bold text-lg">روابط السوشيال ميديا ({socials.length})</h2>
                    <button
                      onClick={() => {
                        const newSocial = {
                          id: Date.now().toString(),
                          name: 'Facebook',
                          url: '',
                          sort_order: socials.length
                        };
                        const updatedSocials = [...socials, newSocial];
                        setSocials(updatedSocials);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                      + إضافة موقع تواصل
                    </button>
                  </div>
                  <div className="space-y-3">
                    {socials.map(s => {
                      const icons: Record<string, string> = { Facebook: '📘', Instagram: '📸', LinkedIn: '💼', YouTube: '▶️' };
                      return (
                        <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="text-2xl flex-shrink-0">{icons[s.name] || '🔗'}</span>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm mb-2">{s.name}</p>
                            <input
                              type="url"
                              value={s.url}
                              onChange={e => { const v = e.target.value; setSocials(prev => prev.map(x => x.id === s.id ? { ...x, url: v } : x)); }}
                              placeholder="https://..."
                              className={inputCls}
                            />
                          </div>
                          <button
                            onClick={() => saveSocial(s)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs flex-shrink-0 hover:shadow-lg transition-all"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => {
                              setSocials(prev => prev.filter(x => x.id !== s.id));
                              showToast('تم حذف الموقع');
                            }}
                            className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-xs flex-shrink-0 hover:bg-red-600 transition-all ml-2"
                          >
                            حذف
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
