import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
    timeZoneName: 'short',
  });
}

export function getCurrentCSTTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
}

export function getInitials(name: string): string {
  // For squares, get initials from a single name field
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function getAvatarColorFromString(str: string): string {
  // Generate a consistent color from a string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];
  return colors[Math.abs(hash) % colors.length];
}

export function getDayOfWeek(date: Date | string): string {
  const d = new Date(date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d.getDay()];
}

export function generateRandomNumbers(): number[] {
  // Generate random 0-9 numbers for rows/columns
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

export function calculatePayout(
  costPerSquare: number,
  filledSquares: number,
  quarterPercent: number,
  payoutType: 'percentage' | 'dollar',
  fixedAmount?: number
): number {
  if (payoutType === 'dollar' && fixedAmount !== undefined) {
    return fixedAmount;
  }
  const totalPot = costPerSquare * filledSquares;
  return (totalPot * quarterPercent) / 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getQuarterBadgeColor(quarter: number): string {
  const colors = {
    1: 'bg-blue-500 text-white font-bold',
    2: 'bg-green-500 text-white font-bold',
    3: 'bg-yellow-500 text-black font-bold',
    4: 'bg-red-500 text-white font-bold',
  };
  return colors[quarter as keyof typeof colors] || 'bg-gray-500 text-white font-bold';
}
