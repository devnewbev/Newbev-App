import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const supabase = getSupabase();
    let query = supabase.from('work_days').select('*');
    if (userId) query = query.eq('user_id', userId);
    const { data } = await query.order('date', { ascending: false }).limit(100);
    return NextResponse.json(data || []);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
