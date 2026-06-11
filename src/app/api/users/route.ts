import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/db';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.from('users').select('id, username, name, role');
    return NextResponse.json(data || []);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, password, name, role } = await req.json();
    if (!username || !password || !name) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase.from('users').insert({ username, password, name, role: role || 'employee' }).select('id, username, name, role').single();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Username đã tồn tại' }, { status: 409 });
      throw error;
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
