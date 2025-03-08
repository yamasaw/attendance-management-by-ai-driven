import { z } from 'zod';

// 従業員スキーマ
export const employeeSchema = z.object({
  id: z.number().optional(),
  employee_code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  department: z.string().min(1).max(50),
  position: z.string().min(1).max(50),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  profile_image_url: z.string().url().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

// 勤怠記録スキーマ
export const attendanceTypeEnum = z.enum(['check_in', 'check_out', 'break_start', 'break_end']);

export const attendanceSchema = z.object({
  id: z.number().optional(),
  employee_id: z.number().positive(),
  type: attendanceTypeEnum,
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
  image_url: z.string().url().nullable().optional(),
  note: z.string().max(200).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type AttendanceInput = z.infer<typeof attendanceSchema>;

// 勤怠記録作成用のスキーマ
export const createAttendanceSchema = attendanceSchema.omit({ id: true, created_at: true, updated_at: true });

// 従業員検索用パラメータスキーマ
export const employeeSearchParamsSchema = z.object({
  department: z.string().optional(),
  is_active: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  name: z.string().optional(),
  page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 20)),
});

export type EmployeeSearchParams = z.infer<typeof employeeSearchParamsSchema>;

// 勤怠記録検索用パラメータスキーマ
export const attendanceSearchParamsSchema = z.object({
  employee_id: z.string().optional().transform(val => (val ? parseInt(val, 10) : undefined)),
  type: attendanceTypeEnum.optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 20)),
});

export type AttendanceSearchParams = z.infer<typeof attendanceSearchParamsSchema>; 