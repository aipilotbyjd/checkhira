
export const RATING_CONFIG = {
  MIN_USAGE_COUNT: 1,
  DAYS_BETWEEN_PROMPTS: 0,
  MIN_TIME_IN_APP: 0,
  POSITIVE_ACTIONS_REQUIRED: 0,
  STORAGE_KEYS: {
    LAST_PROMPT: 'lastRatingPrompt',
    USAGE_COUNT: 'appUsageCount',
    HAS_RATED: 'hasRatedApp',
    POSITIVE_ACTIONS: 'positiveActionsCount',
    TIME_IN_APP: 'timeInApp',
  },
} as const;

export type RatingStorageKeys = typeof RATING_CONFIG.STORAGE_KEYS;
