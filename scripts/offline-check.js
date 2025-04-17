/**
 * Offline Compatibility Check Script
 * 
 * This script performs basic compatibility checks without requiring
 * an internet connection to the Expo API.
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`\n${colors.bright}${colors.magenta}=== OFFLINE COMPATIBILITY CHECK ===${colors.reset}\n`);

// Read package.json
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`${colors.green}✓ package.json is valid JSON${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}✗ Error reading package.json: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Read app.json
let appJson;
try {
  appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  console.log(`${colors.green}✓ app.json is valid JSON${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}✗ Error reading app.json: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Check Expo SDK version
const expoVersion = packageJson.dependencies.expo.replace(/[~^]/, '');
console.log(`${colors.cyan}Expo SDK Version: ${expoVersion}${colors.reset}`);

// Check React Native version
const rnVersion = packageJson.dependencies['react-native'].replace(/[~^]/, '');
console.log(`${colors.cyan}React Native Version: ${rnVersion}${colors.reset}`);

// Check app configuration
console.log(`\n${colors.bright}${colors.blue}Checking app configuration...${colors.reset}`);

// Check required fields in app.json
const requiredFields = ['name', 'slug', 'version'];
let missingFields = false;

requiredFields.forEach(field => {
  if (!appJson.expo[field]) {
    console.error(`${colors.red}✗ Missing required field in app.json: ${field}${colors.reset}`);
    missingFields = true;
  }
});

if (!missingFields) {
  console.log(`${colors.green}✓ All required fields present in app.json${colors.reset}`);
}

// Check platform configuration
if (appJson.expo.ios && appJson.expo.ios.bundleIdentifier) {
  console.log(`${colors.green}✓ iOS bundle identifier is set: ${appJson.expo.ios.bundleIdentifier}${colors.reset}`);
} else {
  console.log(`${colors.yellow}⚠ iOS bundle identifier is not set${colors.reset}`);
}

if (appJson.expo.android && appJson.expo.android.package) {
  console.log(`${colors.green}✓ Android package name is set: ${appJson.expo.android.package}${colors.reset}`);
} else {
  console.log(`${colors.yellow}⚠ Android package name is not set${colors.reset}`);
}

// Check dependencies compatibility
console.log(`\n${colors.bright}${colors.blue}Checking dependencies compatibility...${colors.reset}`);

// Define known compatible versions for Expo SDK 52
const compatibleVersions = {
  'react': '18.3.0',
  'react-native': '0.76.0',
  'expo-router': '4.0.0',
};

Object.entries(compatibleVersions).forEach(([pkg, minVersion]) => {
  const currentVersion = packageJson.dependencies[pkg]?.replace(/[~^]/, '');
  
  if (!currentVersion) {
    console.log(`${colors.yellow}⚠ Package ${pkg} not found in dependencies${colors.reset}`);
    return;
  }
  
  const currentParts = currentVersion.split('.').map(Number);
  const minParts = minVersion.split('.').map(Number);
  
  let isCompatible = true;
  for (let i = 0; i < 3; i++) {
    if (currentParts[i] < minParts[i]) {
      isCompatible = false;
      break;
    } else if (currentParts[i] > minParts[i]) {
      break;
    }
  }
  
  if (isCompatible) {
    console.log(`${colors.green}✓ ${pkg} version ${currentVersion} is compatible${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ ${pkg} version ${currentVersion} may not be compatible (min: ${minVersion})${colors.reset}`);
  }
});

// Check for potential issues
console.log(`\n${colors.bright}${colors.blue}Checking for potential issues...${colors.reset}`);

// Check for "latest" version specifiers
Object.entries(packageJson.dependencies).forEach(([pkg, version]) => {
  if (version === 'latest') {
    console.log(`${colors.yellow}⚠ Package ${pkg} uses 'latest' version specifier, which may cause compatibility issues${colors.reset}`);
  }
});

// Check for notification configuration
if (appJson.expo.notification) {
  console.log(`${colors.green}✓ Notification configuration is present${colors.reset}`);
} else {
  console.log(`${colors.yellow}⚠ No notification configuration found${colors.reset}`);
}

// Check for updates configuration
if (appJson.expo.updates && appJson.expo.updates.enabled) {
  console.log(`${colors.green}✓ Updates configuration is present and enabled${colors.reset}`);
} else {
  console.log(`${colors.yellow}⚠ Updates configuration is missing or disabled${colors.reset}`);
}

// Summary
console.log(`\n${colors.bright}${colors.magenta}=== SUMMARY ===${colors.reset}`);
console.log(`${colors.cyan}App Name: ${appJson.expo.name}${colors.reset}`);
console.log(`${colors.cyan}Version: ${appJson.expo.version}${colors.reset}`);
console.log(`${colors.cyan}Expo SDK: ${expoVersion}${colors.reset}`);
console.log(`${colors.cyan}React Native: ${rnVersion}${colors.reset}`);

console.log(`\n${colors.bright}${colors.green}Offline compatibility check completed.${colors.reset}`);
console.log(`${colors.yellow}Note: This is a basic check and does not replace the full expo-doctor validation.${colors.reset}`);
console.log(`${colors.yellow}When your internet connection is working, run 'npm run update:check' for a complete check.${colors.reset}\n`);
