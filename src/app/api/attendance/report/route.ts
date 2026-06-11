import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/db';
import { getTodayStr } from '@/lib/timezone';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get('fromDate') || getTodayStr();
    const toDate = searchParams.get('toDate') || getTodayStr();
    const supabase = getSupabase();
    const { data } = await supabase
      .from('attendance')
      .select('*, users!inner(name)')
      .gte('date', fromDate)
      .lte('date', toDate)
      .order('date', { ascending: false })
      .order('user_id');
    const result = (data || []).map((r: any) => ({
      ...r, userName: r.users?.name, userId: r.user_id,
      checkinTime: r.checkin_time, checkoutTime: r.checkout_time,
      checkinPhoto: r.checkin_photo, checkoutPhoto: r.checkout_photo,
    }));
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
