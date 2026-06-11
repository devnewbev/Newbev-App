import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId, photo } = await req.json();
    if (!userId || !photo) {
      return NextResponse.json({ error: 'Missing userId or photo' }, { status: 400 });
    }
    const supabase = getSupabase();
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const todayStr = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', userId)
      .eq('date', todayStr)
      .single();

    if (existing) {
      await supabase.from('attendance').update({ checkin_time: now, checkin_photo: photo }).eq('id', existing.id);
    } else {
      await supabase.from('attendance').insert({ user_id: userId, date: todayStr, checkin_time: now, checkin_photo: photo });
    }

    const { data } = await supabase
      .from('attendance')
      .select('id, userId:user_id, date, checkinTime:checkin_time, checkoutTime:checkout_time, checkinPhoto:checkin_photo, checkoutPhoto:checkout_photo')
      .eq('user_id', userId)
      .eq('date', todayStr)
      .single();

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
