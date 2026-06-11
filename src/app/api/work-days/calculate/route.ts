import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/db';

const WORK_START = '08:00';
const WORK_END = '17:00';
const LUNCH_START = '12:00';
const LUNCH_END = '13:00';
const STANDARD_MINUTES = 480;

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function calcWorkMinutes(checkin: string, checkout: string): { work: number; late: number; early: number } {
  const ci = parseTime(checkin);
  const co = parseTime(checkout);
  const ws = parseTime(WORK_START);
  const we = parseTime(WORK_END);
  const ls = parseTime(LUNCH_START);
  const le = parseTime(LUNCH_END);

  let late = Math.max(0, ci - ws);
  let early = Math.max(0, we - co);
  let total = co - ci;

  if (ci <= ls && co >= le) total -= (le - ls);
  else if (ci > ls && ci < le && co >= le) total -= (le - ci);
  else if (ci < ls && co > ls && co <= le) total -= (co - ls);

  if (total > STANDARD_MINUTES) total = STANDARD_MINUTES;

  return { work: Math.max(0, total), late, early };
}

export async function POST(req: NextRequest) {
  try {
    const { fromDate, toDate } = await req.json();
    if (!fromDate || !toDate) {
      return NextResponse.json({ error: 'Missing dates' }, { status: 400 });
    }
    const supabase = getSupabase();
    const { data: records } = await supabase
      .from('attendance')
      .select('user_id, date, checkin_time, checkout_time')
      .gte('date', fromDate)
      .lte('date', toDate)
      .not('checkin_time', 'is', null);

    for (const r of records || []) {
      if (!r.checkout_time) continue;
      const { work, late, early } = calcWorkMinutes(r.checkin_time, r.checkout_time);
      await supabase.from('work_days').upsert({
        user_id: r.user_id,
        date: r.date,
        work_minutes: work,
        late_minutes: late,
        early_leave_minutes: early,
        overtime_minutes: 0,
        day_type: 'working',
        calculated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' });
    }

    return NextResponse.json({ message: `Đã tính công cho ${records?.length || 0} bản ghi` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
