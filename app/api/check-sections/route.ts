import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('sections')
      .select('*');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by section
    const sections = data?.reduce((acc, item) => {
      acc[item.section] = acc[item.section] || {};
      acc[item.section][item.key] = item.value;
      return acc;
    }, {});

    return NextResponse.json({ sections });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}