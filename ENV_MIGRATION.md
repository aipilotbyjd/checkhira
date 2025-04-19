# Environment Variables Migration Guide

This document explains the migration from `react-native-dotenv` to Expo's built-in environment variable support.

## Why We Migrated

- `react-native-dotenv` is incompatible with expo-router due to how it processes environment variables
- The Babel plugin used by react-native-dotenv aggressively inlines all environment variables from the machine into the bundle
- This can overwrite critical environment variables that expo-router relies on, such as EXPO_ROUTER_APP_ROOT
- Expo's built-in environment variable support is fully compatible with expo-router

## Changes Made

1. Removed `react-native-dotenv` package
2. Updated environment variable naming to use the `EXPO_PUBLIC_` prefix
3. Updated `.env.example` to reflect the new naming convention
4. Updated `babel.config.js` to remove the react-native-dotenv plugin
5. Updated `config/environment.ts` to use `process.env.EXPO_PUBLIC_*` variables
6. Updated type definitions in `expo-env.d.ts`

## How to Use Environment Variables

### In .env Files

All environment variables must be prefixed with `EXPO_PUBLIC_`:

```
# Before
API_URL=https://api.example.com

# After
EXPO_PUBLIC_API_URL=https://api.example.com
```

### In Code

Access environment variables using `process.env`:

```typescript
// Before
import { API_URL } from '@env';

// After
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

## Important Notes

1. Only variables prefixed with `EXPO_PUBLIC_` will be included in your JavaScript bundle
2. These variables are public and will be visible in your client code
3. Do not store secrets in environment variables with the `EXPO_PUBLIC_` prefix
4. For sensitive information, use a server-side solution or secure storage

## Troubleshooting

If you encounter issues after this migration:

1. Make sure your `.env` file uses the `EXPO_PUBLIC_` prefix for all variables
2. Clear the Metro bundler cache: `npx expo start -c`
3. Rebuild your app if necessary: `npx expo prebuild --clean`
