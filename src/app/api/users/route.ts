import { NextResponse } from 'next/server';
import getSupabase from '@/lib/db';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('users').select('id, username, name, role');
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
