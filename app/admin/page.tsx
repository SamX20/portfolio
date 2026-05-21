'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CATEGORIES, ContactInfo, Locale, Profile, Project, SectionsData, Skill, SocialLink, Stat } from '@/types';
import { defaultContacts, defaultProfile, defaultProjects, defaultSections, defaultSkills, defaultSocials, defaultStats } from '@/lib/portfolioDefaults';

type Tab = 'content' | 'projects' | 'contacts' | 'skills';

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
  socials: SocialLink[];
  skills: Skill[];
  profile: Profile;
  sections: SectionsData;
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
  const [data, setData] = useState<AdminData>({
    projects: defaultProjects,
    stats: defaultStats,
    contacts: defaultContacts,
    socials: defaultSocials,
    skills: defaultSkills,
    profile: defaultProfile,
    sections: defaultSections,
  });

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
        socials: SocialLink[];
        skills: Skill[];
        profile: Profile | null;
        sections: { section: string; key: string; value: string }[];
      }>('/api/admin/data');

      setData({
        projects: response.projects,
        stats: response.stats,
        contacts: response.contacts,
        socials: response.socials,
        skills: response.skills,
        profile: response.profile || defaultProfile,
        sections: mapSections(response.sections),
      });
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

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

  const saveContent = async () => {
    setSaving(true);
    try {
      await api('/api/admin/data', {
        method: 'PUT',
        body: JSON.stringify({ profile: data.profile, sections: data.sections }),
      });
      notify('Main page saved');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Save failed');
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
    setData((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));
  };

  const setSection = (section: keyof SectionsData, key: string, value: string) => {
    setData((current) => ({
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
              ['contacts', 'Contact / Social'],
              ['skills', 'Skills / Stats'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTab(value as Tab)}
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

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {toast && <div className="mb-5 border border-[#8ed8ff]/40 bg-[#8ed8ff]/10 p-3 text-sm text-[#8ed8ff]">{toast}</div>}

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
              <button onClick={saveContent} disabled={saving} className="accent-gradient mt-6 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#090909] disabled:opacity-50">
                {saving ? 'Saving...' : 'Save main page'}
              </button>
            </div>
          </section>
        )}

        {tab === 'projects' && (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">Projects</h2>
              <button onClick={() => setEditingProject({ ...emptyProject, id: crypto.randomUUID(), sort_order: data.projects.length + 1 })} className="accent-gradient px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#090909]">
                Add project
              </button>
            </div>
            <div className="grid gap-3">
              {data.projects.map((project) => (
                <article key={project.id} className="grid gap-4 border border-white/10 bg-white/[0.025] p-4 md:grid-cols-[96px_1fr_auto] md:items-center">
                  <div className="aspect-video bg-black">
                    {project.thumbnail ? <img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div>
                    <p className="font-black">{project.title}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-white/45">{project.description}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#8ed8ff]">
                      {project.category
                        .map((cat) => CATEGORIES.find((item) => item.value === cat)?.label ?? cat)
                        .join(' / ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingProject(project)} className="border border-white/10 px-3 py-2 text-xs font-bold text-white/70">Edit</button>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this project?')) return;
                        await deleteRecord('projects', project.id);
                        setData((current) => ({ ...current, projects: current.projects.filter((item) => item.id !== project.id) }));
                        notify('Project deleted');
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
        )}

        {tab === 'contacts' && (
          <section className="grid gap-5 lg:grid-cols-2">
            <EditableList
              title="Contact methods"
              items={data.contacts}
              table="contact_info"
              fields={['icon', 'title', 'content', 'href']}
              newItem={{ id: '', icon: '@', title: 'Email', content: '', href: '' }}
              onChange={(contacts) => setData((current) => ({ ...current, contacts: contacts as ContactInfo[] }))}
              saveRecord={saveRecord}
              deleteRecord={deleteRecord}
              notify={notify}
            />
            <EditableList
              title="Social links"
              items={data.socials}
              table="social_links"
              fields={['name', 'url', 'icon', 'sort_order']}
              newItem={{ id: '', name: 'Instagram', url: '', icon: '', sort_order: data.socials.length + 1 }}
              onChange={(socials) => setData((current) => ({ ...current, socials: socials as SocialLink[] }))}
              saveRecord={saveRecord}
              deleteRecord={deleteRecord}
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
              onChange={(stats) => setData((current) => ({ ...current, stats: stats as Stat[] }))}
              saveRecord={saveRecord}
              deleteRecord={deleteRecord}
              notify={notify}
            />
            <EditableList
              title="Skills"
              items={data.skills}
              table="skills"
              fields={['name', 'level', 'category']}
              newItem={{ id: '', name: 'After Effects', level: 90, category: 'Motion' }}
              onChange={(skills) => setData((current) => ({ ...current, skills: skills as Skill[] }))}
              saveRecord={saveRecord}
              deleteRecord={deleteRecord}
              notify={notify}
            />
          </section>
        )}
      </div>

      {editingProject && (
        <ProjectEditor
          project={editingProject}
          uploadFile={uploadFile}
          onClose={() => setEditingProject(null)}
          onSave={async (project) => {
            await saveRecord('projects', project);
            setData((current) => ({
              ...current,
              projects: [...current.projects.filter((item) => item.id !== project.id), project].sort((a, b) => a.sort_order - b.sort_order),
            }));
            setEditingProject(null);
            notify('Project saved');
          }}
          onError={notify}
        />
      )}
    </main>
  );
}

function EditableList({
  title,
  items,
  table,
  fields,
  newItem,
  onChange,
  saveRecord,
  deleteRecord,
  notify,
}: {
  title: string;
  items: Array<Record<string, any>>;
  table: string;
  fields: string[];
  newItem: Record<string, any>;
  onChange: (items: Array<Record<string, any>>) => void;
  saveRecord: (table: string, record: object) => Promise<void>;
  deleteRecord: (table: string, id: string) => Promise<void>;
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
                onClick={async () => {
                  await saveRecord(table, item);
                  notify(`${title} saved`);
                }}
                className="accent-gradient px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#090909]"
              >
                Save
              </button>
              <button
                onClick={async () => {
                  await deleteRecord(table, String(item.id));
                  onChange(items.filter((row) => row.id !== item.id));
                  notify(`${title} deleted`);
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
  onClose,
  onSave,
  onError,
  uploadFile,
}: {
  project: Project;
  onClose: () => void;
  onSave: (project: Project) => Promise<void>;
  onError: (message: string) => void;
  uploadFile: (file: File) => Promise<string>;
}) {
  const [form, setForm] = useState(project);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(project.technologies);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const availableTechnologies = ['After Effects', 'AI tools', 'Illustrator', 'Photoshop', 'Blender3D', 'Premier Pro'];

  const set = (key: keyof Project, value: string | number | boolean | string[]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/84 p-4 backdrop-blur-xl">
      <div className="mx-auto my-8 max-w-4xl border border-white/10 bg-[#101010]">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="text-xl font-black">{project.title ? 'Edit project' : 'New project'}</h2>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center border border-white/10 text-white/70">×</button>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <Field label="Title EN" value={form.title} onChange={(value) => set('title', value)} />
          <Field label="Title AR" value={form.title_ar} onChange={(value) => set('title_ar', value)} />
          <Field label="Description EN" value={form.description} onChange={(value) => set('description', value)} textarea />
          <Field label="Description AR" value={form.description_ar} onChange={(value) => set('description_ar', value)} textarea />
          <label className="block md:col-span-2">
            <span className="mb-3 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Category</span>
            <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
              {CATEGORIES.map((category) => (
                <label key={category.value} className="flex items-center gap-2 border border-white/10 p-3 text-sm text-white/70 cursor-pointer hover:bg-white/5">
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
          <Field label="Client" value={form.client} onChange={(value) => set('client', value)} />
          <Field label="Role" value={form.role} onChange={(value) => set('role', value)} />
          <Field label="Year" value={form.year} type="number" onChange={(value) => set('year', Number(value))} />
          <Field label="Duration" value={form.duration} onChange={(value) => set('duration', value)} />
          <Field label="Sort order" value={form.sort_order} type="number" onChange={(value) => set('sort_order', Number(value))} />
          <Field label="Video URL (Drive / YouTube / Vimeo / direct)" value={form.video_url} onChange={(value) => set('video_url', value)} />
          <Field label="Thumbnail URL" value={form.thumbnail} onChange={(value) => set('thumbnail', value)} />
          <label className="block md:col-span-2">
            <span className="mb-3 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Technologies</span>
            <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
              {availableTechnologies.map((tech) => (
                <label key={tech} className="flex items-center gap-2 border border-white/10 p-3 text-sm text-white/70 cursor-pointer hover:bg-white/5">
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
          <label className="flex items-center gap-3 border border-white/10 p-3 text-sm text-white/70">
            <input type="checkbox" checked={form.featured} onChange={(event) => set('featured', event.target.checked)} className="h-4 w-4 accent-[#8ed8ff]" />
            Featured project
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-white/10 p-5">
          {error && <p className="mr-auto max-w-md text-sm leading-6 text-red-300">{error}</p>}
          <button onClick={onClose} className="border border-white/10 px-4 py-2 text-sm font-bold text-white/64">Cancel</button>
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
            className="accent-gradient px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#090909] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save project'}
          </button>
        </div>
      </div>
    </div>
  );
}
