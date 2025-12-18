
export enum EBookTier {
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3'
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  EMPIRE = 'EMPIRE'
}

export interface SkoolAssets {
  aboutPage: string;
  welcomePost: string;
  dmScripts: string[];
  adCopy: string[];
  growthPlan: string;
}

export interface PlanDefinition {
  id: SubscriptionPlan;
  name: string;
  price: string;
  maxEbooks: number;
  maxVideos: number;
  unlockedTiers: EBookTier[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  status: 'pending' | 'generating' | 'completed';
}

export interface BonusAsset {
  type: 'checklist' | 'worksheet' | 'roadmap';
  title: string;
  content: string;
}

export interface EBook {
  id: string;
  title: string;
  niche: string;
  targetAudience: string;
  language: 'es' | 'en' | 'pt';
  tier: EBookTier;
  chapters: Chapter[];
  bonuses: BonusAsset[];
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'subscriber';
  plan: SubscriptionPlan;
  limits: {
    ebooksPerMonth: number;
    ebooksUsed: number;
    aiVideoCredits: number;
    aiVideoUsed: number;
  };
}
