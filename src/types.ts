export type ScreenType =
  | 'splash'
  | 'login'
  | 'home'
  | 'register_photo_1'
  | 'register_photo_2'
  | 'validation'
  | 'level_up'
  | 'challenges'
  | 'rewards'
  | 'partners'
  | 'profile';

export type NavTab = 'home' | 'challenges' | 'rewards' | 'partners' | 'profile';

export interface UserProfile {
  name: string;
  age?: number;
  email?: string;
  level: number;
  levelTitle: string;
  currentXp: number;
  maxXp: number;
  points: number;
  streakDays: number;
  completedChallenges: number;
  savedCoupons: number;
  dailyGoalMl: number;
  currentIntakeMl: number;
  defaultBottleMl: number;
  defaultBottleName: string;
  avatarUrl: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'semanal' | 'mensal' | 'especial';
  rewardPoints: number;
  rewardType: 'points' | 'coupon' | 'badge';
  currentProgress: number;
  maxProgress: number;
  unit: string;
  completed: boolean;
  daysRemaining?: number;
  isLocked?: boolean;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  category: 'cupons' | 'produtos' | 'experiencias' | 'exclusivos';
  pointsCost: number;
  imageUrl: string;
  badge?: string;
  locked?: boolean;
  couponCodeTemplate?: string;
}

export interface PartnerItem {
  id: string;
  name: string;
  category: 'academia' | 'saude' | 'alimentacao' | 'vestuario';
  discount: string;
  description: string;
  imageUrl: string;
  couponCode: string;
}

export interface WaterLogEntry {
  id: string;
  timestamp: Date;
  amountMl: number;
  pointsEarned: number;
  photoUrl1?: string;
  photoUrl2?: string;
  validated: boolean;
}

export interface AiAnalysisResult {
  isBottleOrCup: boolean;
  liquidType: string;
  bottleCapacityMl: number;
  liquidLevel: string;
  estimatedIntakeMl: number;
  confidence: number;
  notes: string;
}
