export const ASSET_KEYS = {
  HOME_MASK: 'home.impostor_mask',
  
  // Setup Indicators
  SETUP_MODE: 'setup.mode',
  SETUP_TYPE: 'setup.type',
  SETUP_PLAYERS: 'setup.players',
  SETUP_IMPOSTORS: 'setup.impostors',
  SETUP_DETECTIVES: 'setup.detectives',
  SETUP_HINTS: 'setup.hints',
  SETUP_PACKAGE: 'setup.package',
  SETUP_DURATION: 'setup.duration',
  SETUP_TURN_TIME: 'setup.turn_time',

  // Modes
  MODE_CLASSIC: 'modes.classic',
  MODE_FAST: 'modes.fast',
  MODE_DETECTIVE: 'modes.detective',
  MODE_CHAOS: 'modes.chaos',
  MODE_INFILTRATOR: 'modes.infiltrator',
  MODE_TEAM: 'modes.team',

  // Types
  TYPE_WORD: 'types.word',
  TYPE_QUESTION: 'types.question',
  TYPE_DRAW: 'types.draw',

  // Shared
  DEFAULT_AVATAR: 'shared.default_avatar'
} as const;

export const LOCAL_ASSET_MAPPING: Record<string, string> = {
  [ASSET_KEYS.HOME_MASK]: '/images/home_impostor_mask.png',
  
  // Setup Indicators
  [ASSET_KEYS.SETUP_MODE]: '/images/setup/mode.png',
  [ASSET_KEYS.SETUP_TYPE]: '/images/setup/type.png',
  [ASSET_KEYS.SETUP_PLAYERS]: '/images/setup/players.png',
  [ASSET_KEYS.SETUP_IMPOSTORS]: '/images/setup/impostors.png',
  [ASSET_KEYS.SETUP_DETECTIVES]: '/images/setup/detectives.png',
  [ASSET_KEYS.SETUP_HINTS]: '/images/setup/hints.png',
  [ASSET_KEYS.SETUP_PACKAGE]: '/images/setup/package.png',
  [ASSET_KEYS.SETUP_DURATION]: '/images/setup/duration.png',
  [ASSET_KEYS.SETUP_TURN_TIME]: '/images/setup/turn_time.png',

  // Modes
  [ASSET_KEYS.MODE_CLASSIC]: '/images/modes/classic.png',
  [ASSET_KEYS.MODE_FAST]: '/images/modes/fast.png',
  [ASSET_KEYS.MODE_DETECTIVE]: '/images/modes/detective.png',
  [ASSET_KEYS.MODE_CHAOS]: '/images/modes/chaos.png',
  [ASSET_KEYS.MODE_INFILTRATOR]: '/images/modes/infiltrator.png',
  [ASSET_KEYS.MODE_TEAM]: '/images/modes/team.png',

  // Types
  [ASSET_KEYS.TYPE_WORD]: '/images/types/word.png',
  [ASSET_KEYS.TYPE_QUESTION]: '/images/types/question.png',
  [ASSET_KEYS.TYPE_DRAW]: '/images/types/draw.png',

  // Shared
  [ASSET_KEYS.DEFAULT_AVATAR]: '/images/default-avatar.png',

  // Package overrides
  'packages.fantasia': '/images/packages/fantasia_mitologia.png',
  'packages.ciencia': '/images/packages/ciencia_espacio.png'
};
