import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/db';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.from('employees').select('*').order('id', { ascending: false });
    return NextResponse.json(data || []);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabase();
    const { data, error } = await supabase.from('employees').insert({
      user_id: body.userId,
      employee_code: body.employeeCode,
      full_name: body.fullName,
      phone: body.phone || '',
      email: body.email || '',
      address: body.address || '',
      id_card: body.idCard || '',
      position: body.position || '',
      department: body.department || '',
      hire_date: body.hireDate || null,
      base_salary: body.baseSalary || 0,
      status: body.status || 'active',
    }).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
