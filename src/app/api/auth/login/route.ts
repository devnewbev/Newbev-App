import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('id, username, name, role')
      .eq('username', username)
      .eq('password', password)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
