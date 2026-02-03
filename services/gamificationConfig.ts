
export interface Sigil {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: GameStats) => boolean;
}

export interface GameStats {
  karma: number;
  streak: number;
  readingsCount: number;
  unlockedSigils: string[];
}

export const LEVELS = [
  { level: 1, title: "Novice Seeker", minKarma: 0 },
  { level: 2, title: "Apprentice", minKarma: 200 },
  { level: 3, title: "Adept", minKarma: 500 },
  { level: 4, title: "Mystic", minKarma: 1000 },
  { level: 5, title: "Oracle", minKarma: 2000 },
  { level: 6, title: "Grand Sage", minKarma: 5000 },
  { level: 7, title: "Ascended Master", minKarma: 10000 },
];

export const SIGILS: Sigil[] = [
  {
    id: 'awakening',
    name: 'The Awakening',
    description: 'Complete your first reading.',
    icon: '👁️',
    condition: (s) => s.readingsCount >= 1
  },
  {
    id: 'consistent_soul',
    name: 'Consistent Soul',
    description: 'Achieve a 3-day alignment streak.',
    icon: '🔥',
    condition: (s) => s.streak >= 3
  },
  {
    id: 'dedicated_devotee',
    name: 'Devoted Spirit',
    description: 'Achieve a 7-day alignment streak.',
    icon: '⚡',
    condition: (s) => s.streak >= 7
  },
  {
    id: 'tarot_master',
    name: 'Keeper of Cards',
    description: 'Reach 500 Karma points.',
    icon: '🃏',
    condition: (s) => s.karma >= 500
  },
  {
    id: 'high_priest',
    name: 'High Priest',
    description: 'Reach Level 5 (Oracle).',
    icon: '👑',
    condition: (s) => s.karma >= 2000
  }
];

export const ACTION_POINTS = {
  DAILY_LOGIN: 50,
  READING_COMPLETE: 20,
  SHARE: 30,
  REFERRAL: 100
};

export const getLevel = (karma: number) => {
  return [...LEVELS].reverse().find(l => karma >= l.minKarma) || LEVELS[0];
};

export const getNextLevel = (karma: number) => {
  const current = getLevel(karma);
  const next = LEVELS.find(l => l.level === current.level + 1);
  return next || { ...current, minKarma: 999999 }; // Max level cap
};
