-- 従業員テーブル作成
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  profile_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 勤怠記録テーブル作成
CREATE TABLE IF NOT EXISTS attendances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('check_in', 'check_out', 'break_start', 'break_end')),
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  image_url TEXT,
  note TEXT,
  location TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_employees_employee_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);

CREATE INDEX IF NOT EXISTS idx_attendances_employee_id ON attendances(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendances_type ON attendances(type);
CREATE INDEX IF NOT EXISTS idx_attendances_timestamp ON attendances(timestamp);

-- 初期データ挿入 (開発用)
INSERT INTO employees (employee_code, name, department, position, email, is_active)
VALUES 
  ('EMP001', '山田 太郎', '営業部', '部長', 'taro.yamada@example.com', 1),
  ('EMP002', '佐藤 花子', '人事部', '主任', 'hanako.sato@example.com', 1),
  ('EMP003', '鈴木 一郎', '技術部', 'エンジニア', 'ichiro.suzuki@example.com', 1),
  ('EMP004', '高橋 美咲', '営業部', '営業担当', 'misaki.takahashi@example.com', 1),
  ('EMP005', '田中 健太', '技術部', 'プロジェクトマネージャー', 'kenta.tanaka@example.com', 1); 