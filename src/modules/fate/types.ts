export interface FateTemplate {
  id: string;
  promptTemplate: string;
  defaultTranslations: Record<string, Record<string, string>>;
}

export interface FateResult {
  fate: string;
  description: string;
  startingStats: Record<string, number>;
  startingTraits: string[];
}

export interface FateRequest {
  userId: string;
  prompt: string;
  locale: string;
}