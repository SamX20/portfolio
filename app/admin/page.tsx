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
            Portfolio
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
  const [tab, setTab] = useState<'projects' | 'stats' | 'contact' | 'social'>('projects');

  // Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [socials, setSocials] = useState<SocialLink[]>([]);
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
    setLoading(true);
    const [p, s, c, so] = await Promise.all([
      supabase.from('projects').select('*').order('sort_order'),
      supabase.from('stats').select('*'),
      supabase.from('contact_info').select('*'),
      supabase.from('social_links').select('*').order('sort_order'),
    ]);
    if (p.data) setProjects(p.data);
    if (s.data) setStats(s.data);
    if (c.data) setContacts(c.data);
    if (so.data) setSocials(so.data);
    setLoading(false);
  }, []);

  useEffect(() => { if (authed) fetchAll(); }, [authed, fetchAll]);

  const deleteProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    setDeleteConfirm(null);
    showToast('تم حذف المشروع');
    fetchAll();
  };

  const saveStat = async (s: Stat) => {
    await supabase.from('stats').update({ value: s.value, label: s.label }).eq('id', s.id);
    showToast('تم حفظ الإحصائية ✓');
  };

  const saveContact = async (c: ContactInfo) => {
    await supabase.from('contact_info').update(c).eq('id', c.id);
    showToast('تم حفظ معلومات التواصل ✓');
  };

  const saveSocial = async (s: SocialLink) => {
    await supabase.from('social_links').update({ url: s.url }).eq('id', s.id);
    showToast('تم حفظ الرابط ✓');
  };

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const tabs = [
    { id: 'projects', label: 'المشاريع',       icon: '🎬', count: projects.length },
    { id: 'stats',    label: 'الإحصائيات',     icon: '📊', count: stats.length },
    { id: 'contact',  label: 'التواصل',         icon: '📞', count: contacts.length },
    { id: 'social',   label: 'السوشيال ميديا', icon: '🔗', count: socials.length },
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
                  <h2 className="text-white font-bold text-lg mb-5">الإحصائيات</h2>
                  <p className="text-gray-600 text-sm mb-6">هذه الأرقام تظهر في قسم Hero في الصفحة الرئيسية</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.map(s => (
                      <div key={s.id} className="p-5 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <label className={labelCls}>القيمة</label>
                        <input
                          type="text"
                          defaultValue={s.value}
                          onChange={e => { const v = e.target.value; setStats(prev => prev.map(x => x.id === s.id ? { ...x, value: v } : x)); }}
                          className={`${inputCls} text-2xl font-black mb-3`}
                          placeholder="100+"
                        />
                        <label className={labelCls}>التسمية</label>
                        <input
                          type="text"
                          defaultValue={s.label}
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── CONTACT TAB ── */}
              {tab === 'contact' && (
                <div>
                  <h2 className="text-white font-bold text-lg mb-5">معلومات التواصل</h2>
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
                              defaultValue={c.content}
                              onChange={e => { const v = e.target.value; setContacts(prev => prev.map(x => x.id === c.id ? { ...x, content: v } : x)); }}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>الرابط (href)</label>
                            <input
                              type="text"
                              defaultValue={c.href}
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SOCIAL TAB ── */}
              {tab === 'social' && (
                <div>
                  <h2 className="text-white font-bold text-lg mb-5">روابط السوشيال ميديا</h2>
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
                              defaultValue={s.url}
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
