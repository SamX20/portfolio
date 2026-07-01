import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { defaultClients } from '@/lib/portfolioDefaults';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ clients: defaultClients });
  }

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, slug, featured, sort_order')
    .order('sort_order');

  if (error) {
    return NextResponse.json({ clients: defaultClients });
  }

  return NextResponse.json({ clients: data || [] });
}
