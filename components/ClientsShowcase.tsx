'use client';

import { useMemo } from 'react';
import { Client, Locale, Project } from '@/types';
import ScrollReveal from './ScrollReveal';

interface ClientsShowcaseProps {
  clients: Client[];
  projects: Project[];
  locale: Locale;
  selectedClientId: string | null;
  onSelectClient: (clientId: string | null) => void;
}

function getProjectClientKey(project: Project) {
  return project.client_id || (project.client ? `legacy:${project.client}` : null);
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

export default function ClientsShowcase({
  clients,
  projects,
  locale,
  selectedClientId,
  onSelectClient,
}: ClientsShowcaseProps) {
  const isAr = locale === 'ar';

  const visibleClients = useMemo(() => {
    const linkedClients = clients
      .filter((client) => client.featured !== false)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

    const linkedIds = new Set(linkedClients.map((client) => client.id));
    const legacyClients = Array.from(
      projects.reduce<Map<string, Client>>((acc, project) => {
        if (!project.client || project.client_id || linkedIds.has(project.client_id || '')) return acc;
        const id = `legacy:${project.client}`;
        if (!acc.has(id)) {
          acc.set(id, {
            id,
            name: project.client,
            slug: project.client.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            logo_url: '',
            website_url: '',
            featured: true,
            sort_order: 999,
          });
        }
        return acc;
      }, new Map()).values(),
    );

    return [...linkedClients, ...legacyClients].slice(0, 12);
  }, [clients, projects]);

  if (!visibleClients.length) return null;

  return (
    <section className="relative bg-[#080808] px-4 py-16 sm:px-6 lg:px-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className={isAr ? 'text-right' : 'text-left'}>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.32em] text-[#8ed8ff]">
              {isAr ? 'عملاء مختارون' : 'Selected Clients'}
            </p>
            <h2 className="max-w-2xl text-3xl font-black leading-tight text-white sm:text-5xl">
              {isAr ? 'أسماء وثقت بالحركة، والنتيجة تقودك للأعمال.' : 'Trusted names, directly tied to the work.'}
            </h2>
          </div>
          {selectedClientId && (
            <button
              type="button"
              onClick={() => onSelectClient(null)}
              className="self-start rounded-full border border-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/58 transition hover:border-[#8ed8ff]/60 hover:text-white md:self-end"
            >
              {isAr ? 'عرض كل المشاريع' : 'Show all work'}
            </button>
          )}
        </ScrollReveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleClients.map((client, index) => {
            const active = selectedClientId === client.id;
            return (
              <ScrollReveal key={client.id} delay={index * 60} variant="scale">
                <button
                  type="button"
                  onClick={() => onSelectClient(active ? null : client.id)}
                  className={`group flex min-h-[94px] w-full items-center gap-4 border p-4 text-left transition ${
                    active
                      ? 'border-[#4aa3ff] bg-[#8ed8ff]/12'
                      : 'border-white/10 bg-white/[0.025] hover:border-[#8ed8ff]/45 hover:bg-white/[0.045]'
                  } ${isAr ? 'text-right' : 'text-left'}`}
                >
                  <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-black/35">
                    {client.logo_url ? (
                      <img src={client.logo_url} alt={client.name} className="h-full w-full object-contain p-2" />
                    ) : (
                      <span className="text-sm font-black uppercase tracking-[0.1em] text-[#8ed8ff]">{getInitials(client.name)}</span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base font-black text-white">{client.name}</span>
                    <span className="mt-1 block text-xs font-bold uppercase tracking-[0.14em] text-white/35 group-hover:text-[#8ed8ff]/80">
                      {isAr ? 'عرض الأعمال' : 'View projects'}
                    </span>
                  </span>
                </button>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
