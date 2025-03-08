/**
 * API基本URL
 * 開発環境と本番環境で切り替え
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

/**
 * 従業員情報を取得する
 */
export async function getEmployees() {
  try {
    const response = await fetch(`${API_BASE_URL}/employees`);
    if (!response.ok) {
      throw new Error('従業員データの取得に失敗しました');
    }
    return await response.json();
  } catch (error) {
    console.error('APIエラー:', error);
    throw error;
  }
}

/**
 * 特定の従業員情報を取得する
 */
export async function getEmployee(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`);
    if (!response.ok) {
      throw new Error('従業員データの取得に失敗しました');
    }
    return await response.json();
  } catch (error) {
    console.error('APIエラー:', error);
    throw error;
  }
}

/**
 * 勤怠記録を作成する
 */
export async function createAttendance(data: {
  employee_id: number;
  type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  photo_data: string;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/attendances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('勤怠データの記録に失敗しました');
    }
    
    return await response.json();
  } catch (error) {
    console.error('APIエラー:', error);
    throw error;
  }
}

/**
 * 勤怠履歴を取得する
 */
export async function getAttendanceHistory(employeeId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/attendances/employee/${employeeId}`);
    if (!response.ok) {
      throw new Error('勤怠履歴の取得に失敗しました');
    }
    return await response.json();
  } catch (error) {
    console.error('APIエラー:', error);
    throw error;
  }
}

export type Employee = {
  id?: number;
  name: string;
  email: string;
  department: string;
  position: string;
  hire_date: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type EmployeeSearchParams = {
  page?: number;
  limit?: number;
  name?: string;
  department?: string;
  is_active?: boolean;
};

type ApiResponse<T> = {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

// 従業員一覧を取得
export async function fetchEmployees(params: EmployeeSearchParams = {}): Promise<{ employees: Employee[], pagination: { total: number, page: number, limit: number, pages: number } }> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.name) queryParams.append('name', params.name);
  if (params.department) queryParams.append('department', params.department);
  if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
  
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/employees${query}`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json() as ApiResponse<{
    employees: Employee[],
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    }
  }>;
  
  if (data.status === 'error') {
    throw new Error(data.message || 'API error');
  }
  
  return {
    employees: data.data?.employees || [],
    pagination: data.data?.pagination || { total: 0, page: 1, limit: 10, pages: 0 }
  };
}

// 従業員の詳細を取得
export async function fetchEmployee(id: number): Promise<Employee> {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json() as ApiResponse<{ employee: Employee }>;
  
  if (data.status === 'error') {
    throw new Error(data.message || 'API error');
  }
  
  return data.data?.employee as Employee;
}

// 従業員を作成
export async function createEmployee(employee: Employee): Promise<Employee> {
  const response = await fetch(`${API_BASE_URL}/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employee),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  
  const data = await response.json() as ApiResponse<{ employee: Employee }>;
  
  if (data.status === 'error') {
    throw new Error(data.message || 'API error');
  }
  
  return data.data?.employee as Employee;
}

// 従業員を更新
export async function updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee> {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employee),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  
  const data = await response.json() as ApiResponse<{ employee: Employee }>;
  
  if (data.status === 'error') {
    throw new Error(data.message || 'API error');
  }
  
  return data.data?.employee as Employee;
}

// 従業員を削除
export async function deleteEmployee(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  
  const data = await response.json() as ApiResponse<{}>;
  
  return data.status === 'success';
}

// 複数の従業員を一括で削除
export async function bulkDeleteEmployees(ids: number[]): Promise<{ success: number; failed: number }> {
  const response = await fetch(`${API_BASE_URL}/employees/bulk-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    success: data.data?.success || 0,
    failed: data.data?.failed || 0,
  };
}

// 複数の従業員のステータスを一括で更新
export async function bulkUpdateEmployeeStatus(ids: number[], is_active: boolean): Promise<{ success: number; failed: number }> {
  const response = await fetch(`${API_BASE_URL}/employees/bulk-update-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids, is_active }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    success: data.data?.success || 0,
    failed: data.data?.failed || 0,
  };
} 