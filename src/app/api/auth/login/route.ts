import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
    }
    const [rows] = await pool.query(
      'SELECT id, username, name, role FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    const users = rows as { id: number; username: string; name: string; role: string }[];
    if (users.length === 0) {
      return NextResponse.json({ error: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 });
    }
    return NextResponse.json(users[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
