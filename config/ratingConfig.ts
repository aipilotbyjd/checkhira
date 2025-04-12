
export const RATING_CONFIG = {
  MIN_USAGE_COUNT: 2, // Reduced from 5
  DAYS_BETWEEN_PROMPTS: 7, // Reduced from 30
  MIN_TIME_IN_APP: 30, // Reduced from 60 seconds
  POSITIVE_ACTIONS_REQUIRED: 1, // Reduced from 3
  STORAGE_KEYS: {
    LAST_PROMPT: 'lastRatingPrompt',
    USAGE_COUNT: 'appUsageCount',
    HAS_RATED: 'hasRatedApp',
    POSITIVE_ACTIONS: 'positiveActionsCount',
    TIME_IN_APP: 'timeInApp',
  },
} as const;

export type RatingStorageKeys = typeof RATING_CONFIG.STORAGE_KEYS;
