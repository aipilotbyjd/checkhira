/**
 * App Management Script
 * 
 * This script provides a command-line interface for managing the app,
 * including building, deploying, and maintaining it.
 * 
 * Usage: node scripts/manage-app.js [command]
 * 
 * Commands:
 * - build:dev: Build the app for development
 * - build:preview: Build the app for preview
 * - build:prod: Build the app for production
 * - update:check: Check for updates
 * - update:fix: Fix updates
 * - deps:check: Check dependencies
 * - deps:update: Update dependencies
 * - release:patch: Release a patch version
 * - release:minor: Release a minor version
 * - release:major: Release a major version
 * - help: Show help
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask a question and get user input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Helper function to display a menu and get user selection
async function showMenu(title, options) {
  console.log(`\n${colors.bright}${colors.magenta}=== ${title} ===${colors.reset}\n`);

  options.forEach((option, index) => {
    console.log(`${colors.cyan}${index + 1}${colors.reset}. ${option.name}`);
  });

  console.log(`\n${colors.cyan}0${colors.reset}. Back to main menu`);

  const answer = await askQuestion(`\nEnter your choice (0-${options.length}): `);
  const choice = parseInt(answer, 10);

  if (choice === 0) {
    return null;
  }

  if (choice > 0 && choice <= options.length) {
    return options[choice - 1];
  }

  console.log(`${colors.red}Invalid choice. Please try again.${colors.reset}`);
  return showMenu(title, options);
}

// Build commands
const buildCommands = [
  {
    name: 'Build for Development',
    description: 'Build the app for development with development client',
    command: 'npm run build:dev',
  },
  {
    name: 'Build for Preview',
    description: 'Build the app for internal testing',
    command: 'npm run build:preview',
  },
  {
    name: 'Build for Production',
    description: 'Build the app for production release',
    command: 'npm run build:prod',
  },
  {
    name: 'Build for Production (with checks)',
    description: 'Build the app for production with additional checks',
    command: 'npm run build:production',
  },
];

// Update commands
const updateCommands = [
  {
    name: 'Check for Updates',
    description: 'Check for Expo compatibility issues',
    command: 'npm run update:check',
  },
  {
    name: 'Fix Updates',
    description: 'Fix Expo compatibility issues',
    command: 'npm run update:fix',
  },
];

// Dependency commands
const dependencyCommands = [
  {
    name: 'Check Dependencies',
    description: 'Check for outdated dependencies and security vulnerabilities',
    command: 'npm run deps:check',
  },
  {
    name: 'Update Dependencies',
    description: 'Update all dependencies',
    command: 'npm run deps:update',
  },
];

// Release commands
const releaseCommands = [
  {
    name: 'Release Patch Version',
    description: 'Release a patch version (1.0.0 -> 1.0.1)',
    command: 'npm run release:patch',
  },
  {
    name: 'Release Minor Version',
    description: 'Release a minor version (1.0.0 -> 1.1.0)',
    command: 'npm run release:minor',
  },
  {
    name: 'Release Major Version',
    description: 'Release a major version (1.0.0 -> 2.0.0)',
    command: 'npm run release:major',
  },
];

// Main menu options
const mainMenuOptions = [
  {
    name: 'Build App',
    action: async () => {
      const command = await showMenu('Build App', buildCommands);
      if (command) {
        console.log(`\n${colors.cyan}${command.description}${colors.reset}`);
        const confirm = await askQuestion(`\nDo you want to run "${command.command}"? (y/n): `);
        if (confirm.toLowerCase() === 'y') {
          runCommand(command.command);
        }
      }
    },
  },
  {
    name: 'Update App',
    action: async () => {
      const command = await showMenu('Update App', updateCommands);
      if (command) {
        console.log(`\n${colors.cyan}${command.description}${colors.reset}`);
        const confirm = await askQuestion(`\nDo you want to run "${command.command}"? (y/n): `);
        if (confirm.toLowerCase() === 'y') {
          runCommand(command.command);
        }
      }
    },
  },
  {
    name: 'Manage Dependencies',
    action: async () => {
      const command = await showMenu('Manage Dependencies', dependencyCommands);
      if (command) {
        console.log(`\n${colors.cyan}${command.description}${colors.reset}`);
        const confirm = await askQuestion(`\nDo you want to run "${command.command}"? (y/n): `);
        if (confirm.toLowerCase() === 'y') {
          runCommand(command.command);
        }
      }
    },
  },
  {
    name: 'Release App',
    action: async () => {
      const command = await showMenu('Release App', releaseCommands);
      if (command) {
        console.log(`\n${colors.cyan}${command.description}${colors.reset}`);
        const confirm = await askQuestion(`\nDo you want to run "${command.command}"? (y/n): `);
        if (confirm.toLowerCase() === 'y') {
          runCommand(command.command);
        }
      }
    },
  },
  {
    name: 'Show App Info',
    action: async () => {
      console.log(`\n${colors.bright}${colors.magenta}=== App Info ===${colors.reset}\n`);

      // Read package.json
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      // Read app.json
      const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));

      console.log(`${colors.cyan}App Name:${colors.reset} ${appJson.expo.name}`);
      console.log(`${colors.cyan}Version:${colors.reset} ${packageJson.version}`);
      console.log(`${colors.cyan}Expo SDK:${colors.reset} ${packageJson.dependencies.expo.replace('~', '')}`);
      console.log(`${colors.cyan}React Native:${colors.reset} ${packageJson.dependencies['react-native'].replace('~', '')}`);

      console.log(`\n${colors.cyan}Android Package:${colors.reset} ${appJson.expo.android.package}`);
      console.log(`${colors.cyan}iOS Bundle ID:${colors.reset} ${appJson.expo.ios.bundleIdentifier}`);

      console.log(`\n${colors.cyan}Environment:${colors.reset} ${process.env.NODE_ENV || 'development'}`);

      await askQuestion(`\nPress Enter to continue...`);
    },
  },
  {
    name: 'Exit',
    action: async () => {
      console.log(`\n${colors.green}Goodbye!${colors.reset}`);
      rl.close();
      process.exit(0);
    },
  },
];

// Main function
async function main() {
  console.log(`\n${colors.bright}${colors.magenta}=== CheckHira App Management ===${colors.reset}\n`);

  // Check if a command was provided as an argument
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const command = args[0];

    // Handle direct commands
    switch (command) {
      case 'build:dev':
        runCommand('npm run build:dev');
        break;
      case 'build:preview':
        runCommand('npm run build:preview');
        break;
      case 'build:prod':
        runCommand('npm run build:prod');
        break;
      case 'update:check':
        runCommand('npm run update:check');
        break;
      case 'update:fix':
        runCommand('npm run update:fix');
        break;
      case 'deps:check':
        runCommand('npm run deps:check');
        break;
      case 'deps:update':
        runCommand('npm run deps:update');
        break;
      case 'release:patch':
        runCommand('npm run release:patch');
        break;
      case 'release:minor':
        runCommand('npm run release:minor');
        break;
      case 'release:major':
        runCommand('npm run release:major');
        break;
      case 'help':
        showHelp();
        break;
      default:
        console.log(`${colors.red}Unknown command: ${command}${colors.reset}`);
        showHelp();
        break;
    }

    rl.close();
    return;
  }

  // Interactive mode
  while (true) {
    console.log(`\n${colors.bright}${colors.magenta}=== Main Menu ===${colors.reset}\n`);

    mainMenuOptions.forEach((option, index) => {
      console.log(`${colors.cyan}${index + 1}${colors.reset}. ${option.name}`);
    });

    const answer = await askQuestion(`\nEnter your choice (1-${mainMenuOptions.length}): `);
    const choice = parseInt(answer, 10);

    if (choice > 0 && choice <= mainMenuOptions.length) {
      await mainMenuOptions[choice - 1].action();
    } else {
      console.log(`${colors.red}Invalid choice. Please try again.${colors.reset}`);
    }
  }
}

// Show help
function showHelp() {
  console.log(`\n${colors.bright}${colors.magenta}=== Help ===${colors.reset}\n`);
  console.log(`Usage: node scripts/manage-app.js [command]\n`);
  console.log(`Commands:`);
  console.log(`  build:dev       Build the app for development`);
  console.log(`  build:preview   Build the app for preview`);
  console.log(`  build:prod      Build the app for production`);
  console.log(`  update:check    Check for updates`);
  console.log(`  update:fix      Fix updates`);
  console.log(`  deps:check      Check dependencies`);
  console.log(`  deps:update     Update dependencies`);
  console.log(`  release:patch   Release a patch version`);
  console.log(`  release:minor   Release a minor version`);
  console.log(`  release:major   Release a major version`);
  console.log(`  help            Show this help\n`);
}

// Run the main function
main().catch((error) => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  rl.close();
  process.exit(1);
});
