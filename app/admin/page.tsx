'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import { LuAtSign, LuChartColumn, LuClapperboard, LuCopy, LuExternalLink, LuHouse, LuInbox, LuLayoutDashboard, LuLogOut, LuMenu, LuPlus, LuQuote, LuSparkles, LuTriangleAlert, LuUsers, LuWandSparkles, LuX } from 'react-icons/lu';
import { LogoLockup } from '@/components/Logo';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CATEGORIES, Client, ContactInfo, Locale, Profile, Project, SectionsData, Service, ServiceItem, ServiceWork, Skill, SkillProgram, SocialLink, Stat, Testimonial } from '@/types';
import { DynamicIcon, ICON_OPTIONS } from '@/lib/icons';
import { getServicePreset, getServiceWorkKind, SERVICE_PRESETS, ServiceWorkKind } from '@/lib/services';
import { defaultClients, defaultContacts, defaultProfile, defaultProjects, defaultSections, defaultSkillPrograms, defaultSkills, defaultSocials, defaultStats, defaultTestimonials } from '@/lib/portfolioDefaults';
import VideoOptimizer, { UploadedVideoResult } from '@/components/admin/VideoOptimizer';
import VideoFramePicker from '@/components/admin/VideoFramePicker';
import { PORTFOLIO_TECHNOLOGIES, ProjectMetadataCandidate, ProjectMetadataInput, ProjectMetadataSuggestion } from '@/lib/projectMetadata';

type Tab = 'overview' | 'content' | 'inquiries' | 'projects' | 'services' | 'media' | 'clients' | 'contacts' | 'skills' | 'testimonials';

interface NavItem {
  id: Tab;
  label: string;
  description: string;
  icon: IconType;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  { label: '', items: [{ id: 'overview', label: 'Overview', description: 'What needs your attention, at a glance.', icon: LuLayoutDashboard }] },
  { label: 'Inbox', items: [{ id: 'inquiries', label: 'Inquiries', description: 'Messages from the contact form. Each one is saved here and sent to your WhatsApp.', icon: LuInbox }] },
  {
    label: 'Website',
    items: [
      { id: 'content', label: 'Home page', description: 'Hero text, showreels, the studio section and the footer.', icon: LuHouse },
      { id: 'services', label: 'Services', description: 'What you offer. Each service can list what is included and show work done outside the site.', icon: LuSparkles },
      { id: 'projects', label: 'Projects', description: 'Video and motion work shown in the Work section.', icon: LuClapperboard },
      { id: 'clients', label: 'Clients', description: 'Logos in the “Trusted by” strip. Clicking one filters the work.', icon: LuUsers },
      { id: 'testimonials', label: 'Testimonials', description: 'Feedback from clients. Share the client link to collect new ones.', icon: LuQuote },
      { id: 'skills', label: 'Stats & tools', description: 'The numbers and the tools shown in the studio section.', icon: LuChartColumn },
      { id: 'contacts', label: 'Contact & social', description: 'Contact details and social links shown in the contact section and footer.', icon: LuAtSign },
    ],
  },
  { label: 'Tools', items: [{ id: 'media', label: 'Video optimizer', description: 'Turn raw videos into fast web versions, a hover preview and a thumbnail, with an AI-written project draft.', icon: LuWandSparkles }] },
];
const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

interface InquirySummary {
  total: number;
  attention: number;
  failed: number;
  webhookConfigured: boolean;
  recent: { id: string; name: string; service: string | null; status: string; created_at: string }[];
}

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
  skillPrograms: SkillProgram[];
  skills: Skill[];
  testimonials: Testimonial[];
  services: Service[];
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
  hover_video_url: '',
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

async function api<T>(url: string, init?: RequestInit, timeoutMs = 15_000): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

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

function formatProjectDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function projectFromIngestion(result: UploadedVideoResult, sortOrder: number): Project {
  const suggestion = result.suggestion;
  return {
    ...emptyProject,
    id: result.draftId,
    title: suggestion?.title || '',
    title_ar: suggestion?.title_ar || '',
    description: suggestion?.description || '',
    description_ar: suggestion?.description_ar || '',
    category: suggestion?.category?.length ? suggestion.category : emptyProject.category,
    role: suggestion?.role || '',
    technologies: suggestion?.technologies || [],
    duration: formatProjectDuration(result.metadata.duration),
    video_url: result.fullUrl,
    hover_video_url: result.hoverUrl,
    thumbnail: result.thumbnailUrl,
    sort_order: sortOrder,
  };
}

function projectMatchingCandidate(project: Project): ProjectMetadataCandidate {
  return {
    id: project.id,
    title: (project.title || '').slice(0, 140),
    title_ar: (project.title_ar || '').slice(0, 140),
    description: (project.description || '').slice(0, 600),
    description_ar: (project.description_ar || '').slice(0, 600),
    client: (project.client || '').slice(0, 140),
    year: project.year,
    category: project.category,
  };
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
    'w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#f5f5f4]/70';

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
  const [uploadingAltHeroVideo, setUploadingAltHeroVideo] = useState(false);
  const [altUploadProgress, setAltUploadProgress] = useState(0);
  const [selectedAltHeroVideoFile, setSelectedAltHeroVideoFile] = useState<File | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [navOpen, setNavOpen] = useState(false);
  const [inquirySummary, setInquirySummary] = useState<InquirySummary>({ total: 0, attention: 0, failed: 0, webhookConfigured: true, recent: [] });
  const [toast, setToast] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingDeletes, setPendingDeletes] = useState<PendingDelete[]>([]);
  const [savedData, setSavedData] = useState<AdminData | null>(null);
  const [data, setData] = useState<AdminData>({
    projects: defaultProjects,
    stats: defaultStats,
    contacts: defaultContacts,
    clients: defaultClients,
    socials: defaultSocials,
    skillPrograms: defaultSkillPrograms,
    skills: defaultSkills,
    testimonials: defaultTestimonials,
    services: [],
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
        skillPrograms?: SkillProgram[];
        skills: Skill[];
        testimonials: Testimonial[];
        services?: Service[];
        profile: Profile | null;
        sections: { section: string; key: string; value: string }[];
      }>('/api/admin/data');

      const derivedPrograms = Array.from(new Set(response.skills.map((skill) => skill.program || skill.name)))
        .filter(Boolean)
        .map((name, index) => ({ id: `program-${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name, sort_order: index + 1 }));

      const nextData: AdminData = {
        projects: response.projects,
        stats: response.stats,
        contacts: response.contacts,
        clients: response.clients || [],
        socials: response.socials,
        skillPrograms: response.skillPrograms?.length ? response.skillPrograms : derivedPrograms,
        skills: response.skills,
        testimonials: response.testimonials || [],
        services: response.services || [],
        profile: response.profile || defaultProfile,
        sections: mapSections(response.sections),
      };

      setData(nextData);
      setSavedData(structuredClone(nextData));
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

  const refreshInquirySummary = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/inquiries', { cache: 'no-store' });
      if (!response.ok) return;
      const result = await response.json();
      const items: InquirySummary['recent'] = result.inquiries || [];
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      setInquirySummary({
        total: items.length,
        failed: items.filter((item) => item.status !== 'delivered').length,
        attention: items.filter((item) => item.status !== 'delivered' || new Date(item.created_at).getTime() > weekAgo).length,
        webhookConfigured: Boolean(result.webhookConfigured),
        recent: items.slice(0, 5),
      });
    } catch {
      // The overview still works without inquiry numbers.
    }
  }, []);

  const changeTab = (nextTab: Tab) => {
    setTab(nextTab);
    window.scrollTo({ top: 0 });
    if (nextTab === 'overview' || nextTab === 'inquiries') void refreshInquirySummary();
  };

  useEffect(() => {
    api<{ authed: boolean; configured: boolean }>('/api/admin/session')
      .then((session) => {
        setAuthed(session.authed);
        setConfigured(session.configured);
        if (session.authed) {
          void refreshInquirySummary();
          return load();
        }
      })
      .finally(() => setLoading(false));
  }, [load, refreshInquirySummary]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api('/api/admin/session', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      setAuthed(true);
      void refreshInquirySummary();
      await load();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setSaving(false);
    }
  };

  const saveRecords = async (table: string, records: object[]) => {
    if (!records.length) return [];

    const result = await api<{ missingColumns?: string[] }>('/api/admin/data', {
      method: 'POST',
      body: JSON.stringify({ table, records }),
    });

    if (result.missingColumns?.length) {
      notify(`Saved, but missing DB columns were skipped: ${result.missingColumns.join(', ')}`);
    }

    return records;
  };

  const saveAllChanges = async () => {
    setSaving(true);
    try {
      const changedRecords = <T extends { id: string }>(current: T[], saved: T[] = []) => {
        const savedById = new Map(saved.map((record) => [record.id, record]));
        return current.filter((record) => JSON.stringify(record) !== JSON.stringify(savedById.get(record.id)));
      };

      const profileChanged = !savedData || JSON.stringify(data.profile) !== JSON.stringify(savedData.profile);
      const sectionsChanged = !savedData || JSON.stringify(data.sections) !== JSON.stringify(savedData.sections);
      const recordGroups = [
        ['projects', changedRecords(data.projects, savedData?.projects)],
        ['clients', changedRecords(data.clients, savedData?.clients)],
        ['stats', changedRecords(data.stats, savedData?.stats)],
        ['contact_info', changedRecords(data.contacts, savedData?.contacts)],
        ['social_links', changedRecords(data.socials, savedData?.socials)],
        ['skill_programs', changedRecords(data.skillPrograms, savedData?.skillPrograms)],
        ['skills', changedRecords(data.skills, savedData?.skills)],
        ['testimonials', changedRecords(data.testimonials, savedData?.testimonials)],
        ['services', changedRecords(data.services, savedData?.services)],
      ] as const;

      const requests: Promise<unknown>[] = recordGroups.map(([table, records]) => saveRecords(table, records));

      if (profileChanged || sectionsChanged) {
        requests.push(api('/api/admin/data', {
          method: 'PUT',
          body: JSON.stringify({
            profile: profileChanged ? data.profile : undefined,
            sections: sectionsChanged ? data.sections : undefined,
          }),
        }));
      }

      requests.push(...pendingDeletes.map((item) => deleteRecord(item.table, item.id)));
      await Promise.all(requests);

      const savedCount = recordGroups.reduce((total, [, records]) => total + records.length, 0)
        + pendingDeletes.length
        + Number(profileChanged)
        + Number(sectionsChanged);

      setSavedData(structuredClone(data));
      setHasUnsavedChanges(false);
      setPendingDeletes([]);
      notify(savedCount ? `${savedCount} change${savedCount === 1 ? '' : 's'} saved` : 'No changes to save');
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
        cacheControl: '31536000',
        upsert: true,
      });

    if (error) {
      throw new Error(error.message || 'Upload failed.');
    }

    onProgress?.(100);
    return ticket.url;
  };

  const generateProjectMetadata = async (input: Omit<ProjectMetadataInput, 'existingProjects'>) => {
    const response = await api<{ metadata: ProjectMetadataSuggestion }>(
      '/api/admin/ai/project-metadata',
      {
        method: 'POST',
        body: JSON.stringify({
          ...input,
          existingProjects: data.projects.map(projectMatchingCandidate),
        }),
      },
      65_000,
    );
    return response.metadata;
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
    return <div className="admin-shell grid min-h-screen place-items-center text-white">Loading admin...</div>;
  }

  if (!authed) {
    return (
      <main className="admin-shell grid min-h-screen place-items-center px-4 text-white">
        <form onSubmit={login} className="admin-login-panel w-full max-w-md border border-white/10 p-8 sm:p-10">
          <p className="eyebrow mb-4">Xsamer Admin</p>
          <h1 className="display text-4xl">Control room</h1>
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
            className="field mt-6"
          />
          <button disabled={saving || !password} className="btn btn-primary mt-6 h-12 w-full disabled:opacity-50">
            {saving ? 'Checking...' : 'Enter'}
          </button>
          {toast && <p className="mt-4 text-sm text-red-200">{toast}</p>}
        </form>
      </main>
    );
  }

  const currentPage = NAV_ITEMS.find((item) => item.id === tab) || NAV_ITEMS[0];
  const pendingTestimonials = data.testimonials.filter((testimonial) => testimonial.approved === false).length;
  const copyTestimonialLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/share-testimonial`);
    notify('Testimonial link copied');
  };
  const logout = async () => {
    if (hasUnsavedChanges && !confirm('You have unsaved changes. Log out anyway?')) return;
    await api('/api/admin/session', { method: 'DELETE' }).catch(() => undefined);
    setAuthed(false);
    setPassword('');
  };
  const pageActions: Partial<Record<Tab, React.ReactNode>> = {
    projects: (
      <button type="button" onClick={startNewProject} className="admin-btn-primary">
        <LuPlus className="h-4 w-4" /> Add project
      </button>
    ),
    testimonials: (
      <button type="button" onClick={copyTestimonialLink} className="admin-btn">
        <LuCopy className="h-4 w-4" /> Copy client link
      </button>
    ),
  };

  return (
    <main className="admin-shell min-h-screen text-white">
      {toast && (
        <div className="fixed right-4 top-4 z-[120] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-[#161616]/95 p-4 text-sm leading-6 text-[#f5f5f4] shadow-2xl shadow-black/40 backdrop-blur-xl">
          {toast}
        </div>
      )}

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0a0a0a]/90 px-4 backdrop-blur-xl lg:hidden">
        <LogoLockup markClassName="h-6 w-6" />
        <button type="button" onClick={() => setNavOpen(true)} className="grid h-9 w-9 place-items-center rounded-full border border-white/15" aria-label="Open menu">
          <LuMenu className="h-4 w-4" />
        </button>
      </div>

      {navOpen ? <button type="button" aria-label="Close menu" onClick={() => setNavOpen(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden" /> : null}

      <aside className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#0d0d0d] transition-transform duration-300 lg:translate-x-0 ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-5">
          <LogoLockup markClassName="h-6 w-6" />
          <button type="button" onClick={() => setNavOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-white/60 lg:hidden" aria-label="Close menu">
            <LuX className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label || 'main'} className="mt-4 first:mt-1">
              {group.label ? <p className="px-3 pb-2 text-[11px] font-medium text-white/35">{group.label}</p> : null}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                const badge = item.id === 'inquiries' ? inquirySummary.attention : item.id === 'testimonials' ? pendingTestimonials : 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      changeTab(item.id);
                      setNavOpen(false);
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? 'bg-white text-black' : 'text-white/65 hover:bg-white/[0.06] hover:text-white'}`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {badge ? (
                      <span className={`min-w-5 rounded-full px-1.5 text-center text-[11px] font-semibold leading-5 ${active ? 'bg-black text-white' : 'bg-[#8ea2ff] text-black'}`}>{badge}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="grid gap-1 border-t border-white/10 p-3">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white">
            <LuExternalLink className="h-[18px] w-[18px]" /> View site
          </a>
          <button type="button" onClick={logout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white">
            <LuLogOut className="h-[18px] w-[18px]" /> Log out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <div className="admin-content mx-auto max-w-[1200px] px-4 pb-32 pt-8 sm:px-8 lg:pt-12">
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{currentPage.label}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">{currentPage.description}</p>
            </div>
            {pageActions[tab] ? <div className="flex shrink-0 gap-2">{pageActions[tab]}</div> : null}
          </header>

        {tab === 'overview' && (
          <AdminOverview
            summary={inquirySummary}
            projects={data.projects}
            services={data.services}
            clients={data.clients}
            testimonials={data.testimonials}
            pendingTestimonials={pendingTestimonials}
            onNavigate={changeTab}
            onAddProject={startNewProject}
            onCopyTestimonialLink={copyTestimonialLink}
          />
        )}

        {tab === 'content' && (
          <section className="grid gap-5">
            <AdminCard title="Hero" description="The first thing visitors see, over the showreel.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Small line above the title (EN)" value={data.sections.hero.subtitle} onChange={(value) => setSection('hero', 'subtitle', value)} />
                <Field label="Small line above the title (AR)" value={data.sections.hero.subtitle_ar} onChange={(value) => setSection('hero', 'subtitle_ar', value)} />
                <Field label="Title (EN)" value={data.sections.hero.title} onChange={(value) => setSection('hero', 'title', value)} />
                <Field label="Title (AR)" value={data.sections.hero.title_ar} onChange={(value) => setSection('hero', 'title_ar', value)} />
                <Field label="Description (EN)" value={data.sections.hero.description} onChange={(value) => setSection('hero', 'description', value)} textarea />
                <Field label="Description (AR)" value={data.sections.hero.description_ar} onChange={(value) => setSection('hero', 'description_ar', value)} textarea />
                <Field label="Main button text (EN)" value={data.sections.hero.cta_text} onChange={(value) => setSection('hero', 'cta_text', value)} />
              </div>
            </AdminCard>

            <AdminCard title="Showreels" description="Background videos of the hero. The second one is optional; visitors can switch between them.">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f5f5f4]">Primary hero reel</p>
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
                    className="w-full rounded-full bg-[#f5f5f4] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#090909] disabled:opacity-50"
                  >
                    {uploadingHeroVideo ? `Uploading ${uploadProgress}%` : 'Upload hero video'}
                  </button>
                  {uploadingHeroVideo ? (
                    <div className="mt-3 h-2 overflow-hidden rounded-full border border-white/10 bg-white/5">
                      <div className="h-full bg-[#f5f5f4] transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4 border-t border-white/10 pt-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff9a57]">Alternate hero reel</p>
                    <p className="mt-1 text-xs leading-5 text-white/38">Loaded only when a visitor switches reels.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Field label="Alternate video URL" value={data.sections.hero.video_url_alt} onChange={(value) => setSection('hero', 'video_url_alt', value)} placeholder="YouTube, Vimeo, or direct video link" />
                    {data.sections.hero.video_url_alt ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSection('hero', 'video_url_alt', '');
                          notify('Alternate hero video cleared. Save to apply the change.');
                        }}
                        className="self-start border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-red-200 hover:bg-red-500/15"
                      >
                        Clear alternate video
                      </button>
                    ) : null}
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Select alternate hero video file</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(event) => setSelectedAltHeroVideoFile(event.target.files?.[0] || null)}
                      className="w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={!selectedAltHeroVideoFile || uploadingAltHeroVideo}
                    onClick={async () => {
                      if (!selectedAltHeroVideoFile) return;
                      try {
                        setUploadingAltHeroVideo(true);
                        setAltUploadProgress(0);
                        const url = await uploadFile(selectedAltHeroVideoFile, setAltUploadProgress);
                        setSection('hero', 'video_url_alt', url);
                        setSelectedAltHeroVideoFile(null);
                        notify('Alternate hero video uploaded. Save changes to publish.');
                      } catch (uploadError) {
                        notify(uploadError instanceof Error ? uploadError.message : 'Alternate hero video upload failed');
                      } finally {
                        setUploadingAltHeroVideo(false);
                        setAltUploadProgress(0);
                      }
                    }}
                    className="w-full bg-[#ff9a57] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#160b06] disabled:opacity-50"
                  >
                    {uploadingAltHeroVideo ? `Uploading ${altUploadProgress}%` : 'Upload alternate hero video'}
                  </button>
                  {uploadingAltHeroVideo ? (
                    <div className="h-2 overflow-hidden border border-white/10 bg-white/5">
                      <div className="h-full bg-[#ff9a57] transition-all duration-200" style={{ width: `${altUploadProgress}%` }} />
                    </div>
                  ) : null}
                </div>
              </div>
            </AdminCard>

            <AdminCard title="About the studio" description="The “Studio” section on the homepage.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Title (EN)" value={data.sections.about.title} onChange={(value) => setSection('about', 'title', value)} />
                <Field label="Title (AR)" value={data.sections.about.title_ar} onChange={(value) => setSection('about', 'title_ar', value)} />
                <Field label="Text (EN)" value={data.sections.about.content} onChange={(value) => setSection('about', 'content', value)} textarea />
                <Field label="Text (AR)" value={data.sections.about.content_ar} onChange={(value) => setSection('about', 'content_ar', value)} textarea />
              </div>
            </AdminCard>

            <AdminCard title="Footer">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tagline (EN)" value={data.sections.footer.tagline} onChange={(value) => setSection('footer', 'tagline', value)} />
                <Field label="Tagline (AR)" value={data.sections.footer.tagline_ar} onChange={(value) => setSection('footer', 'tagline_ar', value)} />
                <Field label="Copyright" value={data.sections.footer.copyright} onChange={(value) => setSection('footer', 'copyright', value)} />
              </div>
            </AdminCard>
          </section>
        )}

        {tab === 'projects' && (
          <section>
            <div className="mb-5 flex flex-wrap gap-2 text-sm text-white/55">
              <span className="rounded-full border border-white/10 px-3 py-1">{projectSummary.total} projects</span>
              <span className="rounded-full border border-white/10 px-3 py-1">{projectSummary.featured} featured</span>
              <span className="rounded-full border border-white/10 px-3 py-1">{projectSummary.linked} with video</span>
            </div>
            <div className="grid gap-4">
              {sortedAdminProjects.map((project, index) => (
                <article
                  key={project.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-3 shadow-2xl shadow-black/10 transition hover:border-[#f5f5f4]/35 hover:bg-white/[0.04] md:grid md:grid-cols-[180px_1fr_auto] md:items-stretch md:gap-5 md:p-4"
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
                        <span className="rounded-full border border-[#f5f5f4]/30 bg-[#f5f5f4]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#f5f5f4]">
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
                    <button onClick={() => setEditingProject(project)} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/72 transition hover:border-[#f5f5f4]/50 hover:text-white">
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

        {tab === 'media' && (
          <section>
            <VideoOptimizer
              uploadFile={uploadFile}
              generateMetadata={generateProjectMetadata}
              existingProjects={data.projects.map((project) => ({
                id: project.id,
                title: project.title,
                title_ar: project.title_ar,
                client: project.client,
                year: project.year,
              }))}
              onComplete={(result) => notify(result.suggestion ? 'Media uploaded and AI draft ready for review.' : 'Media uploaded. AI metadata needs attention.')}
              onReview={(result, replacementProjectId) => {
                const matchedProjectId = replacementProjectId || result.suggestion?.matched_project_id;
                const matchedProject = matchedProjectId
                  ? data.projects.find((project) => project.id === matchedProjectId)
                  : undefined;

                if (matchedProject) {
                  setEditingProject({
                    ...matchedProject,
                    video_url: result.fullUrl,
                    hover_video_url: result.hoverUrl,
                    thumbnail: result.thumbnailUrl,
                    embed_code: '',
                    duration: formatProjectDuration(result.metadata.duration),
                  });
                  notify(`Matched ${matchedProject.title || matchedProject.title_ar}. Existing copy will be preserved.`);
                  return;
                }

                const nextSortOrder = data.projects.reduce((highest, project) => Math.max(highest, project.sort_order), 0) + 1;
                setEditingProject(projectFromIngestion(result, nextSortOrder));
                notify('No safe existing match found. Review this as a new project.');
              }}
            />
          </section>
        )}

        {tab === 'inquiries' && <InquiriesManager notify={notify} onChanged={refreshInquirySummary} />}

        {tab === 'services' && (
          <ServicesManager
            services={data.services}
            uploadFile={uploadFile}
            onChange={(services) => updateData((current) => ({ ...current, services }))}
            onDelete={stageDelete}
            notify={notify}
          />
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
              newItem={{ id: '', icon: 'email', title: 'Email', content: '', href: '' }}
              onChange={(contacts) => updateData((current) => ({ ...current, contacts: contacts as ContactInfo[] }))}
              onDelete={stageDelete}
              notify={notify}
            />
            <EditableList
              title="Social links"
              items={data.socials}
              table="social_links"
              fields={['name', 'url', 'icon', 'sort_order']}
              newItem={{ id: '', name: 'Instagram', url: '', icon: 'instagram', sort_order: data.socials.length + 1 }}
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
              programs={data.skillPrograms}
              skills={data.skills}
              onProgramsChange={(skillPrograms) => updateData((current) => ({ ...current, skillPrograms }))}
              onChange={(skills) => updateData((current) => ({ ...current, skills }))}
              onDelete={stageDelete}
              notify={notify}
            />
          </section>
        )}

        {tab === 'testimonials' && (
          <section>
            <TestimonialsManager
              testimonials={data.testimonials}
              onChange={(testimonials) => updateData((current) => ({ ...current, testimonials }))}
              onDelete={stageDelete}
              notify={notify}
            />
          </section>
        )}
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="fixed bottom-5 left-1/2 z-[130] w-[min(620px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-white/15 bg-[#161616]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl lg:left-[calc(50%+8rem)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Unsaved changes</p>
              <p className="mt-0.5 text-sm text-white/55">Save to publish them on the site, or discard.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={dismissChanges} disabled={saving} className="admin-btn disabled:opacity-50">Discard</button>
              <button type="button" onClick={saveAllChanges} disabled={saving} className="admin-btn-primary disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      )}

      {editingProject && (
        <ProjectEditor
          project={editingProject}
          clients={data.clients}
          uploadFile={uploadFile}
          generateMetadata={generateProjectMetadata}
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
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-[#f5f5f4]">Logo</span>
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
                  className="h-4 w-4 accent-[#f5f5f4]"
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
                  className="w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white file:mr-4 file:border-0 file:bg-[#e7e5e4] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-black"
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
  programs,
  skills,
  onProgramsChange,
  onChange,
  onDelete,
  notify,
}: {
  programs: SkillProgram[];
  skills: Skill[];
  onProgramsChange: (programs: SkillProgram[]) => void;
  onChange: (skills: Skill[]) => void;
  onDelete: (table: string, id: string) => void;
  notify: (message: string) => void;
}) {
  const [addMode, setAddMode] = useState<'program' | 'skill' | null>(null);
  const [programName, setProgramName] = useState('');
  const [skillDraft, setSkillDraft] = useState({ program: '', name: '', level: 90 });

  const sortedPrograms = [...programs].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const addSkill = (program: string, name = 'New skill', level = 90) => {
    onChange([
      ...skills,
      {
        id: crypto.randomUUID(),
        name,
        level,
        category: '',
        program,
        program_skill: name,
        editing_field: '',
        sort_order: skills.length + 1,
      },
    ]);
  };

  const openSkillForm = () => {
    setSkillDraft({ program: sortedPrograms[0]?.name || '', name: '', level: 90 });
    setAddMode('skill');
  };

  const createProgram = () => {
    const name = programName.trim();
    if (!name) return notify('Enter a program name');
    if (programs.some((program) => program.name.toLowerCase() === name.toLowerCase())) {
      return notify('This program already exists');
    }

    onProgramsChange([
      ...programs,
      { id: crypto.randomUUID(), name, sort_order: programs.length + 1 },
    ]);
    setProgramName('');
    setAddMode(null);
    notify('Program added. Save changes to publish.');
  };

  const createSkill = () => {
    const name = skillDraft.name.trim();
    if (!skillDraft.program) return notify('Choose a program first');
    if (!name) return notify('Enter a skill name');

    addSkill(skillDraft.program, name, Math.min(100, Math.max(0, skillDraft.level)));
    setAddMode(null);
    notify('Skill added. Save changes to publish.');
  };

  const updateSkill = (id: string, patch: Partial<Skill>) => {
    onChange(skills.map((skill) => (skill.id === id ? { ...skill, ...patch } : skill)));
  };

  const renameProgram = (programId: string, oldName: string, nextName: string) => {
    onProgramsChange(programs.map((program) => (program.id === programId ? { ...program, name: nextName } : program)));
    onChange(skills.map((skill) => (skill.program === oldName ? { ...skill, program: nextName } : skill)));
  };

  const deleteProgram = (program: SkillProgram) => {
    const programSkills = skills.filter((skill) => skill.program === program.name);
    const warning = programSkills.length
      ? `Delete ${program.name} and its ${programSkills.length} skills?`
      : `Delete ${program.name}?`;
    if (!confirm(warning)) return;

    onDelete('skill_programs', program.id);
    programSkills.forEach((skill) => onDelete('skills', skill.id));
    onProgramsChange(programs.filter((item) => item.id !== program.id));
    onChange(skills.filter((skill) => skill.program !== program.name));
    notify('Program deleted. Save changes to publish.');
  };

  return (
    <div className="border border-white/10 bg-white/[0.025] p-5">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-black">Skills Settings</h2>
          <p className="mt-1 text-sm text-white/45">Create programs first, then add and organize their skills.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setProgramName(''); setAddMode('program'); }} className="border border-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:border-white/50">
            Add program
          </button>
          <button onClick={openSkillForm} disabled={!programs.length} className="border border-[#f5f5f4]/60 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#f5f5f4] transition hover:border-[#f5f5f4] disabled:cursor-not-allowed disabled:opacity-35">
            Add skill
          </button>
        </div>
      </div>

      {addMode === 'program' && (
        <div className="mb-4 border border-[#f5f5f4]/35 bg-[#f5f5f4]/[0.06] p-4">
          <p className="mb-3 text-sm font-black text-white">Add a new program</p>
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <Field label="Program name" value={programName} placeholder="e.g. Cinema 4D" onChange={setProgramName} />
            <div className="flex gap-2">
              <button onClick={createProgram} className="bg-[#f5f5f4] px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-black">Add program</button>
              <button onClick={() => setAddMode(null)} className="border border-white/15 px-4 py-2.5 text-xs font-bold text-white/65">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {addMode === 'skill' && (
        <div className="mb-4 border border-[#f5f5f4]/35 bg-[#f5f5f4]/[0.06] p-4">
          <p className="mb-3 text-sm font-black text-white">Add a new skill</p>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Program</span>
              <select value={skillDraft.program} onChange={(event) => setSkillDraft((current) => ({ ...current, program: event.target.value }))} className="w-full border border-white/10 bg-black/60 px-3 py-2.5 text-sm text-white outline-none focus:border-[#f5f5f4]/70">
                {sortedPrograms.map((program) => <option key={program.id} value={program.name}>{program.name}</option>)}
              </select>
            </label>
            <Field label="Skill name" value={skillDraft.name} placeholder="e.g. Character animation" onChange={(name) => setSkillDraft((current) => ({ ...current, name }))} />
            <Field label="Level %" value={skillDraft.level} type="number" onChange={(level) => setSkillDraft((current) => ({ ...current, level: Number(level) }))} />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={createSkill} className="bg-[#f5f5f4] px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-black">Add skill</button>
            <button onClick={() => setAddMode(null)} className="border border-white/15 px-4 py-2.5 text-xs font-bold text-white/65">Cancel</button>
          </div>
        </div>
      )}

      {!programs.length && (
        <div className="border border-dashed border-white/15 px-4 py-10 text-center text-sm text-white/45">
          Add your first program, then create skills inside it.
        </div>
      )}

      <div className="grid gap-4">
        {sortedPrograms.map((program) => {
          const programSkills = [...skills]
            .filter((skill) => skill.program === program.name)
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

          return (
          <section key={program.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <input
                  value={program.name}
                  onChange={(event) => renameProgram(program.id, program.name, event.target.value)}
                  aria-label="Program name"
                  className="w-full border-0 bg-transparent p-0 text-lg font-black text-white outline-none focus:text-[#f5f5f4]"
                />
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">
                  {programSkills.length} skills inside this software
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { addSkill(program.name); notify('Skill added. Complete its details, then save changes.'); }} className="border border-[#f5f5f4]/45 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#f5f5f4] transition hover:border-[#f5f5f4] hover:text-white">
                  Add skill here
                </button>
                <button onClick={() => deleteProgram(program)} className="border border-red-400/25 px-3 py-2 text-xs font-bold text-red-200/75 transition hover:border-red-400/60 hover:text-red-100">
                  Delete program
                </button>
              </div>
            </div>

            <div className="grid gap-3">
              {programSkills.map((skill) => (
                <article key={skill.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Program</span>
                      <select value={skill.program || ''} onChange={(event) => updateSkill(skill.id, { program: event.target.value })} className="w-full border border-white/10 bg-black/60 px-3 py-2.5 text-sm text-white outline-none focus:border-[#f5f5f4]/70">
                        {sortedPrograms.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                      </select>
                    </label>
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
        )})}
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
                className="h-4 w-4 accent-[#f5f5f4]"
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
          className="border border-[#f5f5f4]/60 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#f5f5f4]"
        >
          Add
        </button>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={String(item.id)} className="border border-white/10 p-4">
            <div className="grid gap-3">
              {fields.map((field) => field === 'icon' ? (
                <IconPicker
                  key={field}
                  value={String(item.icon ?? '')}
                  hints={[String(item.id ?? ''), String(item.name ?? item.title ?? ''), String(item.url ?? item.href ?? '')]}
                  group={table === 'social_links' ? 'social' : 'contact'}
                  onChange={(value) => onChange(items.map((row) => (row.id === item.id ? { ...row, icon: value } : row)))}
                />
              ) : (
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
  generateMetadata,
}: {
  project: Project;
  clients: Client[];
  onClose: () => void;
  onSave: (project: Project) => Promise<void>;
  onError: (message: string) => void;
  uploadFile: (file: File, onProgress?: (percent: number) => void) => Promise<string>;
  generateMetadata: (input: Omit<ProjectMetadataInput, 'existingProjects'>) => Promise<ProjectMetadataSuggestion>;
}) {
  const frameSourceInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(project);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(project.technologies || []);
  const [saving, setSaving] = useState(false);
  const [frameSource, setFrameSource] = useState<File | null>(null);
  const [fetchingFrameSource, setFetchingFrameSource] = useState(false);
  const [uploadingFrame, setUploadingFrame] = useState(false);
  const [error, setError] = useState('');

  const availableTechnologies = PORTFOLIO_TECHNOLOGIES;
  const isDirty = useMemo(() => {
    return JSON.stringify({ ...form, technologies: selectedTechnologies }) !== JSON.stringify({ ...project, technologies: project.technologies || [] });
  }, [form, project, selectedTechnologies]);

  const set = (key: keyof Project, value: string | number | boolean | string[] | null) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const isDirectFrameSource = (url?: string) => {
    if (!url) return false;
    return !/(youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com|docs\.google\.com)/i.test(url);
  };

  const openExistingVideoFramePicker = async () => {
    const sourceUrl = isDirectFrameSource(form.video_url)
      ? form.video_url
      : isDirectFrameSource(form.hover_video_url)
        ? form.hover_video_url
        : '';

    if (!sourceUrl) {
      const message = 'This project does not have a direct video file. YouTube and Drive do not allow frame capture; use the local source option instead.';
      setError(message);
      onError(message);
      return;
    }

    setFetchingFrameSource(true);
    setError('');
    let timeout = 0;
    try {
      const controller = new AbortController();
      timeout = window.setTimeout(() => controller.abort(), 60_000);
      const response = await fetch(sourceUrl, { signal: controller.signal });
      if (!response.ok) throw new Error(`Could not load the project video (${response.status}).`);

      const blob = await response.blob();
      const parsedUrl = new URL(sourceUrl, window.location.origin);
      const rawName = decodeURIComponent(parsedUrl.pathname.split('/').filter(Boolean).pop() || 'project-video.mp4');
      const fileName = /\.[a-z0-9]{2,5}$/i.test(rawName) ? rawName : `${rawName}.mp4`;
      setFrameSource(new File([blob], fileName, { type: blob.type || 'video/mp4' }));
    } catch (fetchError) {
      const message = fetchError instanceof DOMException && fetchError.name === 'AbortError'
        ? 'Loading the project video timed out. Try again or use the local source option.'
        : fetchError instanceof Error
          ? `${fetchError.message} Use the local source option if this host blocks frame capture.`
          : 'Could not load the project video. Use the local source option.';
      setError(message);
      onError(message);
    } finally {
      window.clearTimeout(timeout);
      setFetchingFrameSource(false);
    }
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
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f5f5f4]">{project.title ? 'Editing project' : 'Create project'}</p>
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
                    className="h-4 w-4 accent-[#f5f5f4] cursor-pointer"
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
              className="w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#f5f5f4]/70"
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
          <Field label="Hover preview URL" value={form.hover_video_url} onChange={(value) => set('hover_video_url', value)} />
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
                    className="h-4 w-4 accent-[#f5f5f4] cursor-pointer"
                  />
                  {tech}
                </label>
              ))}
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Upload thumbnail</span>
            <input
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  setError('');
                  const url = await uploadFile(file);
                  set('thumbnail', url);
                } catch (uploadError) {
                  const message = uploadError instanceof Error ? uploadError.message : 'Upload failed';
                  setError(message);
                  onError(message);
                }
              }}
              className="w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white file:mr-4 file:border-0 file:bg-[#e7e5e4] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-black"
            />
          </label>
          <div className="border border-white/10 bg-black/20 p-4">
            <span className="block text-xs font-black uppercase tracking-[0.14em] text-white/42">Choose thumbnail from video</span>
            <div className="mt-3 flex items-center gap-3">
              {form.thumbnail ? (
                <img src={form.thumbnail} alt="Current project thumbnail" className="aspect-video w-28 shrink-0 object-cover" />
              ) : (
                <div className="grid aspect-video w-28 shrink-0 place-items-center bg-white/[0.035] text-[9px] font-black uppercase tracking-[0.12em] text-white/25">No frame</div>
              )}
              <div className="min-w-0">
                <button
                  type="button"
                  disabled={uploadingFrame || fetchingFrameSource}
                  onClick={openExistingVideoFramePicker}
                  className="border border-[#f5f5f4]/35 bg-[#f5f5f4]/10 px-4 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-[#f5f5f4] transition hover:border-[#f5f5f4] hover:bg-[#f5f5f4] hover:text-[#05070b] disabled:opacity-45"
                >
                  {uploadingFrame ? 'Uploading Frame...' : fetchingFrameSource ? 'Loading Video...' : 'Choose a Frame'}
                </button>
                <p className="mt-2 text-xs leading-5 text-white/35">Uses the project&apos;s current video. Only the selected image is uploaded.</p>
                <button
                  type="button"
                  disabled={uploadingFrame || fetchingFrameSource}
                  onClick={() => frameSourceInputRef.current?.click()}
                  className="mt-2 text-[10px] font-black uppercase tracking-[0.1em] text-white/40 underline decoration-white/20 underline-offset-4 transition hover:text-white"
                >
                  Use local source instead
                </button>
              </div>
            </div>
            <input
              ref={frameSourceInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setFrameSource(file);
                event.target.value = '';
              }}
            />
          </div>
          <div className="md:col-span-2">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Optimize and upload project video</span>
            <VideoOptimizer
              uploadFile={uploadFile}
              generateMetadata={generateMetadata}
              multiple={false}
              compact
              onComplete={(result) => {
                const suggestion = result.suggestion;
                setForm((current) => ({
                  ...current,
                  title: current.title || suggestion?.title || '',
                  title_ar: current.title_ar || suggestion?.title_ar || '',
                  description: current.description || suggestion?.description || '',
                  description_ar: current.description_ar || suggestion?.description_ar || '',
                  category: suggestion?.category?.length && !project.title ? suggestion.category : current.category,
                  role: current.role || suggestion?.role || '',
                  video_url: result.fullUrl,
                  hover_video_url: result.hoverUrl,
                  thumbnail: result.thumbnailWasSelected ? result.thumbnailUrl : current.thumbnail || result.thumbnailUrl,
                  duration: current.duration || formatProjectDuration(result.metadata.duration),
                }));
                if (!selectedTechnologies.length && suggestion?.technologies.length) {
                  setSelectedTechnologies(suggestion.technologies);
                }
                setError('');
                onError(suggestion
                  ? 'Video uploaded and AI copy added. Review every field, then apply and save.'
                  : 'Video uploaded. AI copy needs attention, but the media URLs are ready.');
              }}
            />
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-[#f5f5f4]/20 bg-[#f5f5f4]/10 p-3 text-sm font-bold text-white/78">
            <input type="checkbox" checked={form.featured} onChange={(event) => set('featured', event.target.checked)} className="h-4 w-4 accent-[#f5f5f4]" />
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
      {frameSource ? (
        <VideoFramePicker
          source={frameSource}
          onCancel={() => setFrameSource(null)}
          onConfirm={async (selection) => {
            setUploadingFrame(true);
            setError('');
            try {
              const url = await uploadFile(selection.file);
              set('thumbnail', url);
              setFrameSource(null);
              onError('Custom thumbnail uploaded. Apply project changes to keep it.');
            } catch (uploadError) {
              const message = uploadError instanceof Error ? uploadError.message : 'Thumbnail upload failed';
              setError(message);
              onError(message);
              throw uploadError;
            } finally {
              setUploadingFrame(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function IconPicker({
  value,
  onChange,
  hints = [],
  group,
}: {
  value: string;
  onChange: (value: string) => void;
  hints?: string[];
  group?: 'social' | 'contact' | 'service';
}) {
  const ordered = [...ICON_OPTIONS].sort((a, b) => Number(b.group === group) - Number(a.group === group));
  const known = ICON_OPTIONS.some((option) => option.value === value);

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Icon</span>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-white">
          <DynamicIcon value={value} hints={hints} className="h-4 w-4" />
        </span>
        <select
          value={known ? value : ''}
          onChange={(event) => onChange(event.target.value)}
          className="w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value="">Auto-detect{value && !known ? ` (current: ${value})` : ''}</option>
          {ordered.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </label>
  );
}

function ServicesManager({
  services,
  uploadFile,
  onChange,
  onDelete,
  notify,
}: {
  services: Service[];
  uploadFile: (file: File) => Promise<string>;
  onChange: (services: Service[]) => void;
  onDelete: (table: string, id: string) => void;
  notify: (message: string) => void;
}) {
  const [presetType, setPresetType] = useState(SERVICE_PRESETS[0].type);
  const sorted = [...services].sort((a, b) => a.sort_order - b.sort_order);
  const update = (id: string, patch: Partial<Service>) => onChange(services.map((service) => (service.id === id ? { ...service, ...patch } : service)));

  const addService = () => {
    const preset = getServicePreset(presetType)!;
    onChange([
      ...services,
      {
        id: crypto.randomUUID(),
        type: preset.type,
        icon: preset.icon,
        title: preset.title,
        title_ar: preset.title_ar,
        description: preset.description,
        description_ar: preset.description_ar,
        items: [],
        project_ids: [],
        work: [],
        featured: true,
        sort_order: services.length + 1,
      },
    ]);
    notify(`${preset.title} added. Save changes to publish.`);
  };

  const move = (id: string, direction: -1 | 1) => {
    const index = sorted.findIndex((service) => service.id === id);
    const target = sorted[index + direction];
    if (!target) return;
    const current = sorted[index];
    onChange(services.map((service) => {
      if (service.id === current.id) return { ...service, sort_order: target.sort_order };
      if (service.id === target.id) return { ...service, sort_order: current.sort_order };
      return service;
    }));
  };

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f5f5f4]">What you offer</p>
          <h2 className="text-3xl font-black">Services</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/46">
            Pick a service from the list, then edit its text. Services appear on the homepage and in the contact form dropdown.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={presetType}
            onChange={(event) => setPresetType(event.target.value)}
            className="border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none"
          >
            {SERVICE_PRESETS.map((preset) => (
              <option key={preset.type} value={preset.type}>{preset.title}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addService}
            className="rounded-full border border-[#f5f5f4]/45 bg-[#f5f5f4]/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-[#f5f5f4]"
          >
            Add service
          </button>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 text-sm text-white/48">No services yet. Choose one above and click “Add service”.</div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {sorted.map((service, index) => (
          <article key={service.id} className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-white/15">
                  <DynamicIcon value={service.icon} className="h-4 w-4" />
                </span>
                <h3 className="text-lg font-black">{service.title || 'Untitled service'}</h3>
              </div>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={service.featured !== false}
                  onChange={(event) => update(service.id, { featured: event.target.checked })}
                  className="h-4 w-4 accent-[#f5f5f4]"
                />
                Visible
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Service type</span>
                <select
                  value={service.type}
                  onChange={(event) => {
                    const preset = getServicePreset(event.target.value);
                    update(service.id, { type: event.target.value, ...(preset ? { icon: preset.icon } : {}) });
                  }}
                  className="w-full border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none"
                >
                  {SERVICE_PRESETS.map((preset) => (
                    <option key={preset.type} value={preset.type}>{preset.title}</option>
                  ))}
                </select>
              </label>
              <IconPicker value={service.icon || ''} group="service" onChange={(value) => update(service.id, { icon: value })} />
              <Field label="Title (EN)" value={service.title} onChange={(value) => update(service.id, { title: value })} />
              <Field label="Title (AR)" value={service.title_ar} onChange={(value) => update(service.id, { title_ar: value })} />
              <Field label="Description (EN)" value={service.description} textarea onChange={(value) => update(service.id, { description: value })} />
              <Field label="Description (AR)" value={service.description_ar} textarea onChange={(value) => update(service.id, { description_ar: value })} />
            </div>
            <ServiceItemsEditor
              items={service.items || []}
              onChange={(items) => update(service.id, { items })}
            />
            <ServiceWorkEditor
              kind={getServiceWorkKind(service.type)}
              work={service.work || []}
              uploadFile={uploadFile}
              onChange={(work) => update(service.id, { work })}
              notify={notify}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={index === 0} onClick={() => move(service.id, -1)} className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white/70 disabled:opacity-30">↑ Up</button>
              <button type="button" disabled={index === sorted.length - 1} onClick={() => move(service.id, 1)} className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white/70 disabled:opacity-30">↓ Down</button>
              <button
                type="button"
                onClick={() => {
                  onDelete('services', service.id);
                  onChange(services.filter((item) => item.id !== service.id));
                  notify('Service deleted. Save changes to publish.');
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
  );
}

function ServiceItemsEditor({ items, onChange }: { items: ServiceItem[]; onChange: (items: ServiceItem[]) => void }) {
  const updateItem = (index: number, patch: Partial<ServiceItem>) =>
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));

  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-white/42">What&apos;s included ({items.length})</p>
        <button
          type="button"
          onClick={() => onChange([...items, { title: '', title_ar: '' }])}
          className="rounded-full border border-[#f5f5f4]/45 px-3 py-1.5 text-xs font-bold text-[#f5f5f4]"
        >
          + Add item
        </button>
      </div>
      {items.length === 0 ? <p className="text-sm text-white/40">e.g. Landing pages, Company websites, Booking systems…</p> : null}
      <div className="grid gap-2">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input
              value={item.title}
              onChange={(event) => updateItem(index, { title: event.target.value })}
              placeholder="Item (EN)"
              className="w-full border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none"
            />
            <input
              value={item.title_ar || ''}
              onChange={(event) => updateItem(index, { title_ar: event.target.value })}
              placeholder="العنصر (AR)"
              dir="rtl"
              className="w-full border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              className="rounded-full border border-red-400/30 px-3 text-xs text-red-200"
              aria-label="Remove item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AdminInquiry {
  id: string;
  name: string;
  email: string;
  service: string | null;
  message: string;
  locale: string | null;
  status: 'pending' | 'delivered' | 'failed';
  delivery_error: string | null;
  delivery_attempts: number;
  delivered_at: string | null;
  created_at: string;
}

function InquiriesManager({ notify, onChanged }: { notify: (message: string) => void; onChanged?: () => void }) {
  const [items, setItems] = useState<AdminInquiry[]>([]);
  const [webhookConfigured, setWebhookConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/inquiries', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load inquiries');
      setItems(data.inquiries || []);
      setWebhookConfigured(Boolean(data.webhookConfigured));
    } catch (error) {
      notifyRef.current(error instanceof Error ? error.message : 'Could not load inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const retry = async (id: string) => {
    setBusyId(id);
    const response = await fetch('/api/admin/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const data = await response.json().catch(() => ({}));
    notify(response.ok ? 'Sent to WhatsApp' : data.error || 'Delivery failed');
    setBusyId('');
    void refresh();
    onChanged?.();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this inquiry permanently?')) return;
    setBusyId(id);
    await fetch('/api/admin/inquiries', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setBusyId('');
    setItems((current) => current.filter((item) => item.id !== id));
    onChanged?.();
  };

  const badge = {
    delivered: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    failed: 'border-red-400/30 bg-red-400/10 text-red-200',
    pending: 'border-white/15 bg-white/5 text-white/70',
  } as const;

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f5f5f4]">Contact form</p>
          <h2 className="text-3xl font-black">Inquiries</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/46">
            Every message from the contact form is saved here first, then sent to WhatsApp. If delivery fails, use “Send again”.
          </p>
        </div>
        <button type="button" onClick={() => void refresh()} className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold text-white/80">
          Refresh
        </button>
      </div>

      {!webhookConfigured && (
        <div className="mb-5 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          WhatsApp is not connected yet. Messages are still saved here. Add WHATSAPP_WEBHOOK_URL and WHATSAPP_WEBHOOK_SECRET in Vercel to turn on delivery.
        </div>
      )}

      {loading ? <p className="text-sm text-white/50">Loading…</p> : null}
      {!loading && items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 text-sm text-white/48">No messages yet.</div>
      ) : null}

      <div className="grid gap-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h3 className="text-lg font-black">{item.name}</h3>
                <p className="mt-1 text-sm text-white/55">
                  <a href={`mailto:${item.email}`} className="underline-offset-4 hover:underline">{item.email}</a>
                  {item.service ? ` · ${item.service}` : ''} · {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
              <span className={`shrink-0 self-start rounded-full border px-3 py-1 text-xs font-bold ${badge[item.status]}`}>
                {item.status === 'delivered' ? 'Sent to WhatsApp' : item.status === 'failed' ? 'WhatsApp failed' : 'Not sent yet'}
              </span>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/80" dir="auto">{item.message}</p>
            {item.status === 'failed' && item.delivery_error ? (
              <p className="mt-3 text-xs text-red-200/80">Reason: {item.delivery_error} (attempts: {item.delivery_attempts})</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${item.email}?subject=${encodeURIComponent('Re: your message to XSam Studio')}`} className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/80">
                Reply by email
              </a>
              {item.status !== 'delivered' ? (
                <button type="button" disabled={busyId === item.id} onClick={() => void retry(item.id)} className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/80 disabled:opacity-40">
                  Send again
                </button>
              ) : null}
              <button type="button" disabled={busyId === item.id} onClick={() => void remove(item.id)} className="rounded-full border border-red-400/30 px-4 py-2 text-xs font-bold text-red-200 disabled:opacity-40">
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const WORK_HINTS: Record<ServiceWorkKind, string> = {
  link: 'Add the sites or stores you built: a link (required) and a screenshot. Visitors click to open it in a new tab.',
  gallery: 'Add images of the work (logos, identities, designs). A link is optional, e.g. to Behance or the client.',
  onsite: 'Video work already shows in the Work section — visitors get a button that jumps there. You can still add links here, e.g. a YouTube channel.',
};

function ServiceWorkEditor({
  kind,
  work,
  uploadFile,
  onChange,
  notify,
}: {
  kind: ServiceWorkKind;
  work: ServiceWork[];
  uploadFile: (file: File) => Promise<string>;
  onChange: (work: ServiceWork[]) => void;
  notify: (message: string) => void;
}) {
  const [uploading, setUploading] = useState<number | null>(null);
  const updateItem = (index: number, patch: Partial<ServiceWork>) =>
    onChange(work.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= work.length) return;
    const next = [...work];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const input = 'w-full border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none';

  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-white/42">Work for this service ({work.length})</p>
        <button
          type="button"
          onClick={() => onChange([...work, { title: '', title_ar: '', url: '', image: '', description: '', description_ar: '' }])}
          className="rounded-full border border-[#f5f5f4]/45 px-3 py-1.5 text-xs font-bold text-[#f5f5f4]"
        >
          + Add work
        </button>
      </div>
      <p className="mb-3 text-xs leading-5 text-white/40">{WORK_HINTS[kind]}</p>
      <div className="grid gap-3">
        {work.map((item, index) => (
          <div key={index} className="rounded-2xl border border-white/10 p-3">
            <div className="grid gap-3 sm:grid-cols-[96px_1fr]">
              <label className="relative grid h-24 w-24 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-black/30 text-center text-[11px] text-white/45 hover:border-white/40">
                {item.image ? <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <span>{uploading === index ? 'Uploading…' : kind === 'link' ? 'Screenshot' : 'Image'}</span>}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setUploading(index);
                    try {
                      updateItem(index, { image: await uploadFile(file) });
                      notify('Image uploaded. Save changes to publish.');
                    } catch (error) {
                      notify(error instanceof Error ? error.message : 'Upload failed');
                    } finally {
                      setUploading(null);
                    }
                  }}
                />
              </label>
              <div className="grid gap-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={item.title} onChange={(event) => updateItem(index, { title: event.target.value })} placeholder="Title (EN), e.g. Firestone Jo" className={input} />
                  <input value={item.title_ar || ''} onChange={(event) => updateItem(index, { title_ar: event.target.value })} placeholder="العنوان (AR)" dir="rtl" className={input} />
                </div>
                <input
                  value={item.url || ''}
                  onChange={(event) => updateItem(index, { url: event.target.value.trim() })}
                  placeholder={kind === 'link' ? 'https://… (required)' : 'https://… (optional)'}
                  dir="ltr"
                  className={`${input} ${kind === 'link' && !item.url ? 'border-amber-400/40' : ''}`}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={item.description || ''} onChange={(event) => updateItem(index, { description: event.target.value })} placeholder="Short note (EN), optional" className={input} />
                  <input value={item.description_ar || ''} onChange={(event) => updateItem(index, { description_ar: event.target.value })} placeholder="وصف قصير (AR)" dir="rtl" className={input} />
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 disabled:opacity-30">↑</button>
              <button type="button" disabled={index === work.length - 1} onClick={() => move(index, 1)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 disabled:opacity-30">↓</button>
              {item.image ? (
                <button type="button" onClick={() => updateItem(index, { image: '' })} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70">Remove image</button>
              ) : null}
              <button type="button" onClick={() => onChange(work.filter((_, itemIndex) => itemIndex !== index))} className="rounded-full border border-red-400/30 px-3 py-1.5 text-xs text-red-200">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-white/45">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function AdminOverview({
  summary,
  projects,
  services,
  clients,
  testimonials,
  pendingTestimonials,
  onNavigate,
  onAddProject,
  onCopyTestimonialLink,
}: {
  summary: InquirySummary;
  projects: Project[];
  services: Service[];
  clients: Client[];
  testimonials: Testimonial[];
  pendingTestimonials: number;
  onNavigate: (tab: Tab) => void;
  onAddProject: () => void;
  onCopyTestimonialLink: () => void;
}) {
  const visibleServices = services.filter((service) => service.featured !== false);
  const emptyServices = visibleServices.filter((service) => !(service.items?.length || service.work?.length));
  const projectsWithoutThumb = projects.filter((project) => !project.thumbnail).length;

  const stats: { label: string; value: number; tab: Tab; note?: string }[] = [
    { label: 'Inquiries', value: summary.total, tab: 'inquiries', note: summary.failed ? `${summary.failed} not delivered` : 'All delivered' },
    { label: 'Projects', value: projects.length, tab: 'projects', note: `${projects.filter((project) => project.featured).length} featured` },
    { label: 'Services', value: visibleServices.length, tab: 'services', note: `${services.length - visibleServices.length} hidden` },
    { label: 'Testimonials', value: testimonials.length, tab: 'testimonials', note: pendingTestimonials ? `${pendingTestimonials} hidden from site` : `${clients.length} clients` },
  ];

  const todos: { text: string; tab: Tab }[] = [];
  if (!summary.webhookConfigured) todos.push({ text: 'WhatsApp delivery is not connected — messages are only saved here.', tab: 'inquiries' });
  if (summary.failed) todos.push({ text: `${summary.failed} inquir${summary.failed === 1 ? 'y was' : 'ies were'} not delivered to WhatsApp.`, tab: 'inquiries' });
  if (emptyServices.length) todos.push({ text: `${emptyServices.length} service${emptyServices.length === 1 ? ' has' : 's have'} no details or work yet: ${emptyServices.map((service) => service.title).join(', ')}.`, tab: 'services' });
  if (pendingTestimonials) todos.push({ text: `${pendingTestimonials} testimonial${pendingTestimonials === 1 ? ' is' : 's are'} hidden — review and show ${pendingTestimonials === 1 ? 'it' : 'them'}.`, tab: 'testimonials' });
  if (projectsWithoutThumb) todos.push({ text: `${projectsWithoutThumb} project${projectsWithoutThumb === 1 ? ' has' : 's have'} no thumbnail.`, tab: 'projects' });

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <button key={stat.label} type="button" onClick={() => onNavigate(stat.tab)} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition hover:border-white/25">
            <p className="text-sm text-white/50">{stat.label}</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{stat.value}</p>
            <p className="mt-2 text-xs text-white/40">{stat.note}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <AdminCard title="Needs attention">
          {todos.length ? (
            <ul className="grid gap-2">
              {todos.map((todo) => (
                <li key={todo.text}>
                  <button type="button" onClick={() => onNavigate(todo.tab)} className="flex w-full items-start gap-3 rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-white/80 transition hover:border-white/25">
                    <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    {todo.text}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/50">Nothing to fix. Everything looks good.</p>
          )}
        </AdminCard>

        <AdminCard title="Quick actions">
          <div className="grid gap-2">
            <button type="button" onClick={onAddProject} className="admin-btn justify-start"><LuPlus className="h-4 w-4" /> Add a project</button>
            <button type="button" onClick={() => onNavigate('media')} className="admin-btn justify-start"><LuWandSparkles className="h-4 w-4" /> Optimize and upload a video</button>
            <button type="button" onClick={() => onNavigate('services')} className="admin-btn justify-start"><LuSparkles className="h-4 w-4" /> Add work to a service</button>
            <button type="button" onClick={onCopyTestimonialLink} className="admin-btn justify-start"><LuCopy className="h-4 w-4" /> Copy testimonial link for a client</button>
          </div>
        </AdminCard>
      </div>

      <AdminCard title="Latest inquiries">
        {summary.recent.length ? (
          <ul className="divide-y divide-white/10">
            {summary.recent.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => onNavigate('inquiries')} className="flex w-full items-center justify-between gap-4 py-3 text-left">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{item.name}</span>
                    <span className="block truncate text-xs text-white/45">{item.service || 'No service selected'} · {new Date(item.created_at).toLocaleString()}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${item.status === 'delivered' ? 'bg-emerald-400/10 text-emerald-200' : 'bg-red-400/10 text-red-200'}`}>
                    {item.status === 'delivered' ? 'On WhatsApp' : 'Not delivered'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/50">No messages yet.</p>
        )}
      </AdminCard>
    </div>
  );
}
