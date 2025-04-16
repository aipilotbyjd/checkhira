# Production Certificates

This directory contains certificates for code signing in production.

## Required Files

- `production-cert.pem`: The production certificate for code signing EAS updates.

## How to Generate Certificates

To generate a production certificate, follow these steps:

1. Install the EAS CLI: `npm install -g eas-cli`
2. Log in to your Expo account: `eas login`
3. Generate a new certificate: `eas credentials:generate`
4. Follow the prompts to create a new certificate
5. Save the certificate in this directory as `production-cert.pem`

## Security Notice

- Never commit actual certificate files to version control
- Add certificate files to `.gitignore`
- Store certificates securely in a password manager or secure storage
- Only share certificates with authorized team members
