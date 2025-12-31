import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert star rating to numerical score
export function convertStarToScore(stars: number): number {
  const scoreMap = {
    1: 20,   // ⭐ Sangat Kurang
    2: 40,   // ⭐⭐ Kurang
    3: 60,   // ⭐⭐⭐ Butuh Perbaikan
    4: 80,   // ⭐⭐⭐⭐ Baik
    5: 100   // ⭐⭐⭐⭐⭐ Sangat Baik
  };

  return scoreMap[stars as keyof typeof scoreMap] || 0;
}

// Convert numerical score back to star rating
export function convertScoreToStar(score: number): number {
  if (score >= 90) return 5;
  if (score >= 70) return 4;
  if (score >= 50) return 3;
  if (score >= 30) return 2;
  return 1;
}

// Format number to 1 decimal place
export function formatNumber(num: number): string {
  return parseFloat(num.toString()).toFixed(1);
}

// Check if all ratings are completed
export function areAllRatingsCompleted(ratings: Partial<Rating>): boolean {
  return Object.values(ratings).every(rating => rating !== undefined && rating > 0);
}