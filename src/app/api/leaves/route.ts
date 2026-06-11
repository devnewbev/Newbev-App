import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const all = searchParams.get('all');
    const supabase = getSupabase();

    if (all === '1') {
      const { data } = await supabase
        .from('leaves')
        .select('*, userId:user_id, startDate:start_date, endDate:end_date, leaveType:leave_type, createdAt:created_at, users(name)')
        .order('created_at', { ascending: false })
        .limit(100);
      const result = (data || []).map((l: any) => ({ ...l, userName: l.users?.name }));
      return NextResponse.json(result);
    }

    if (userId) {
      const { data } = await supabase
        .from('leaves')
        .select('*, userId:user_id, startDate:start_date, endDate:end_date, leaveType:leave_type, createdAt:created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);
      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: 'Missing userId or all param' }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, startDate, endDate, leaveType, reason, days } = await req.json();
    if (!userId || !startDate || !endDate || !leaveType || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('leaves')
      .insert({ user_id: userId, start_date: startDate, end_date: endDate, leave_type: leaveType, reason, days: days || 1 })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
