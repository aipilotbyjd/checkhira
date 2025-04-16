/**
 * Production Build Script
 * 
 * This script automates the process of building the app for production.
 * It performs the following steps:
 * 1. Runs linting and type checking
 * 2. Runs tests (if available)
 * 3. Builds the app for production using EAS
 * 
 * Usage: node scripts/build-production.js
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

// Helper function to execute commands and log output
function runCommand(command, options = {}) {
  console.log(`${colors.bright}${colors.blue}> ${command}${colors.reset}`);
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    console.error(`${colors.red}Command failed: ${command}${colors.reset}`);
    if (!options.ignoreError) {
      process.exit(1);
    }
    return false;
  }
}

// Print header
console.log(`\n${colors.bright}${colors.magenta}=== PRODUCTION BUILD SCRIPT ===${colors.reset}\n`);

// Step 1: Check if all required files exist
console.log(`${colors.cyan}Checking required files...${colors.reset}`);
const requiredFiles = [
  'app.json',
  'eas.json',
  'package.json',
];

let missingFiles = false;
requiredFiles.forEach(file => {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    console.error(`${colors.red}Missing required file: ${file}${colors.reset}`);
    missingFiles = true;
  }
});

if (missingFiles) {
  process.exit(1);
}

// Step 2: Run linting and type checking
console.log(`\n${colors.cyan}Running linting and type checking...${colors.reset}`);
runCommand('npm run lint');

// Step 3: Run tests (if available)
console.log(`\n${colors.cyan}Running tests...${colors.reset}`);
runCommand('npm test', { ignoreError: true });

// Step 4: Build the app for production
console.log(`\n${colors.cyan}Building app for production...${colors.reset}`);
runCommand('npm run build:prod');

// Success message
console.log(`\n${colors.green}${colors.bright}Production build completed successfully!${colors.reset}\n`);
