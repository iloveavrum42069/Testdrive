export const STORAGE_KEYS = {
    REGISTRATIONS: 'testDriveRegistrations',
    PAGE_SETTINGS: 'pageSettings',
} as const;

export const ERROR_MESSAGES = {
    STORAGE_QUOTA_EXCEEDED: 'Storage quota exceeded. Please clear some data.',
    STORAGE_UNAVAILABLE: 'Storage is not available. Private browsing may be enabled.',
    INVALID_DATA: 'Failed to load data. The data may be corrupted.',
    SAVE_FAILED: 'Failed to save data. Please try again.',
} as const;

// Type exports for better type safety
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];
