# CheckHira App Management Guide

This guide provides comprehensive instructions for managing your CheckHira app, including building, deploying, and maintaining it.

## Table of Contents

1. [Build Process](#build-process)
2. [Environment Management](#environment-management)
3. [Dependency Management](#dependency-management)
4. [Version Management](#version-management)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

## Build Process

### Build Profiles

The app has three build profiles configured in `eas.json`:

1. **Development**: For local testing with development client
   ```bash
   npm run build:dev
   ```

2. **Preview**: For internal testing with stakeholders
   ```bash
   npm run build:preview
   ```

3. **Production**: For app store releases
   ```bash
   npm run build:prod
   # or with additional checks
   npm run build:production
   ```

### Build Configuration

The build configuration is defined in `eas.json`. Key settings include:

- **Android**: Build type (APK or App Bundle), Gradle command
- **iOS**: Resource class, distribution type
- **Environment Variables**: NODE_ENV setting
- **Channel**: For Expo Updates

## Environment Management

### Environment Files

- `config/environment.ts`: Main configuration file
- `config/production.ts`: Production-specific settings
- `config/development.ts`: Development-specific settings

### Environment Variables

For sensitive information, use environment variables:

1. Create a `.env` file based on `.env.example`
2. Add your environment-specific variables
3. Access them in your code through the environment configuration

## Dependency Management

### Checking Dependencies

```bash
# Check for outdated dependencies
npm run deps:check
```

This will show:
- Patch updates (safe to apply)
- Minor updates (may require testing)
- Major updates (may break compatibility)
- Security vulnerabilities

### Updating Dependencies

```bash
# Update all dependencies
npm run deps:update

# Update specific packages
npm install package1@version package2@version
```

### Expo Compatibility

```bash
# Check for Expo compatibility issues
npm run update:check

# Fix Expo compatibility issues
npm run update:fix
```

## Version Management

### Release Process

The app uses semantic versioning (MAJOR.MINOR.PATCH):

```bash
# Release a patch version (1.0.0 -> 1.0.1)
npm run release:patch

# Release a minor version (1.0.0 -> 1.1.0)
npm run release:minor

# Release a major version (1.0.0 -> 2.0.0)
npm run release:major
```

The release script:
1. Bumps version numbers in package.json and app.json
2. Creates a git commit and tag
3. Pushes changes to the remote repository
4. Builds the app for production

### Manual Version Update

If you need to update the version manually:

1. Update the version in `package.json`
2. Update the version in `app.json`
3. Commit the changes
4. Create a git tag: `git tag -a v1.0.1 -m "Release v1.0.1"`
5. Push changes: `git push && git push --tags`

## Deployment

### EAS Submit

After building your app, you can submit it to the app stores:

```bash
# Submit to iOS App Store
eas submit --platform ios --profile production

# Submit to Google Play Store
eas submit --platform android --profile production
```

### Expo Updates

The app is configured to use Expo Updates for over-the-air updates:

1. Make changes to your app
2. Test thoroughly
3. Run: `eas update --channel production`

This allows you to push updates without requiring a new app store submission.

### Code Signing for Updates

The app uses code signing to secure over-the-air updates. This ensures that only authorized updates are installed on users' devices.

#### Managing Code Signing

The app includes scripts to manage code signing:

```bash
# Interactive setup menu
npm run codesign:setup

# Configure for local development
npm run codesign:local

# Configure for EAS builds
npm run codesign:eas

# Generate new certificates
npm run codesign:generate
```

#### Code Signing Workflow

1. **Local Development**:
   - Run `npm run codesign:local` to enable code signing for local testing
   - Test updates locally with `expo start --dev-client`

2. **EAS Builds**:
   - Run `npm run codesign:eas` before building with EAS
   - This prevents certificate path errors during the build process

3. **Publishing Updates**:
   - After building and releasing your app, you can publish updates
   - Make sure code signing is properly configured
   - Run `eas update --channel production`

#### Certificate Management

- Certificates are stored in `certs/production/`
- Private keys are stored in `keys/production/`
- These files should be kept secure and not committed to version control
- Back up these files securely - if lost, you won't be able to publish updates

## Troubleshooting

### Common Build Errors

1. **EAS JSON Validation Errors**:
   - Ensure your `eas.json` is valid for your EAS CLI version
   - Remove unsupported fields

2. **Dependency Conflicts**:
   - Run `npm run deps:check` to identify issues
   - Update problematic dependencies

3. **Expo SDK Compatibility**:
   - Run `npm run update:check` to identify issues
   - Fix with `npm run update:fix`

### Debugging Tips

1. **Enable Verbose Logging**:
   ```bash
   eas build --profile production --verbose
   ```

2. **Check Build Logs**:
   - Review build logs in the EAS dashboard
   - Look for specific error messages

3. **Local Testing**:
   - Test with development client before building
   - Use preview builds for stakeholder testing

### Getting Help

If you encounter issues:

1. Check the [Expo documentation](https://docs.expo.dev/)
2. Search the [Expo forums](https://forums.expo.dev/)
3. Review [EAS CLI documentation](https://docs.expo.dev/eas/)
4. Contact Expo support if needed
