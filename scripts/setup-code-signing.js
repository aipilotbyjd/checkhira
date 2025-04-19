#!/usr/bin/env node

/**
 * This script helps set up code signing for Expo Updates.
 * It can be used to:
 * 1. Generate new code signing certificates
 * 2. Configure app.json for local development
 * 3. Configure app.json for EAS builds
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Paths
const CERTS_DIR = path.join(__dirname, '..', 'certs', 'production');
const KEYS_DIR = path.join(__dirname, '..', 'keys', 'production');
const APP_JSON_PATH = path.join(__dirname, '..', 'app.json');

// Ensure directories exist
function ensureDirectoriesExist() {
  if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
    console.log(`Created directory: ${CERTS_DIR}`);
  }

  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
    console.log(`Created directory: ${KEYS_DIR}`);
  }
}

// Generate certificates
function generateCertificates() {
  try {
    console.log('Generating code signing certificates...');

    // Clear directories first
    fs.readdirSync(CERTS_DIR).forEach(file => {
      fs.unlinkSync(path.join(CERTS_DIR, file));
    });

    fs.readdirSync(KEYS_DIR).forEach(file => {
      fs.unlinkSync(path.join(KEYS_DIR, file));
    });

    // Generate new certificates
    execSync(
      `npx expo-updates codesigning:generate --key-output-directory ${KEYS_DIR} --certificate-output-directory ${CERTS_DIR} --certificate-validity-duration-years 10 --certificate-common-name "CheckHira"`,
      { stdio: 'inherit' }
    );

    console.log('Certificates generated successfully!');
    return true;
  } catch (error) {
    console.error('Error generating certificates:', error.message);
    return false;
  }
}

// Configure app.json for local development
function configureForLocalDevelopment() {
  try {
    const appJson = JSON.parse(fs.readFileSync(APP_JSON_PATH, 'utf8'));

    // Update the updates section
    appJson.expo.updates = {
      ...appJson.expo.updates,
      codeSigningCertificate: "./certs/production/certificate.pem",
      codeSigningMetadata: {
        keyid: "main",
        alg: "rsa-v1_5-sha256"
      }
    };

    // Write back to app.json
    fs.writeFileSync(APP_JSON_PATH, JSON.stringify(appJson, null, 2));
    console.log('app.json configured for local development');
    return true;
  } catch (error) {
    console.error('Error configuring app.json:', error.message);
    return false;
  }
}

// Configure app.json for EAS builds
function configureForEASBuilds() {
  try {
    const appJson = JSON.parse(fs.readFileSync(APP_JSON_PATH, 'utf8'));

    // Remove code signing configuration for EAS builds
    if (appJson.expo.updates) {
      delete appJson.expo.updates.codeSigningCertificate;
      delete appJson.expo.updates.codeSigningMetadata;
    }

    // Write back to app.json
    fs.writeFileSync(APP_JSON_PATH, JSON.stringify(appJson, null, 2));
    console.log('app.json configured for EAS builds (code signing disabled)');
    return true;
  } catch (error) {
    console.error('Error configuring app.json:', error.message);
    return false;
  }
}

// Main menu
function showMenu() {
  console.log('\n=== Code Signing Setup ===');
  console.log('1. Generate new certificates');
  console.log('2. Configure for local development');
  console.log('3. Configure for EAS builds');
  console.log('4. Exit');

  rl.question('\nSelect an option (1-4): ', (answer) => {
    switch (answer) {
      case '1':
        ensureDirectoriesExist();
        if (generateCertificates()) {
          showMenu();
        } else {
          process.exit(1);
        }
        break;
      case '2':
        if (configureForLocalDevelopment()) {
          showMenu();
        } else {
          process.exit(1);
        }
        break;
      case '3':
        if (configureForEASBuilds()) {
          showMenu();
        } else {
          process.exit(1);
        }
        break;
      case '4':
        console.log('Exiting...');
        rl.close();
        break;
      default:
        console.log('Invalid option. Please try again.');
        showMenu();
        break;
    }
  });
}

// Process command line arguments
function processArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    // No arguments, show the menu
    console.log('CheckHira Code Signing Setup');
    showMenu();
    return;
  }

  // Handle specific commands
  const command = args[0].toLowerCase();
  switch (command) {
    case 'local':
      ensureDirectoriesExist();
      configureForLocalDevelopment();
      rl.close();
      break;
    case 'eas':
      configureForEASBuilds();
      rl.close();
      break;
    case 'generate':
      ensureDirectoriesExist();
      generateCertificates();
      rl.close();
      break;
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Available commands: local, eas, generate');
      rl.close();
      break;
  }
}

// Start the script
processArgs();

rl.on('close', () => {
  process.exit(0);
});
