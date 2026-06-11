import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const all = searchParams.get('all');

    if (all === '1') {
      const [rows] = await pool.query(
        `SELECT l.*, l.user_id as userId, l.start_date as startDate, l.end_date as endDate,
                l.leave_type as leaveType, l.created_at as createdAt, u.name as userName
         FROM leaves l JOIN users u ON l.user_id = u.id
         ORDER BY l.created_at DESC LIMIT 100`
      );
      return NextResponse.json(rows);
    }

    if (userId) {
      const [rows] = await pool.query(
        `SELECT *, user_id as userId, start_date as startDate, end_date as endDate,
                leave_type as leaveType, created_at as createdAt
         FROM leaves WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
        [userId]
      );
      return NextResponse.json(rows);
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
    const [result] = await pool.query(
      `INSERT INTO leaves (user_id, start_date, end_date, leave_type, reason, days)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, startDate, endDate, leaveType, reason, days || 1]
    );
    const info = result as any;
    const [rows] = await pool.query('SELECT * FROM leaves WHERE id = ?', [info.insertId]);
    const list = rows as any[];
    return NextResponse.json(list[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
