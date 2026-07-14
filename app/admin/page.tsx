'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CATEGORIES, Client, ContactInfo, Locale, Profile, Project, SectionsData, Skill, SocialLink, Stat, Testimonial } from '@/types';
import { defaultClients, defaultContacts, defaultProfile, defaultProjects, defaultSections, defaultSkills, defaultSocials, defaultStats, defaultTestimonials } from '@/lib/portfolioDefaults';

type Tab = 'content' | 'projects' | 'clients' | 'contacts' | 'skills' | 'testimonials';

interface UploadTicket {
  bucket: string;
  path: string;
  token: string;
  url: string;
}

interface AdminData {
  projects: Project[];
  stats: Stat[];
  contacts: ContactInfo[];
  clients: Client[];
  socials: SocialLink[];
  skills: Skill[];
  testimonials: Testimonial[];
  profile: Profile;
  sections: SectionsData;
}

interface PendingDelete {
  table: string;
  id: string;
}

const emptyProject: Project = {
  id: '',
  title: '',
  title_ar: '',
  description: '',
  description_ar: '',
  category: ['motion-design'],
  client: '',
  role: '',
  year: new Date().getFullYear(),
  duration: '',
  technologies: [],
  video_url: '',
  embed_code: '',
  thumbnail: '',
  featured: false,
  sort_order: 0,
};

function mapSections(rows: { section: string; key: string; value: string }[] = []): SectionsData {
  const map = rows.reduce<Record<string, Record<string, string>>>((acc, item) => {
    acc[item.section] = acc[item.section] || {};
    acc[item.section][item.key] = item.value;
    return acc;
  }, {});

  const isValidLocale = (value: string | undefined): value is Locale => {
    return value === 'en' || value === 'ar';
  };

  return {
    global: {
      ...defaultSections.global,
      ...map.global,
      language: isValidLocale(map.global?.language) ? map.global.language : defaultSections.global.language,
    },
    hero: { ...defaultSections.hero, ...map.hero },
    about: { ...defaultSections.about, ...map.about },
    footer: { ...defaultSections.footer, ...map.footer },
  };

}

let browserSupabase: SupabaseClient | null = null;

function getBrowserSupabase() {
  if (browserSupabase) return browserSupabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnon) {
    throw new Error('Supabase public env variables are missing.');
  }

  browserSupabase = createClient(supabaseUrl, supabaseAnon);
  return browserSupabase;
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  const response = await fetch(url, {
    ...init,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  }).catch((error) => {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out. Check Supabase env variables and schema.');
    }
    throw error;
  });

  window.clearTimeout(timeout);

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function getProjectVideoSource(videoUrl?: string) {
  const normalizedUrl = (videoUrl || '').toLowerCase();

  if (!normalizedUrl) {
    return null;
  }

  if (normalizedUrl.includes('drive.google.com') || normalizedUrl.includes('docs.google.com')) {
    return {
      label: 'Drive',
      className: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
    };
  }

  if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
    return {
      label: 'YouTube',
      className: 'border-red-300/25 bg-red-300/10 text-red-100',
    };
  }

  if (normalizedUrl.includes('vimeo.com')) {
    return {
      label: 'Vimeo',
      className: 'border-sky-300/25 bg-sky-300/10 text-sky-100',
    };
  }

  if (normalizedUrl.startsWith('/') || /\.(mp4|webm|mov)(\?|#|$)/.test(normalizedUrl)) {
    return {
      label: 'Direct',
      className: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
    };
  }

  return {
    label: 'External',
    className: 'border-violet-300/25 bg-violet-300/10 text-violet-100',
  };
}

function Field({
  label,
  value,
  onChange,
  textarea,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  textarea?: boolean;
  type?: string;
  placeholder?: string;
}) {
  const className =
    'w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#8ed8ff]/70';

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">{label}</span>
      {textarea ? (
        <textarea value={value || ''} onChange={(event) => onChange(event.target.value)} rows={4} placeholder={placeholder} className={`${className} resize-none`} />
      ) : (
        <input value={value || ''} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} className={className} />
      )}
    </label>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingHeroVideo, setUploadingHeroVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedHeroVideoFile, setSelectedHeroVideoFile] = useState<File | null>(null);
  const [tab, setTab] = useState<Tab>('content');
  const [toast, setToast] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingDeletes, setPendingDeletes] = useState<PendingDelete[]>([]);
  const [data, setData] = useState<AdminData>({
    projects: defaultProjects,
    stats: defaultStats,
    contacts: defaultContacts,
    clients: defaultClients,
    socials: defaultSocials,
    skills: defaultSkills,
    testimonials: defaultTestimonials,
    profile: defaultProfile,
    sections: defaultSections,
  });

  const sortedAdminProjects = useMemo(
    () => [...data.projects].sort((a, b) => b.year - a.year || a.sort_order - b.sort_order),
    [data.projects],
  );

  const projectSummary = useMemo(
    () => ({
      total: data.projects.length,
      featured: data.projects.filter((project) => project.featured).length,
      linked: data.projects.filter((project) => project.video_url).length,
    }),
    [data.projects],
  );

  const startNewProject = () => {
    setEditingProject({ ...emptyProject, id: crypto.randomUUID(), sort_order: data.projects.length + 1 });
  };

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3200);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api<{
        projects: Project[];
        stats: Stat[];
        contacts: ContactInfo[];
        clients: Client[];
        socials: SocialLink[];
        skills: Skill[];
        testimonials: Testimonial[];
        profile: Profile | null;
        sections: { section: string; key: string; value: string }[];
      }>('/api/admin/data');

      setData({
        projects: response.projects,
        stats: response.stats,
        contacts: response.contacts,
        clients: response.clients || [],
        socials: response.socials,
        skills: response.skills,
        testimonials: response.testimonials || [],
        profile: response.profile || defaultProfile,
        sections: mapSections(response.sections),
      });
      setHasUnsavedChanges(false);
      setPendingDeletes([]);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const updateData = (updater: (current: AdminData) => AdminData) => {
    setData(updater);
    setHasUnsavedChanges(true);
  };

  const stageDelete = (table: string, id: string) => {
    setPendingDeletes((current) => {
      if (current.some((item) => item.table === table && item.id === id)) return current;
      return [...current, { table, id }];
    });
    setHasUnsavedChanges(true);
  };

  const changeTab = (nextTab: Tab) => {
    setTab(nextTab);
  };

  useEffect(() => {
    api<{ authed: boolean; configured: boolean }>('/api/admin/session')
      .then((session) => {
        setAuthed(session.authed);
        setConfigured(session.configured);
        if (session.authed) return load();
      })
      .finally(() => setLoading(false));
  }, [load]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api('/api/admin/session', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      setAuthed(true);
      await load();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setSaving(false);
    }
  };

  const saveRecord = async (table: string, record: object) => {
    const result = await api<{ missingColumns?: string[] }>('/api/admin/data', {
      method: 'POST',
      body: JSON.stringify({ table, record }),
    });

    if (result.missingColumns?.length) {
      notify(`Saved, but missing DB columns were skipped: ${result.missingColumns.join(', ')}`);
    }
  };

  const saveAllChanges = async () => {
    setSaving(true);
    try {
      await api('/api/admin/data', {
        method: 'PUT',
        body: JSON.stringify({ profile: data.profile, sections: data.sections }),
      });

      const saveRows = async (table: string, records: object[]) => {
        for (const record of records) {
          await saveRecord(table, record);
        }
      };

      for (const item of pendingDeletes) {
        await deleteRecord(item.table, item.id);
      }

      await saveRows('projects', data.projects);
      await saveRows('clients', data.clients);
      await saveRows('stats', data.stats);
      await saveRows('contact_info', data.contacts);
      await saveRows('social_links', data.socials);
      await saveRows('skills', data.skills);
      await saveRows('testimonials', data.testimonials);

      setHasUnsavedChanges(false);
      setPendingDeletes([]);
      notify('All changes saved');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const dismissChanges = async () => {
    if (!confirm('Dismiss unsaved changes and reload the last saved data?')) return;
    await load();
    notify('Unsaved changes dismissed');
  };

  const deleteRecord = async (table: string, id: string) => {
    await api('/api/admin/data', {
      method: 'DELETE',
      body: JSON.stringify({ table, id }),
    });
  };

  const uploadFile = async (file: File, onProgress?: (percent: number) => void) => {
    onProgress?.(5);

    const ticket = await api<UploadTicket>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
      }),
    });

    onProgress?.(15);

    const supabase = getBrowserSupabase();
    const { error } = await supabase.storage
      .from(ticket.bucket)
      .uploadToSignedUrl(ticket.path, ticket.token, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      throw new Error(error.message || 'Upload failed.');
    }

    onProgress?.(100);
    return ticket.url;
  };

  const setProfile = (key: keyof Profile, value: string) => {
    updateData((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));
  };

  const setSection = (section: keyof SectionsData, key: string, value: string) => {
    updateData((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [section]: { ...current.sections[section], [key]: value },
      },
    }));
  };

  if (loading && !authed) {
    return <div className="grid min-h-screen place-items-center bg-[#080808] text-white">Loading admin...</div>;
  }

  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#080808] px-4 text-white">
        <form onSubmit={login} className="w-full max-w-md border border-white/10 bg-white/[0.03] p-7">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.34em] text-[#8ed8ff]">Sam Admin</p>
          <h1 className="text-4xl font-black">Control room</h1>
          <p className="mt-3 text-sm leading-7 text-white/52">
            Server-protected admin for projects, main page copy, uploads, and contact content.
          </p>
          {!configured && (
            <p className="mt-4 border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
              Add ADMIN_PASSWORD to your environment before using admin.
            </p>
          )}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Admin password"
            className="mt-6 h-12 w-full border border-white/10 bg-black/35 px-4 text-white outline-none focus:border-[#8ed8ff]/70"
          />
          <button disabled={saving || !password} className="accent-gradient mt-4 w-full px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#090909] disabled:opacity-50">
            {saving ? 'Checking...' : 'Enter'}
          </button>
          {toast && <p className="mt-4 text-sm text-red-200">{toast}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {toast && (
        <div className="fixed right-4 top-4 z-[120] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-[#8ed8ff]/35 bg-[#0b1014]/95 p-4 text-sm font-bold leading-6 text-[#dff5ff] shadow-2xl shadow-black/35 backdrop-blur-xl">
          <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-[#8ed8ff]">Admin update</span>
          {toast}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080808]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#8ed8ff]">Sam Motion Admin</p>
            <h1 className="text-2xl font-black">Portfolio control panel</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['content', 'Main page'],
              ['projects', 'Projects'],
              ['clients', 'Clients'],
              ['contacts', 'Contact / Social'],
              ['skills', 'Skills / Stats'],
              ['testimonials', 'Testimonials'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => changeTab(value as Tab)}
                className={`border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                  tab === value ? 'accent-gradient border-[#4aa3ff] text-[#090909]' : 'border-white/10 text-white/55 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {hasUnsavedChanges && (
        <div className="fixed bottom-5 left-1/2 z-[130] w-[min(620px,calc(100vw-2rem))] -translate-x-1/2 rounded-3xl border border-[#8ed8ff]/35 bg-[#0b1014]/95 p-4 shadow-2xl shadow-black/45 backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ed8ff]">Unsaved changes</p>
              <p className="mt-1 text-sm text-white/62">You changed admin content. Save everything or dismiss the local changes.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={dismissChanges}
                disabled={saving}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white/62 transition hover:border-white/25 hover:text-white disabled:opacity-50"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={saveAllChanges}
                disabled={saving}
                className="accent-gradient rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#05070b] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {tab === 'content' && (
          <section className="grid gap-5 lg:grid-cols-2">
            <div className="border border-white/10 bg-white/[0.025] p-5">
              <h2 className="mb-5 text-xl font-black">Identity</h2>
              <div className="grid gap-4">
                <Field label="Display name" value={data.profile.name} onChange={(value) => setProfile('name', value)} />
                <Field label="Professional title" value={data.profile.title} onChange={(value) => setProfile('title', value)} />
                <Field label="Bio" value={data.profile.description} onChange={(value) => setProfile('description', value)} textarea />
                <Field label="Site title" value={data.sections.global.site_title} onChange={(value) => setSection('global', 'site_title', value)} />
                <Field label="Logo text / image url" value={data.sections.global.logo} onChange={(value) => setSection('global', 'logo', value)} />
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.025] p-5">
              <h2 className="mb-5 text-xl font-black">Hero EN / AR</h2>
              <div className="grid gap-4">
                <Field label="Hero title EN" value={data.sections.hero.title} onChange={(value) => setSection('hero', 'title', value)} />
                <Field label="Hero title AR" value={data.sections.hero.title_ar} onChange={(value) => setSection('hero', 'title_ar', value)} />
                <Field label="Subtitle EN" value={data.sections.hero.subtitle} onChange={(value) => setSection('hero', 'subtitle', value)} />
                <Field label="Subtitle AR" value={data.sections.hero.subtitle_ar} onChange={(value) => setSection('hero', 'subtitle_ar', value)} />
                <Field label="Description EN" value={data.sections.hero.description} onChange={(value) => setSection('hero', 'description', value)} textarea />
                <Field label="Description AR" value={data.sections.hero.description_ar} onChange={(value) => setSection('hero', 'description_ar', value)} textarea />
                <div className="grid gap-3">
                  <div className="flex flex-col gap-2">
                    <Field label="Hero video URL" value={data.sections.hero.video_url} onChange={(value) => setSection('hero', 'video_url', value)} placeholder="YouTube, Vimeo, or direct video link" />
                    {data.sections.hero.video_url ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSection('hero', 'video_url', '');
                          notify('Hero video link cleared. Save to apply the change.');
                        }}
                        className="self-start rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-red-200 hover:bg-red-500/15"
                      >
                        حذف رابط الفيديو
                      </button>
                    ) : null}
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Select hero video file</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setSelectedHeroVideoFile(file || null);
                        if (file) {
                          notify('File selected. اضغط Upload لرفع الملف إلى التخزين.');
                        }
                      }}
                      className="w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={!selectedHeroVideoFile || uploadingHeroVideo}
                    onClick={async () => {
                      if (!selectedHeroVideoFile) return;
                      try {
                        setUploadingHeroVideo(true);
                        setUploadProgress(0);
                        const url = await uploadFile(selectedHeroVideoFile, (percent) => {
                          setUploadProgress(percent);
                        });
                        setSection('hero', 'video_url', url);
                        setSelectedHeroVideoFile(null);
                        notify('تم رفع الفيديو بنجاح. اضغط save لحفظ التغييرات.');
                      } catch (uploadError) {
                        const message = uploadError instanceof Error ? uploadError.message : 'Hero video upload failed';
                        notify(message);
                      } finally {
                        setUploadingHeroVideo(false);
                        setUploadProgress(0);
                      }
                    }}
                    className="w-full rounded-full bg-[#8ed8ff] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#090909] disabled:opacity-50"
                  >
                    {uploadingHeroVideo ? `Uploading ${uploadProgress}%` : 'Upload hero video'}
                  </button>
                  {uploadingHeroVideo ? (
                    <div className="mt-3 h-2 overflow-hidden rounded-full border border-white/10 bg-white/5">
                      <div className="h-full bg-[#8ed8ff] transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.025] p-5 lg:col-span-2">
              <h2 className="mb-5 text-xl font-black">About / Footer</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="About title EN" value={data.sections.about.title} onChange={(value) => setSection('about', 'title', value)} />
                <Field label="About title AR" value={data.sections.about.title_ar} onChange={(value) => setSection('about', 'title_ar', value)} />
                <Field label="About text EN" value={data.sections.about.content} onChange={(value) => setSection('about', 'content', value)} textarea />
                <Field label="About text AR" value={data.sections.about.content_ar} onChange={(value) => setSection('about', 'content_ar', value)} textarea />
                <Field label="Footer tagline EN" value={data.sections.footer.tagline} onChange={(value) => setSection('footer', 'tagline', value)} />
                <Field label="Footer tagline AR" value={data.sections.footer.tagline_ar} onChange={(value) => setSection('footer', 'tagline_ar', value)} />
              </div>
            </div>
          </section>
        )}

        {tab === 'projects' && (
          <section className="pb-24">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8ed8ff]">Project library</p>
                <h2 className="mt-2 text-3xl font-black">Stacked project cards</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/46">
                  Manage project details, thumbnails, links, categories, and featured status from one flexible view.
                </p>
              </div>
              <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] text-center">
                {[
                  ['Total', projectSummary.total],
                  ['Featured', projectSummary.featured],
                  ['Linked', projectSummary.linked],
                ].map(([label, value]) => (
                  <div key={label} className="border-r border-white/10 px-4 py-3 last:border-r-0">
                    <p className="text-lg font-black text-white">{value}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/38">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startNewProject}
              className="fixed bottom-5 right-5 z-50 rounded-full bg-[#8ed8ff] px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-[#05070b] shadow-2xl shadow-[#4aa3ff]/20 transition hover:brightness-110"
            >
              Add project
            </button>

            <div className="grid gap-4">
              {sortedAdminProjects.map((project, index) => (
                <article
                  key={project.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-3 shadow-2xl shadow-black/10 transition hover:border-[#8ed8ff]/35 hover:bg-white/[0.04] md:grid md:grid-cols-[180px_1fr_auto] md:items-stretch md:gap-5 md:p-4"
                >
                  <div className="relative aspect-video overflow-hidden rounded-2xl bg-black md:aspect-auto md:min-h-32">
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.title || 'Project thumbnail'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full min-h-32 place-items-center bg-white/[0.035] text-xs font-black uppercase tracking-[0.18em] text-white/28">No thumbnail</div>
                    )}
                    <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/80">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="min-w-0 py-4 md:py-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {project.featured && (
                        <span className="rounded-full border border-[#8ed8ff]/30 bg-[#8ed8ff]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#8ed8ff]">
                          Featured
                        </span>
                      )}
                      <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/48">
                        {project.year}
                      </span>
                      {project.video_url &&
                        (() => {
                          const videoSource = getProjectVideoSource(project.video_url);
                          if (!videoSource) return null;

                          return (
                            <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${videoSource.className}`}>
                              {videoSource.label}
                            </span>
                          );
                        })()}
                    </div>
                    <h3 className="mt-3 truncate text-xl font-black text-white">{project.title || project.title_ar || 'Untitled project'}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/48">{project.description || project.description_ar || 'No description yet.'}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.category.map((cat) => (
                        <span key={cat} className="rounded-full bg-white/[0.055] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                          {CATEGORIES.find((item) => item.value === cat)?.label ?? cat}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/32">
                      {project.client || 'No client'} / {project.role || 'No role'} / Sort {project.sort_order}
                    </p>
                  </div>

                  <div className="flex gap-2 border-t border-white/10 pt-3 md:flex-col md:justify-center md:border-l md:border-t-0 md:pl-4 md:pt-0">
                    <button onClick={() => setEditingProject(project)} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/72 transition hover:border-[#8ed8ff]/50 hover:text-white">
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this project?')) return;
                        stageDelete('projects', project.id);
                        updateData((current) => ({ ...current, projects: current.projects.filter((item) => item.id !== project.id) }));
                        notify('Project deleted. Save changes to publish.');
                      }}
                      className="rounded-full border border-red-400/25 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'clients' && (
          <ClientsManager
            clients={data.clients}
            uploadFile={uploadFile}
            onChange={(clients) => updateData((current) => ({ ...current, clients }))}
            onDelete={stageDelete}
            notify={notify}
          />
        )}

        {tab === 'contacts' && (
          <section className="grid gap-5 lg:grid-cols-2">
            <EditableList
              title="Contact methods"
              items={data.contacts}
              table="contact_info"
              fields={['icon', 'title', 'content', 'href']}
              newItem={{ id: '', icon: '@', title: 'Email', content: '', href: '' }}
              onChange={(contacts) => updateData((current) => ({ ...current, contacts: contacts as ContactInfo[] }))}
              onDelete={stageDelete}
              notify={notify}
            />
            <EditableList
              title="Social links"
              items={data.socials}
              table="social_links"
              fields={['name', 'url', 'icon', 'sort_order']}
              newItem={{ id: '', name: 'Instagram', url: '', icon: '', sort_order: data.socials.length + 1 }}
              onChange={(socials) => updateData((current) => ({ ...current, socials: socials as SocialLink[] }))}
              onDelete={stageDelete}
              notify={notify}
            />
          </section>
        )}

        {tab === 'skills' && (
          <section className="grid gap-5 lg:grid-cols-2">
            <EditableList
              title="Stats"
              items={data.stats}
              table="stats"
              fields={['value', 'label']}
              newItem={{ id: '', value: '10+', label: 'Projects' }}
              onChange={(stats) => updateData((current) => ({ ...current, stats: stats as Stat[] }))}
              onDelete={stageDelete}
              notify={notify}
            />
            <SkillsManager
              skills={data.skills}
              onChange={(skills) => updateData((current) => ({ ...current, skills }))}
              onDelete={stageDelete}
              notify={notify}
            />
          </section>
        )}

        {tab === 'testimonials' && (
          <section>
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8ed8ff]">Client sharing link</p>
                <h2 className="text-3xl font-black">Testimonials</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/46">
                  Send clients this link: <span className="text-[#8ed8ff]">/share-testimonial</span>. Submitted feedback appears on the main page.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const link = `${window.location.origin}/share-testimonial`;
                  await navigator.clipboard.writeText(link);
                  notify('Testimonial sharing link copied');
                }}
                className="rounded-full border border-[#8ed8ff]/45 bg-[#8ed8ff]/10 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#8ed8ff] transition hover:border-[#8ed8ff] hover:bg-[#8ed8ff]/16 hover:text-white"
              >
                Copy link
              </button>
            </div>
            <TestimonialsManager
              testimonials={data.testimonials}
              onChange={(testimonials) => updateData((current) => ({ ...current, testimonials }))}
              onDelete={stageDelete}
              notify={notify}
            />
          </section>
        )}
      </div>

      {editingProject && (
        <ProjectEditor
          project={editingProject}
          clients={data.clients}
          uploadFile={uploadFile}
          onClose={() => setEditingProject(null)}
          onSave={async (project) => {
            updateData((current) => ({
              ...current,
              projects: [...current.projects.filter((item) => item.id !== project.id), project].sort((a, b) => a.sort_order - b.sort_order),
            }));
            setEditingProject(null);
            notify('Project updated. Save changes to publish.');
          }}
          onError={notify}
        />
      )}
    </main>
  );
}

function ClientsManager({
  clients,
  onChange,
  onDelete,
  notify,
  uploadFile,
}: {
  clients: Client[];
  onChange: (clients: Client[]) => void;
  onDelete: (table: string, id: string) => void;
  notify: (message: string) => void;
  uploadFile: (file: File) => Promise<string>;
}) {
  const addClient = () => {
    onChange([
      ...clients,
      {
        id: crypto.randomUUID(),
        name: '',
        slug: '',
        logo_url: '',
        website_url: '',
        featured: true,
        sort_order: clients.length + 1,
      },
    ]);
  };

  const updateClient = (id: string, patch: Partial<Client>) => {
    onChange(clients.map((client) => (client.id === id ? { ...client, ...patch } : client)));
  };

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">Clients</h2>
          <p className="mt-1 text-sm text-white/45">Add client logos, then link projects to them from the project editor.</p>
        </div>
        <button onClick={addClient} className="accent-gradient px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#090909]">
          Add client
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {clients.map((client) => (
          <article key={client.id} className="border border-white/10 bg-white/[0.025] p-4">
            <div className="mb-4 flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-black/30">
                {client.logo_url ? (
                  <img src={client.logo_url} alt={client.name} className="h-full w-full object-contain p-2" />
                ) : (
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-[#8ed8ff]">Logo</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-black">{client.name || 'Untitled client'}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/35">{client.slug || 'client-slug'}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Name" value={client.name} onChange={(value) => updateClient(client.id, { name: value })} />
              <Field label="Slug" value={client.slug} onChange={(value) => updateClient(client.id, { slug: value })} />
              <Field label="Logo URL" value={client.logo_url} onChange={(value) => updateClient(client.id, { logo_url: value })} />
              <Field label="Website URL" value={client.website_url} onChange={(value) => updateClient(client.id, { website_url: value })} />
              <Field label="Sort order" value={client.sort_order} type="number" onChange={(value) => updateClient(client.id, { sort_order: Number(value) })} />
              <label className="flex items-center gap-3 border border-white/10 p-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={client.featured !== false}
                  onChange={(event) => updateClient(client.id, { featured: event.target.checked })}
                  className="h-4 w-4 accent-[#8ed8ff]"
                />
                Show in selected clients
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Upload logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadFile(file);
                      updateClient(client.id, { logo_url: url });
                      notify('Client logo uploaded. Save changes to keep it.');
                    } catch (uploadError) {
                      notify(uploadError instanceof Error ? uploadError.message : 'Logo upload failed');
                    }
                  }}
                  className="w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white file:mr-4 file:border-0 file:bg-[#4aa3ff] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-black"
                />
              </label>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={async () => {
                  if (!confirm('Delete this client? Projects will keep their manual client text.')) return;
                  onDelete('clients', client.id);
                  onChange(clients.filter((item) => item.id !== client.id));
                  notify('Client deleted. Save changes to publish.');
                }}
                className="border border-red-400/30 px-3 py-2 text-xs font-bold text-red-200"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SkillsManager({
  skills,
  onChange,
  onDelete,
  notify,
}: {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  onDelete: (table: string, id: string) => void;
  notify: (message: string) => void;
}) {
  const addSkill = (program = 'Adobe After Effects') => {
    onChange([
      ...skills,
      {
        id: crypto.randomUUID(),
        name: 'New skill',
        level: 90,
        category: '',
        program,
        program_skill: 'New skill',
        editing_field: '',
        sort_order: skills.length + 1,
      },
    ]);
  };

  const updateSkill = (id: string, patch: Partial<Skill>) => {
    onChange(skills.map((skill) => (skill.id === id ? { ...skill, ...patch } : skill)));
  };

  const sortedSkills = [...skills].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const programs = Array.from(
    sortedSkills.reduce<Map<string, Skill[]>>((acc, skill) => {
      const program = skill.program || 'Adobe After Effects';
      acc.set(program, [...(acc.get(program) || []), skill]);
      return acc;
    }, new Map()).entries(),
  );

  return (
    <div className="border border-white/10 bg-white/[0.025] p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">Skills Settings</h2>
          <p className="mt-1 text-sm text-white/45">Write the software, skill name, and level freely. Matching software names are grouped together.</p>
        </div>
        <button onClick={() => addSkill()} className="rounded-full border border-[#8ed8ff]/60 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#8ed8ff]">
          Add skill
        </button>
      </div>
      <div className="grid gap-4">
        {programs.map(([program, programSkills]) => (
          <section key={program} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-black text-white">{program}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">
                  {programSkills.length} skills inside this software
                </p>
              </div>
              <button
                onClick={() => addSkill(program)}
                className="rounded-full border border-[#8ed8ff]/45 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8ed8ff] transition hover:border-[#8ed8ff] hover:text-white"
              >
                Add skill to this program
              </button>
            </div>

            <div className="grid gap-3">
              {programSkills.map((skill) => (
                <article key={skill.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Program" value={skill.program || ''} onChange={(value) => updateSkill(skill.id, { program: value })} />
                    <Field label="Skill name" value={skill.program_skill || skill.name} onChange={(value) => updateSkill(skill.id, { program_skill: value, name: value })} />
                    <Field label="Level %" value={skill.level} type="number" onChange={(value) => updateSkill(skill.id, { level: Number(value) })} />
                    <Field label="Sort order" value={skill.sort_order ?? 0} type="number" onChange={(value) => updateSkill(skill.id, { sort_order: Number(value) })} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        onDelete('skills', skill.id);
                        onChange(skills.filter((item) => item.id !== skill.id));
                        notify('Skill deleted. Save changes to publish.');
                      }}
                      className="rounded-full border border-red-400/30 px-4 py-2 text-xs font-bold text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function TestimonialsManager({
  testimonials,
  onChange,
  onDelete,
  notify,
}: {
  testimonials: Testimonial[];
  onChange: (testimonials: Testimonial[]) => void;
  onDelete: (table: string, id: string) => void;
  notify: (message: string) => void;
}) {
  const updateTestimonial = (id: string, patch: Partial<Testimonial>) => {
    onChange(testimonials.map((testimonial) => (testimonial.id === id ? { ...testimonial, ...patch } : testimonial)));
  };

  return (
    <div className="grid gap-4">
      {testimonials.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 text-sm text-white/48">No testimonials yet.</div>
      )}
      {testimonials.map((testimonial) => (
        <article key={testimonial.id} className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-black">{testimonial.name || 'Unnamed client'}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/38">
                {[testimonial.role, testimonial.company].filter(Boolean).join(' / ') || 'No company'}
              </p>
            </div>
            <label className="flex items-center gap-3 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white/70">
              <input
                type="checkbox"
                checked={testimonial.approved !== false}
                onChange={(event) => updateTestimonial(testimonial.id, { approved: event.target.checked })}
                className="h-4 w-4 accent-[#8ed8ff]"
              />
              Show on homepage
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Name" value={testimonial.name} onChange={(value) => updateTestimonial(testimonial.id, { name: value })} />
            <Field label="Company" value={testimonial.company} onChange={(value) => updateTestimonial(testimonial.id, { company: value })} />
            <Field label="Role" value={testimonial.role} onChange={(value) => updateTestimonial(testimonial.id, { role: value })} />
            <Field label="Rating" value={testimonial.rating} type="number" onChange={(value) => updateTestimonial(testimonial.id, { rating: Number(value) })} />
            <div className="md:col-span-2">
              <Field label="Content" value={testimonial.content} onChange={(value) => updateTestimonial(testimonial.id, { content: value })} textarea />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                onDelete('testimonials', testimonial.id);
                onChange(testimonials.filter((item) => item.id !== testimonial.id));
                notify('Testimonial deleted. Save changes to publish.');
              }}
              className="rounded-full border border-red-400/30 px-4 py-2 text-xs font-bold text-red-200"
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function EditableList({
  title,
  items,
  table,
  fields,
  newItem,
  onChange,
  onDelete,
  notify,
}: {
  title: string;
  items: Array<Record<string, any>>;
  table: string;
  fields: string[];
  newItem: Record<string, any>;
  onChange: (items: Array<Record<string, any>>) => void;
  onDelete: (table: string, id: string) => void;
  notify: (message: string) => void;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.025] p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-black">{title}</h2>
        <button
          onClick={() => onChange([...items, { ...newItem, id: crypto.randomUUID() }])}
          className="border border-[#8ed8ff]/60 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#8ed8ff]"
        >
          Add
        </button>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={String(item.id)} className="border border-white/10 p-4">
            <div className="grid gap-3">
              {fields.map((field) => (
                <Field
                  key={field}
                  label={field.replace(/_/g, ' ')}
                  value={String(item[field] ?? '')}
                  type={field === 'level' || field === 'sort_order' ? 'number' : 'text'}
                  onChange={(value) => onChange(items.map((row) => (row.id === item.id ? { ...row, [field]: field === 'level' || field === 'sort_order' ? Number(value) : value } : row)))}
                />
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  onDelete(table, String(item.id));
                  onChange(items.filter((row) => row.id !== item.id));
                  notify(`${title} deleted. Save changes to publish.`);
                }}
                className="border border-red-400/30 px-3 py-2 text-xs font-bold text-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectEditor({
  project,
  clients,
  onClose,
  onSave,
  onError,
  uploadFile,
}: {
  project: Project;
  clients: Client[];
  onClose: () => void;
  onSave: (project: Project) => Promise<void>;
  onError: (message: string) => void;
  uploadFile: (file: File) => Promise<string>;
}) {
  const [form, setForm] = useState(project);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(project.technologies || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const availableTechnologies = ['After Effects', 'AI tools', 'Illustrator', 'Photoshop', 'Blender3D', 'Premier Pro'];
  const isDirty = useMemo(() => {
    return JSON.stringify({ ...form, technologies: selectedTechnologies }) !== JSON.stringify({ ...project, technologies: project.technologies || [] });
  }, [form, project, selectedTechnologies]);

  const set = (key: keyof Project, value: string | number | boolean | string[] | null) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const closeEditor = () => {
    if (isDirty && !confirm('Discard project changes?')) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/74 p-3 backdrop-blur-xl sm:p-5">
      <div className="mx-auto my-5 max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f12] shadow-2xl shadow-black/55">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0d0f12]/92 p-5 backdrop-blur-xl">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8ed8ff]">{project.title ? 'Editing project' : 'Create project'}</p>
            <h2 className="mt-1 text-2xl font-black">{project.title || 'New project'}</h2>
          </div>
          <button onClick={closeEditor} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-lg font-black text-white/70 transition hover:border-white/25 hover:text-white">X</button>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <Field label="Title EN" value={form.title} onChange={(value) => set('title', value)} />
          <Field label="Title AR" value={form.title_ar} onChange={(value) => set('title_ar', value)} />
          <Field label="Description EN" value={form.description} onChange={(value) => set('description', value)} textarea />
          <Field label="Description AR" value={form.description_ar} onChange={(value) => set('description_ar', value)} textarea />
          <label className="block md:col-span-2">
            <span className="mb-3 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Category</span>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {CATEGORIES.map((category) => (
                <label key={category.value} className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-sm text-white/70 transition hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={form.category.includes(category.value)}
                    onChange={(event) => {
                      if (event.target.checked) {
                        set('category', [...form.category, category.value]);
                      } else {
                        set('category', form.category.filter((value) => value !== category.value));
                      }
                    }}
                    className="h-4 w-4 accent-[#8ed8ff] cursor-pointer"
                  />
                  {category.label}
                </label>
              ))}
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Client</span>
            <select
              value={form.client_id || ''}
              onChange={(event) => {
                const client = clients.find((item) => item.id === event.target.value);
                setForm((current) => ({
                  ...current,
                  client_id: client?.id || null,
                  client: client?.name || current.client,
                }));
              }}
              className="w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#8ed8ff]/70"
            >
              <option value="">Manual client text</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name || 'Untitled client'}
                </option>
              ))}
            </select>
          </label>
          <Field label="Client text fallback" value={form.client} onChange={(value) => set('client', value)} />
          <Field label="Role" value={form.role} onChange={(value) => set('role', value)} />
          <Field label="Year" value={form.year} type="number" onChange={(value) => set('year', Number(value))} />
          <Field label="Duration" value={form.duration} onChange={(value) => set('duration', value)} />
          <Field label="Sort order" value={form.sort_order} type="number" onChange={(value) => set('sort_order', Number(value))} />
          <Field label="Video URL (Drive / YouTube / Vimeo / direct)" value={form.video_url} onChange={(value) => set('video_url', value)} />
          <Field label="Thumbnail URL" value={form.thumbnail} onChange={(value) => set('thumbnail', value)} />
          <label className="block md:col-span-2">
            <span className="mb-3 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Technologies</span>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {availableTechnologies.map((tech) => (
                <label key={tech} className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-sm text-white/70 transition hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={selectedTechnologies.includes(tech)}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedTechnologies([...selectedTechnologies, tech]);
                      } else {
                        setSelectedTechnologies(selectedTechnologies.filter((t) => t !== tech));
                      }
                    }}
                    className="h-4 w-4 accent-[#8ed8ff] cursor-pointer"
                  />
                  {tech}
                </label>
              ))}
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Upload thumbnail or video</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  setError('');
                  const url = await uploadFile(file);
                  if (file.type.startsWith('image/')) set('thumbnail', url);
                  if (file.type.startsWith('video/')) set('video_url', url);
                } catch (uploadError) {
                  const message = uploadError instanceof Error ? uploadError.message : 'Upload failed';
                  setError(message);
                  onError(message);
                }
              }}
              className="w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white file:mr-4 file:border-0 file:bg-[#4aa3ff] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-black"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-[#8ed8ff]/20 bg-[#8ed8ff]/10 p-3 text-sm font-bold text-white/78">
            <input type="checkbox" checked={form.featured} onChange={(event) => set('featured', event.target.checked)} className="h-4 w-4 accent-[#8ed8ff]" />
            Featured project
          </label>
        </div>
        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-white/10 bg-[#0d0f12]/92 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-end">
          {error && <p className="mr-auto max-w-md text-sm leading-6 text-red-300">{error}</p>}
          <button onClick={closeEditor} className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white/64 transition hover:border-white/25 hover:text-white">Cancel</button>
          <button
            disabled={saving || !(form.title || form.title_ar) || !(form.description || form.description_ar)}
            onClick={async () => {
              setSaving(true);
              setError('');
              try {
                await onSave({ ...form, technologies: selectedTechnologies });
              } catch (saveError) {
                const message = saveError instanceof Error ? saveError.message : 'Project save failed';
                setError(message);
                onError(message);
              } finally {
                setSaving(false);
              }
            }}
            className="accent-gradient rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#090909] disabled:opacity-50"
          >
            {saving ? 'Applying...' : 'Apply project changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
