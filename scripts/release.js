/**
 * Release Script
 * 
 * This script automates the process of creating a new release.
 * It performs the following steps:
 * 1. Bumps the version number in package.json and app.json
 * 2. Creates a git tag for the new version
 * 3. Pushes the changes and tag to the remote repository
 * 4. Builds the app for production using EAS
 * 
 * Usage: node scripts/release.js [patch|minor|major]
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

// Helper function to execute commands and capture output
function runCommandWithOutput(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error(`${colors.red}Command failed: ${command}${colors.reset}`);
    process.exit(1);
  }
}

// Print header
console.log(`\n${colors.bright}${colors.magenta}=== RELEASE SCRIPT ===${colors.reset}\n`);

// Step 1: Determine the version bump type
const args = process.argv.slice(2);
const validBumpTypes = ['patch', 'minor', 'major'];
const bumpType = args[0] || 'patch';

if (!validBumpTypes.includes(bumpType)) {
  console.error(`${colors.red}Invalid bump type: ${bumpType}${colors.reset}`);
  console.error(`${colors.yellow}Valid options are: ${validBumpTypes.join(', ')}${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.cyan}Preparing ${bumpType} release...${colors.reset}`);

// Step 2: Check if the working directory is clean
const status = runCommandWithOutput('git status --porcelain');
if (status) {
  console.error(`${colors.red}Working directory is not clean. Please commit or stash your changes.${colors.reset}`);
  process.exit(1);
}

// Step 3: Update version in package.json
console.log(`${colors.cyan}Updating version in package.json...${colors.reset}`);
runCommand(`npm version ${bumpType} --no-git-tag-version`);

// Step 4: Get the new version number
const newVersion = JSON.parse(fs.readFileSync('package.json')).version;
console.log(`${colors.green}New version: ${newVersion}${colors.reset}`);

// Step 5: Update version in app.json
console.log(`${colors.cyan}Updating version in app.json...${colors.reset}`);
const appJsonPath = path.join(process.cwd(), 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.expo.version = newVersion;
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

// Step 6: Commit the version changes
console.log(`${colors.cyan}Committing version changes...${colors.reset}`);
runCommand('git add package.json app.json');
runCommand(`git commit -m "chore: bump version to ${newVersion}"`);

// Step 7: Create a git tag
console.log(`${colors.cyan}Creating git tag...${colors.reset}`);
runCommand(`git tag -a v${newVersion} -m "Release v${newVersion}"`);

// Step 8: Push changes and tag to remote
console.log(`${colors.cyan}Pushing changes and tag to remote...${colors.reset}`);
runCommand('git push');
runCommand('git push --tags');

// Step 9: Build the app for production
console.log(`${colors.cyan}Building app for production...${colors.reset}`);
runCommand('npm run build:prod');

// Success message
console.log(`\n${colors.green}${colors.bright}Release v${newVersion} created successfully!${colors.reset}`);
console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
console.log(`${colors.yellow}1. Monitor the build progress in the EAS dashboard${colors.reset}`);
console.log(`${colors.yellow}2. Submit the app to app stores when the build is complete${colors.reset}`);
console.log(`${colors.yellow}3. Create a release on GitHub: https://github.com/yourusername/checkhira/releases/new?tag=v${newVersion}${colors.reset}\n`);
