export interface Stat {
  key: StatKey;
  value: number;
  grade: number;
  ep: number;
  maxEP: number;
}

export type StatKey =
  | 'attack'
  | 'fortitude'
  | 'critical'
  | 'technique'
  | 'qiGeneration'
  | 'perception'
  | 'cultSpeed'
  | 'clarity'
  | 'pillRefining'
  | 'forging'
  | 'alchemy'
  | 'gemCarving'
  | 'luck'
  | 'fiveElements';

export interface Stats {
  [key: string]: Stat;
}

export interface UserProfile {
  id: string;
  username: string;
  locale: string;
  stats: Stats;
  traits: string[];
  life: number;
  maxLife: number;
  reincarnations: number;
  reincarnationPoints: number;
  achievements: string[];
  fate?: string; // 운명 이름
}