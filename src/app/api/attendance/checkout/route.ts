import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/db';
import { getTodayStr, getTimeStr } from '@/lib/timezone';

export async function POST(req: NextRequest) {
  try {
    const { userId, photo } = await req.json();
    if (!userId || !photo) {
      return NextResponse.json({ error: 'Missing userId or photo' }, { status: 400 });
    }
    const supabase = getSupabase();
    const now = getTimeStr();
    const todayStr = getTodayStr();

    await supabase.from('attendance').insert({ user_id: userId, date: todayStr, checkout_time: now, checkout_photo: photo });

    const { data } = await supabase
      .from('attendance')
      .select('id, userId:user_id, date, checkinTime:checkin_time, checkoutTime:checkout_time, checkinPhoto:checkin_photo, checkoutPhoto:checkout_photo')
      .eq('user_id', userId)
      .eq('date', todayStr)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
