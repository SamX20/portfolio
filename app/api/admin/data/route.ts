import { NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

const TABLES = new Set([
  'clients',
  'projects',
  'stats',
  'contact_info',
  'social_links',
  'skill_programs',
  'skills',
  'testimonials',
]);

function withoutMissingColumn(record: Record<string, unknown>, message: string) {
  const match = message.match(/Could not find the '([^']+)' column/);
  const column = match?.[1];

  if (!column || !(column in record)) return null;

  const next = { ...record };
  delete next[column];
  return { record: next, column };
}

async function upsertWithSchemaFallback(table: string, record: Record<string, unknown>) {
  const missingColumns: string[] = [];
  let payload = { ...record };

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const result = await supabaseAdmin!
      .from(table)
      .upsert(payload)
      .select()
      .single();

    if (!result.error) {
      return { ...result, missingColumns };
    }

    const fallback = withoutMissingColumn(payload, result.error.message);
    if (!fallback) {
      return { ...result, missingColumns };
    }

    missingColumns.push(fallback.column);
    payload = fallback.record;
  }

  return {
    data: null,
    error: { message: 'Could not save record because several database columns are missing.' },
    missingColumns,
  };
}

async function requireAdmin() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Supabase service role key is not configured.' },
      { status: 500 },
    );
  }

  return null;
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const [projects, stats, contacts, clients, socials, sections, profile, skillPrograms, skills, testimonials] =
    await Promise.all([
      supabaseAdmin!.from('projects').select('*').order('sort_order'),
      supabaseAdmin!.from('stats').select('*'),
      supabaseAdmin!.from('contact_info').select('*'),
      supabaseAdmin!.from('clients').select('*').order('sort_order'),
      supabaseAdmin!.from('social_links').select('*').order('sort_order'),
      supabaseAdmin!.from('sections').select('*'),
      supabaseAdmin!.from('profile').select('*').eq('id', 'main').single(),
      supabaseAdmin!.from('skill_programs').select('*').order('sort_order'),
      supabaseAdmin!.from('skills').select('*'),
      supabaseAdmin!.from('testimonials').select('*'),
    ]);

  const error =
    projects.error ||
    stats.error ||
    contacts.error ||
    socials.error ||
    sections.error ||
    profile.error ||
    skills.error ||
    testimonials.error;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    projects: projects.data || [],
    stats: stats.data || [],
    contacts: contacts.data || [],
    clients: clients.data || [],
    socials: socials.data || [],
    sections: sections.data || [],
    profile: profile.data || null,
    skillPrograms: skillPrograms.data || [],
    skills: skills.data || [],
    testimonials: testimonials.data || [],
  });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const table = String(body.table || '');
  const record = body.record as Record<string, unknown> | undefined;

  if (!TABLES.has(table) || !record) {
    return NextResponse.json({ error: 'Invalid table or record.' }, { status: 400 });
  }

  const payload = {
    ...record,
    updated_at: table === 'projects' || table === 'clients' ? new Date().toISOString() : undefined,
  };

  const { data, error, missingColumns } = await upsertWithSchemaFallback(table, payload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, missingColumns });
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const profile = body.profile as Record<string, unknown> | undefined;
  const sections = body.sections as Record<string, Record<string, string>> | undefined;

  if (profile) {
    const { error } = await supabaseAdmin!
      .from('profile')
      .upsert({ id: 'main', ...profile });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (sections) {
    const allRows = Object.entries(sections).flatMap(([section, values]) =>
      Object.entries(values || {}).map(([key, value]) => ({
        id: `${section}-${key}`.replace(/_/g, '-'),
        section,
        key,
        value: String(value ?? ''),
      })),
    );

    const rowsToUpsert = allRows.filter((row) => row.value.trim() !== '');
    const rowsToDelete = allRows.filter((row) => row.value.trim() === '');

    const uniqueUpsertRows = Array.from(
      rowsToUpsert.reduce<Map<string, typeof rowsToUpsert[number]>>((acc, row) => {
        acc.set(`${row.section}:${row.key}`, row);
        return acc;
      }, new Map()).values(),
    );

    const duplicates = uniqueUpsertRows.filter((row, index, arr) =>
      arr.findIndex((r) => r.section === row.section && r.key === row.key) !== index
    );
    if (duplicates.length > 0) {
      console.error('Found duplicates:', duplicates);
      return NextResponse.json({ error: 'Duplicate section-key pairs found' }, { status: 400 });
    }

    if (uniqueUpsertRows.length > 0) {
      const { error: upsertError } = await supabaseAdmin!.from('sections').upsert(uniqueUpsertRows, {
        onConflict: 'section,key',
      });

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
      }
    }

    if (rowsToDelete.length > 0) {
      await Promise.all(
        rowsToDelete.map((row) =>
          supabaseAdmin!.from('sections').delete().match({ section: row.section, key: row.key }),
        ),
      );
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const table = String(body.table || '');
  const id = String(body.id || '');

  if (!TABLES.has(table) || !id) {
    return NextResponse.json({ error: 'Invalid table or id.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin!.from(table).delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
