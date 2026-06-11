import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId, photo } = await req.json();
    if (!userId || !photo) {
      return NextResponse.json({ error: 'Missing userId or photo' }, { status: 400 });
    }
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const [result] = await pool.query(
      `UPDATE attendance SET checkout_time = ?, checkout_photo = ? WHERE user_id = ? AND date = CURDATE()`,
      [now, photo, userId]
    );
    const info = result as any;
    if (info.affectedRows === 0) {
      return NextResponse.json({ error: 'Chưa check-in hôm nay' }, { status: 400 });
    }
    const [rows] = await pool.query(
      `SELECT id, user_id as userId, date, checkin_time as checkinTime, checkout_time as checkoutTime, checkin_photo as checkinPhoto, checkout_photo as checkoutPhoto
       FROM attendance WHERE user_id = ? AND date = CURDATE()`,
      [userId]
    );
    const list = rows as any[];
    return NextResponse.json(list[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
