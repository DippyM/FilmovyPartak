export interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string;
  director: string;
  plot: string;
  visualVibe?: string; // Short description for placeholder image generation
}

export interface Recommendation extends Movie {
  reason: string;
  matchScore: number; // 0-100
  similarTo: string[];
}

export type InteractionType = 'liked' | 'disliked' | 'seen_liked';

export interface Interaction {
  movieTitle: string;
  type: InteractionType;
}

export enum AppScreen {
  WELCOME = 'WELCOME',
  CALIBRATION = 'CALIBRATION',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
