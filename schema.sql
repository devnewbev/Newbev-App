-- HRM Database Schema cho Supabase (PostgreSQL)
-- Chạy file này trong Supabase SQL Editor

-- Bảng users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'employee',
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

-- Insert tài khoản mặc định
INSERT INTO users (username, password, name, role) VALUES
  ('admin', '1234', 'Admin', 'admin'),
  ('user',  '1234', 'Nhân Viên', 'employee')
ON CONFLICT (username) DO NOTHING;
