import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatPlacement(placement: number): string {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = placement % 100;
  return placement + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}

export function getElementColor(element: string): string {
  const colors: Record<string, string> = {
    fire: 'text-red-600 bg-red-50 border-red-200',
    water: 'text-blue-600 bg-blue-50 border-blue-200',
    wind: 'text-green-600 bg-green-50 border-green-200',
    earth: 'text-amber-600 bg-amber-50 border-amber-200',
    lightning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    darkness: 'text-purple-600 bg-purple-50 border-purple-200',
    light: 'text-pink-600 bg-pink-50 border-pink-200',
    arcane: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    norm: 'text-gray-600 bg-gray-50 border-gray-200',
  };
  return colors[element.toLowerCase()] || colors.norm;
}

export function getWinRateColor(winRate: number): string {
  if (winRate >= 0.55) return 'text-green-600';
  if (winRate >= 0.50) return 'text-blue-600';
  if (winRate >= 0.45) return 'text-yellow-600';
  return 'text-red-600';
}

export function getTierFromWinRate(winRate: number): string {
  if (winRate >= 0.55) return 'S';
  if (winRate >= 0.52) return 'A';
  if (winRate >= 0.48) return 'B';
  if (winRate >= 0.45) return 'C';
  return 'D';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
