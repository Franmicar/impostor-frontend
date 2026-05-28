export interface UserProfile {
  firstName: string;
  lastName: string;
  nickname: string;
  avatarId: string;
  avatarColor: string;
  avatarFrame?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgression {
  level: number;
  xp: number;
  unlockedAvatars: string[];
  unlockedFrames: string[];
  badges: string[];
  cosmetics: string[];
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  timesImpostor: number;
  totalPlayTimeSecs: number;
  correctVotes: number;
  winStreak: number;
  [key: string]: any; // Allow indexing
}

export interface UserStats {
  offline: GameStats;
  online: GameStats;
}

export interface CompleteUserProfile {
  uid: string;
  profile: UserProfile;
  progression: UserProgression;
  stats: UserStats;
}
