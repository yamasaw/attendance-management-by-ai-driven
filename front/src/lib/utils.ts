import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * クラス名を結合するユーティリティ関数
 * clsxでクラス名を結合し、tailwind-mergeで競合を解決
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 日付をフォーマットするユーティリティ関数
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

/**
 * 時刻をフォーマットするユーティリティ関数
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 勤怠種別の表示名を取得
 */
export function getAttendanceTypeName(type: string): string {
  const types: Record<string, string> = {
    clock_in: "出勤",
    clock_out: "退勤",
    break_start: "休憩開始",
    break_end: "休憩終了",
  };
  
  return types[type] || "不明";
} 