import { ZodError } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

export function formatZodError(error: ZodError): {
  status: 'error';
  message: string;
  errors: ValidationError[];
} {
  const errors = error.issues.map((issue) => {
    const field = issue.path[0] as string;
    let message = '';

    switch (field) {
    case 'employee_id':
      message = '従業員IDは必須です';
      break;
    case 'type':
      if (issue.code === 'invalid_type') {
        message = '勤怠タイプは必須です';
      } else if (issue.code === 'invalid_enum_value') {
        message = '勤怠タイプは check_in, check_out, break_start, break_end のいずれかである必要があります';
      }
      break;
    default:
      message = issue.message;
    }

    return {
      field,
      message,
    };
  });

  return {
    status: 'error',
    message: 'データの検証に失敗しました',
    errors,
  };
}