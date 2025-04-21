/**
 * Script to encode Firebase configuration files for EAS Secrets
 * 
 * This script encodes google-services.json and GoogleService-Info.plist
 * to base64 format for use with EAS Secrets.
 * 
 * Usage: node scripts/encode-firebase-config.js
 */

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

// Print header
console.log(`\n${colors.bright}${colors.magenta}=== FIREBASE CONFIG ENCODER ===${colors.reset}\n`);

// Function to encode a file to base64
function encodeFileToBase64(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`${colors.yellow}File not found: ${filePath}${colors.reset}`);
      return null;
    }

    const fileContent = fs.readFileSync(filePath);
    return Buffer.from(fileContent).toString('base64');
  } catch (error) {
    console.error(`${colors.red}Error encoding file ${filePath}: ${error.message}${colors.reset}`);
    return null;
  }
}

// Function to save base64 content to a file
function saveBase64ToFile(content, outputPath) {
  try {
    fs.writeFileSync(outputPath, content);
    console.log(`${colors.green}Encoded content saved to: ${outputPath}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error saving to ${outputPath}: ${error.message}${colors.reset}`);
  }
}

// Main function
function main() {
  const rootDir = path.resolve(__dirname, '..');

  // Encode google-services.json
  console.log(`${colors.cyan}Encoding google-services.json...${colors.reset}`);
  const androidConfigPath = path.join(rootDir, 'google-services.json');
  const androidBase64 = encodeFileToBase64(androidConfigPath);

  if (androidBase64) {
    const androidOutputPath = path.join(rootDir, 'google-services-json-base64.txt');
    saveBase64ToFile(androidBase64, androidOutputPath);

    console.log(`\n${colors.cyan}EAS Secret command for Android:${colors.reset}`);
    console.log(`eas secret:create --scope project --name GOOGLE_SERVICES_JSON --value "$(cat google-services-json-base64.txt)"\n`);
  } else {
    console.log(`${colors.yellow}Skipping Android config encoding.${colors.reset}\n`);
  }

  // Encode GoogleService-Info.plist
  console.log(`${colors.cyan}Encoding GoogleService-Info.plist...${colors.reset}`);
  const iosConfigPath = path.join(rootDir, 'GoogleService-Info.plist');
  const iosBase64 = encodeFileToBase64(iosConfigPath);

  if (iosBase64) {
    const iosOutputPath = path.join(rootDir, 'google-services-plist-base64.txt');
    saveBase64ToFile(iosBase64, iosOutputPath);

    console.log(`\n${colors.cyan}EAS Secret command for iOS:${colors.reset}`);
    console.log(`eas secret:create --scope project --name GOOGLE_SERVICES_PLIST --value "$(cat google-services-plist-base64.txt)"\n`);
  } else {
    console.log(`${colors.yellow}Skipping iOS config encoding.${colors.reset}\n`);
  }

  console.log(`${colors.bright}${colors.green}Encoding complete!${colors.reset}`);
  console.log(`${colors.dim}Use the commands above to set up your EAS Secrets.${colors.reset}\n`);
}

// Run the main function
main();
