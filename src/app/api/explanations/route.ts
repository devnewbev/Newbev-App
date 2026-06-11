import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const all = searchParams.get('all');

    if (all === '1') {
      const [rows] = await pool.query(
        `SELECT e.*, e.user_id as userId, e.created_at as createdAt, u.name as userName
         FROM explanations e JOIN users u ON e.user_id = u.id
         ORDER BY e.created_at DESC LIMIT 100`
      );
      return NextResponse.json(rows);
    }

    if (userId) {
      const [rows] = await pool.query(
        `SELECT *, user_id as userId, created_at as createdAt
         FROM explanations WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
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
    const { userId, date, reason, photo } = await req.json();
    if (!userId || !date || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const [result] = await pool.query(
      `INSERT INTO explanations (user_id, date, reason, photo)
       VALUES (?, ?, ?, ?)`,
      [userId, date, reason, photo || null]
    );
    const info = result as any;
    const [rows] = await pool.query('SELECT * FROM explanations WHERE id = ?', [info.insertId]);
    const list = rows as any[];
    return NextResponse.json(list[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
