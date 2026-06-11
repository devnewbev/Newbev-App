import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/db';
import { getTodayStr, getTimeStr } from '@/lib/timezone';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const today = searchParams.get('today');
    const supabase = getSupabase();
    const todayStr = getTodayStr();

    if (today) {
      const { data } = await supabase
        .from('attendance')
        .select('id, userId:user_id, date, checkinTime:checkin_time, checkoutTime:checkout_time, checkinPhoto:checkin_photo, checkoutPhoto:checkout_photo')
        .eq('user_id', today)
        .eq('date', todayStr)
        .order('id', { ascending: false })
        .limit(1)
        .single();
      return NextResponse.json(data || null);
    }

    if (userId) {
      const { data } = await supabase
        .from('attendance')
        .select('id, userId:user_id, date, checkinTime:checkin_time, checkoutTime:checkout_time, checkinPhoto:checkin_photo, checkoutPhoto:checkout_photo')
        .eq('user_id', userId)
        .order('id', { ascending: false })
        .limit(30);
      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: 'Missing userId or today param' }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
