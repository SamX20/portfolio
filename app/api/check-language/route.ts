import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('section', 'global')
      .eq('key', 'language');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ language: data?.[0]?.value || 'en' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch language' }, { status: 500 });
  }
}