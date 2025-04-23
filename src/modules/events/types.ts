export interface EventMetadata {
  id: string;
  type: string;
  timeCost: number;
  epReward: number;
  lifeDelta?: number;
  risk: number;
  requiredStats?: Record<string, number>;
  requiredItems?: string[];
}

export interface EventOption {
  id: string;
  text: string;
  success: {
    probability: number;
    narrative: string;
    rewards: EventRewards;
  };
  failure?: {
    narrative: string;
    penalties: EventPenalties;
  };
}

export interface EventRewards {
  ep?: Record<string, number>;
  items?: Record<string, number>;
  life?: number;
  traits?: string[];
  achievement?: string;
}

export interface EventPenalties {
  life?: number;
  items?: string[];
  traits?: string[];
}

export interface Event {
  id: string;
  sessionId: string;
  metadata: EventMetadata;
  narrative: string;
  options: EventOption[];
}

export interface EventResult {
  success: boolean;
  narrative: string;
  rewards?: EventRewards;
  penalties?: EventPenalties;
}

export interface EventHistory {
  userId: string;
  eventId: string;
  timestamp: number;
  optionId: string;
  result: EventResult;
}