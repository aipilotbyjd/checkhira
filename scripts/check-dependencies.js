/**
 * Dependency Check Script
 * 
 * This script checks for outdated dependencies and security vulnerabilities.
 * It performs the following steps:
 * 1. Runs npm outdated to check for outdated packages
 * 2. Runs npm audit to check for security vulnerabilities
 * 3. Provides recommendations for updates
 * 
 * Usage: node scripts/check-dependencies.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to execute commands and capture output
function runCommandWithOutput(command) {
  console.log(`${colors.bright}${colors.blue}> ${command}${colors.reset}`);
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    if (error.stdout) {
      return error.stdout;
    }
    console.error(`${colors.red}Command failed: ${command}${colors.reset}`);
    return '';
  }
}

// Print header
console.log(`\n${colors.bright}${colors.magenta}=== DEPENDENCY CHECK SCRIPT ===${colors.reset}\n`);

// Step 1: Check for outdated packages
console.log(`${colors.cyan}Checking for outdated packages...${colors.reset}`);
const outdatedOutput = runCommandWithOutput('npm outdated --json');

let outdatedPackages = {};
try {
  if (outdatedOutput.trim()) {
    outdatedPackages = JSON.parse(outdatedOutput);
  }
} catch (error) {
  console.error(`${colors.red}Error parsing outdated packages: ${error.message}${colors.reset}`);
}

const outdatedCount = Object.keys(outdatedPackages).length;

if (outdatedCount > 0) {
  console.log(`\n${colors.yellow}Found ${outdatedCount} outdated packages:${colors.reset}`);
  
  // Group packages by update type (major, minor, patch)
  const majorUpdates = [];
  const minorUpdates = [];
  const patchUpdates = [];
  
  Object.entries(outdatedPackages).forEach(([name, info]) => {
    const current = info.current;
    const latest = info.latest;
    
    if (!current || !latest) return;
    
    const currentParts = current.split('.');
    const latestParts = latest.split('.');
    
    if (currentParts[0] !== latestParts[0]) {
      majorUpdates.push({ name, current, latest });
    } else if (currentParts[1] !== latestParts[1]) {
      minorUpdates.push({ name, current, latest });
    } else {
      patchUpdates.push({ name, current, latest });
    }
  });
  
  // Display update recommendations
  if (patchUpdates.length > 0) {
    console.log(`\n${colors.green}Recommended patch updates (safe):${colors.reset}`);
    const updateCommand = `npm install ${patchUpdates.map(p => `${p.name}@${p.latest}`).join(' ')}`;
    patchUpdates.forEach(p => {
      console.log(`  ${p.name}: ${p.current} → ${p.latest}`);
    });
    console.log(`\n  Run: ${colors.bright}${updateCommand}${colors.reset}\n`);
  }
  
  if (minorUpdates.length > 0) {
    console.log(`\n${colors.yellow}Minor updates (may require testing):${colors.reset}`);
    minorUpdates.forEach(p => {
      console.log(`  ${p.name}: ${p.current} → ${p.latest}`);
    });
  }
  
  if (majorUpdates.length > 0) {
    console.log(`\n${colors.red}Major updates (may break compatibility):${colors.reset}`);
    majorUpdates.forEach(p => {
      console.log(`  ${p.name}: ${p.current} → ${p.latest}`);
    });
  }
} else {
  console.log(`${colors.green}All packages are up to date!${colors.reset}`);
}

// Step 2: Check for security vulnerabilities
console.log(`\n${colors.cyan}Checking for security vulnerabilities...${colors.reset}`);
const auditOutput = runCommandWithOutput('npm audit --json');

let auditResults = {};
try {
  if (auditOutput.trim()) {
    auditResults = JSON.parse(auditOutput);
  }
} catch (error) {
  console.error(`${colors.red}Error parsing audit results: ${error.message}${colors.reset}`);
}

const vulnerabilityCount = auditResults.metadata?.vulnerabilities?.total || 0;

if (vulnerabilityCount > 0) {
  console.log(`\n${colors.red}Found ${vulnerabilityCount} security vulnerabilities:${colors.reset}`);
  console.log(`  Critical: ${auditResults.metadata?.vulnerabilities?.critical || 0}`);
  console.log(`  High: ${auditResults.metadata?.vulnerabilities?.high || 0}`);
  console.log(`  Moderate: ${auditResults.metadata?.vulnerabilities?.moderate || 0}`);
  console.log(`  Low: ${auditResults.metadata?.vulnerabilities?.low || 0}`);
  
  console.log(`\n${colors.yellow}Run the following command to fix vulnerabilities:${colors.reset}`);
  console.log(`  ${colors.bright}npm audit fix${colors.reset}`);
  console.log(`\n${colors.yellow}For major updates that cannot be fixed automatically:${colors.reset}`);
  console.log(`  ${colors.bright}npm audit fix --force${colors.reset} (use with caution)`);
} else {
  console.log(`${colors.green}No security vulnerabilities found!${colors.reset}`);
}

// Step 3: Check for Expo SDK compatibility
console.log(`\n${colors.cyan}Checking Expo SDK compatibility...${colors.reset}`);
console.log(`${colors.yellow}Run the following command to check for Expo compatibility issues:${colors.reset}`);
console.log(`  ${colors.bright}npx expo-doctor${colors.reset}`);
console.log(`\n${colors.yellow}To automatically fix Expo compatibility issues:${colors.reset}`);
console.log(`  ${colors.bright}npx expo-doctor --fix${colors.reset}`);

// Final recommendations
console.log(`\n${colors.bright}${colors.magenta}=== RECOMMENDATIONS ===${colors.reset}`);
console.log(`\n${colors.cyan}1. Always test your app after updating dependencies${colors.reset}`);
console.log(`${colors.cyan}2. Update patch versions regularly for security fixes${colors.reset}`);
console.log(`${colors.cyan}3. Be cautious with major version updates${colors.reset}`);
console.log(`${colors.cyan}4. Check the release notes before updating${colors.reset}`);
console.log(`${colors.cyan}5. Run this script regularly to keep dependencies healthy${colors.reset}\n`);
