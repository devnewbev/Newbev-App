-- HRM Database Schema cho Supabase (PostgreSQL)
-- Chạy file này trong Supabase SQL Editor

-- Bảng users (tài khoản đăng nhập)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'employee',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng employees (thông tin nhân viên - khác với users)
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  employee_code VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) DEFAULT '',
  email VARCHAR(100) DEFAULT '',
  address TEXT DEFAULT '',
  id_card VARCHAR(20) DEFAULT '',
  position VARCHAR(100) DEFAULT '',
  department VARCHAR(100) DEFAULT '',
  hire_date DATE DEFAULT NULL,
  base_salary DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng attendance (chấm công)
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  checkin_time VARCHAR(10) DEFAULT NULL,
  checkout_time VARCHAR(10) DEFAULT NULL,
  checkin_photo TEXT DEFAULT NULL,
  checkout_photo TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- Bảng leaves (nghỉ phép)
CREATE TABLE IF NOT EXISTS leaves (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  days INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng explanations (giải trình)
CREATE TABLE IF NOT EXISTS explanations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT NOT NULL,
  photo TEXT DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng work_days (tính công - chi tiết từng ngày)
CREATE TABLE IF NOT EXISTS work_days (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  work_minutes INT DEFAULT 0,
  late_minutes INT DEFAULT 0,
  early_leave_minutes INT DEFAULT 0,
  overtime_minutes INT DEFAULT 0,
  day_type VARCHAR(20) DEFAULT 'working',
  notes TEXT DEFAULT '',
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- Insert tài khoản mặc định
INSERT INTO users (username, password, name, role) VALUES
  ('admin', '1234', 'Admin', 'admin'),
  ('user',  '1234', 'Nhân Viên', 'employee')
ON CONFLICT (username) DO NOTHING;
