import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AttendancePage({ params }: { params: { employeeId: string } }) {
  const employeeId = parseInt(params.employeeId, 10);

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-2xl font-light">勤怠記録</h1>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        <Button className="h-32 text-lg">
          出勤
        </Button>
        <Button className="h-32 text-lg" variant="secondary">
          退勤
        </Button>
        <Button className="h-32 text-lg" variant="success">
          休憩開始
        </Button>
        <Button className="h-32 text-lg" variant="warning">
          休憩終了
        </Button>
      </div>

      <Link href="/" className="mt-4 text-primary hover:underline">
        戻る
      </Link>
    </div>
  );
} 