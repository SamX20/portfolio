'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { CATEGORIES, ContactInfo, Profile, Project, SectionsData, Skill, SocialLink, Stat } from '@/types';
import { defaultContacts, defaultProfile, defaultProjects, defaultSections, defaultSkills, defaultSocials, defaultStats } from '@/lib/portfolioDefaults';

type Tab = 'content' | 'projects' | 'contacts' | 'skills';

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
  category: 'motion-design',
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

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
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
    'w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#f2ff5e]/70';

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
        projects: response.projects.length ? response.projects : defaultProjects,
        stats: response.stats.length ? response.stats : defaultStats,
        contacts: response.contacts.length ? response.contacts : defaultContacts,
        socials: response.socials.length ? response.socials : defaultSocials,
        skills: response.skills.length ? response.skills : defaultSkills,
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
    await api('/api/admin/data', {
      method: 'POST',
      body: JSON.stringify({ table, record }),
    });
  };

  const deleteRecord = async (table: string, id: string) => {
    await api('/api/admin/data', {
      method: 'DELETE',
      body: JSON.stringify({ table, id }),
    });
  };

  const uploadFile = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch('/api/upload', { method: 'POST', body: form });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Upload failed');
    return result.url as string;
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

  const projectTech = useMemo(() => editingProject?.technologies?.join(', ') || '', [editingProject]);

  if (loading && !authed) {
    return <div className="grid min-h-screen place-items-center bg-[#080808] text-white">Loading admin...</div>;
  }

  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#080808] px-4 text-white">
        <form onSubmit={login} className="w-full max-w-md border border-white/10 bg-white/[0.03] p-7">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.34em] text-[#f2ff5e]">Sam Admin</p>
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
            className="mt-6 h-12 w-full border border-white/10 bg-black/35 px-4 text-white outline-none focus:border-[#f2ff5e]/70"
          />
          <button disabled={saving || !password} className="mt-4 w-full bg-[#f2ff5e] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black disabled:opacity-50">
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
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#f2ff5e]">Sam Motion Admin</p>
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
                  tab === value ? 'border-[#f2ff5e] bg-[#f2ff5e] text-black' : 'border-white/10 text-white/55 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {toast && <div className="mb-5 border border-[#f2ff5e]/40 bg-[#f2ff5e]/10 p-3 text-sm text-[#f2ff5e]">{toast}</div>}

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
              <button onClick={saveContent} disabled={saving} className="mt-6 bg-[#f2ff5e] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black disabled:opacity-50">
                {saving ? 'Saving...' : 'Save main page'}
              </button>
            </div>
          </section>
        )}

        {tab === 'projects' && (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">Projects</h2>
              <button onClick={() => setEditingProject({ ...emptyProject, id: crypto.randomUUID(), sort_order: data.projects.length + 1 })} className="bg-[#f2ff5e] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-black">
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
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#f2ff5e]">{project.category}</p>
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
          className="border border-[#f2ff5e]/60 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#f2ff5e]"
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
                className="bg-[#f2ff5e] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-black"
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
  uploadFile,
}: {
  project: Project;
  onClose: () => void;
  onSave: (project: Project) => Promise<void>;
  uploadFile: (file: File) => Promise<string>;
}) {
  const [form, setForm] = useState(project);
  const [tech, setTech] = useState(project.technologies.join(', '));
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Project, value: string | number | boolean) => {
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
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Category</span>
            <select value={form.category} onChange={(event) => set('category', event.target.value)} className="w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none focus:border-[#f2ff5e]/70">
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </label>
          <Field label="Client" value={form.client} onChange={(value) => set('client', value)} />
          <Field label="Role" value={form.role} onChange={(value) => set('role', value)} />
          <Field label="Year" value={form.year} type="number" onChange={(value) => set('year', Number(value))} />
          <Field label="Duration" value={form.duration} onChange={(value) => set('duration', value)} />
          <Field label="Sort order" value={form.sort_order} type="number" onChange={(value) => set('sort_order', Number(value))} />
          <Field label="Video URL (Drive / YouTube / Vimeo / direct)" value={form.video_url} onChange={(value) => set('video_url', value)} />
          <Field label="Thumbnail URL" value={form.thumbnail} onChange={(value) => set('thumbnail', value)} />
          <Field label="Technologies, comma separated" value={tech} onChange={setTech} />
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Upload thumbnail or video</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const url = await uploadFile(file);
                if (file.type.startsWith('image/')) set('thumbnail', url);
                if (file.type.startsWith('video/')) set('video_url', url);
              }}
              className="w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white file:mr-4 file:border-0 file:bg-[#f2ff5e] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-black"
            />
          </label>
          <label className="flex items-center gap-3 border border-white/10 p-3 text-sm text-white/70">
            <input type="checkbox" checked={form.featured} onChange={(event) => set('featured', event.target.checked)} className="h-4 w-4 accent-[#f2ff5e]" />
            Featured project
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-white/10 p-5">
          <button onClick={onClose} className="border border-white/10 px-4 py-2 text-sm font-bold text-white/64">Cancel</button>
          <button
            disabled={saving || !form.title || !form.description}
            onClick={async () => {
              setSaving(true);
              await onSave({ ...form, technologies: tech.split(',').map((item) => item.trim()).filter(Boolean) });
              setSaving(false);
            }}
            className="bg-[#f2ff5e] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save project'}
          </button>
        </div>
      </div>
    </div>
  );
}
