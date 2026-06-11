import { NextRequest, NextResponse } from 'next/server';
import getSupabase from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = getSupabase();
    const updates: any = {};
    if (body.userId !== undefined) updates.user_id = body.userId;
    if (body.employeeCode) updates.employee_code = body.employeeCode;
    if (body.fullName) updates.full_name = body.fullName;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.email !== undefined) updates.email = body.email;
    if (body.address !== undefined) updates.address = body.address;
    if (body.idCard !== undefined) updates.id_card = body.idCard;
    if (body.position !== undefined) updates.position = body.position;
    if (body.department !== undefined) updates.department = body.department;
    if (body.hireDate !== undefined) updates.hire_date = body.hireDate;
    if (body.baseSalary !== undefined) updates.base_salary = body.baseSalary;
    if (body.status) updates.status = body.status;
    const { error } = await supabase.from('employees').update(updates).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
