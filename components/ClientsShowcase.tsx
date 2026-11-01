'use client';

import { useMemo } from 'react';
import { Client, Locale, Project } from '@/types';

interface ClientsShowcaseProps {
  clients: Client[];
  projects: Project[];
  locale: Locale;
  selectedClientId: string | null;
  onSelectClient: (clientId: string | null) => void;
}

export default function ClientsShowcase({ clients, projects, locale, selectedClientId, onSelectClient }: ClientsShowcaseProps) {
  const isAr = locale === 'ar';

  const visibleClients = useMemo(() => {
    const linked = clients
      .filter((client) => client.featured !== false)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    const legacy = Array.from(
      projects.reduce<Map<string, Client>>((acc, project) => {
        if (!project.client || project.client_id) return acc;
        const id = `legacy:${project.client}`;
        if (!acc.has(id)) acc.set(id, { id, name: project.client, featured: true, sort_order: 999 });
        return acc;
      }, new Map()).values(),
    );
    return [...linked, ...legacy].slice(0, 16);
  }, [clients, projects]);

  if (!visibleClients.length) return null;

  // Duplicate the row so the marquee loops seamlessly.
  const row = [...visibleClients, ...visibleClients];

  return (
    <section className="border-t border-[var(--line)] py-12" dir={isAr ? 'rtl' : 'ltr'} aria-label={isAr ? 'العملاء' : 'Clients'}>
      <div className="container-x mb-8 flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">{isAr ? 'وثق بنا' : 'Trusted by'}</p>
        {selectedClientId ? (
          <button type="button" onClick={() => onSelectClient(null)} className="text-sm text-[var(--muted)] underline-offset-4 hover:text-[var(--foreground)] hover:underline">
            {isAr ? 'عرض كل الأعمال' : 'Show all work'}
          </button>
        ) : null}
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]" dir="ltr">
        <div className="marquee items-center gap-14 hover:[animation-play-state:paused]">
          {row.map((client, index) => {
            const active = selectedClientId === client.id;
            return (
              <button
                key={`${client.id}-${index}`}
                type="button"
                onClick={() => onSelectClient(active ? null : client.id)}
                title={isAr ? `أعمال ${client.name}` : `${client.name} projects`}
                className={`flex h-12 shrink-0 items-center gap-3 transition ${active ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
              >
                {client.logo_url ? (
                  <img src={client.logo_url} alt={client.name} loading="lazy" className="h-10 w-auto max-w-[140px] object-contain grayscale" />
                ) : null}
                <span className="whitespace-nowrap text-lg font-medium tracking-tight">{client.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
