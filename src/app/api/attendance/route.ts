import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const today = searchParams.get('today');

    if (today) {
      const [rows] = await pool.query(
        `SELECT id, user_id as userId, date, checkin_time as checkinTime, checkout_time as checkoutTime, checkin_photo as checkinPhoto, checkout_photo as checkoutPhoto
         FROM attendance WHERE user_id = ? AND date = CURDATE()`,
        [today]
      );
      const list = rows as any[];
      return NextResponse.json(list[0] || null);
    }

    if (userId) {
      const [rows] = await pool.query(
        `SELECT id, user_id as userId, date, checkin_time as checkinTime, checkout_time as checkoutTime, checkin_photo as checkinPhoto, checkout_photo as checkoutPhoto
         FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 30`,
        [userId]
      );
      return NextResponse.json(rows);
    }

    return NextResponse.json({ error: 'Missing userId or today param' }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
