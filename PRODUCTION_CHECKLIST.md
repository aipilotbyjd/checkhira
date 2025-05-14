# Production Deployment Checklist

This checklist helps ensure your CheckHira app is properly configured for production deployment.

## Environment Variables

- [ ] Create a `.env` file based on `.env.example`
- [ ] Fill in all required environment variables
- [ ] Set up EAS secrets for production builds
- [ ] Verify environment variables are properly loaded in the app

## Firebase Configuration

- [ ] Set up Firebase project for production
- [ ] Configure Firebase Analytics
- [ ] Configure Firebase Crashlytics
- [ ] Configure Firebase Performance Monitoring
- [ ] Upload correct `google-services.json` for Android
- [ ] Upload correct `GoogleService-Info.plist` for iOS
- [ ] Verify Firebase services are properly initialized in the app

## AdMob Configuration

- [ ] Create production ad units in AdMob console
- [ ] Update environment variables with production ad unit IDs
- [ ] Configure ad consent form in AdMob console
- [ ] Test ads with test devices
- [ ] Verify ad placements in the app
- [ ] Implement proper ad frequency capping

## Authentication

- [ ] Configure Google Sign-In for production
- [ ] Set up correct OAuth client IDs
- [ ] Test authentication flows
- [ ] Implement proper error handling for authentication

## App Configuration

- [ ] Update app version in `app.json`
- [ ] Configure app icon and splash screen
- [ ] Set up deep linking
- [ ] Configure app permissions
- [ ] Set up Expo Updates
- [ ] Configure code signing for updates

## Performance Optimizations

- [ ] Enable Hermes JavaScript engine
- [ ] Configure Proguard for Android
- [ ] Optimize images
- [ ] Implement code splitting
- [ ] Use memoization for expensive computations
- [ ] Implement lazy loading for screens
- [ ] Optimize network requests with caching

## Error Handling

- [ ] Implement global error boundary
- [ ] Set up error logging to backend
- [ ] Configure Crashlytics for crash reporting
- [ ] Implement offline support
- [ ] Handle network errors gracefully
- [ ] Test error scenarios

## Security

- [ ] Secure API endpoints
- [ ] Implement proper authentication and authorization
- [ ] Secure sensitive data
- [ ] Use HTTPS for all network requests
- [ ] Implement certificate pinning
- [ ] Obfuscate code for Android

## Testing

- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Test on multiple devices
- [ ] Test offline functionality
- [ ] Test error scenarios
- [ ] Test performance
- [ ] Test memory usage

## App Store Submission

- [ ] Prepare App Store screenshots
- [ ] Write App Store description
- [ ] Create privacy policy
- [ ] Create terms of service
- [ ] Set up App Store Connect
- [ ] Configure app pricing and availability
- [ ] Set up in-app purchases (if applicable)
- [ ] Complete App Store Review Information

## Google Play Store Submission

- [ ] Prepare Play Store screenshots
- [ ] Write Play Store description
- [ ] Create privacy policy
- [ ] Create terms of service
- [ ] Set up Google Play Console
- [ ] Configure app pricing and availability
- [ ] Set up in-app purchases (if applicable)
- [ ] Complete Play Store content rating questionnaire

## Final Checks

- [ ] Verify all environment variables are set
- [ ] Verify all services are properly initialized
- [ ] Test the app on real devices
- [ ] Check for console errors
- [ ] Verify analytics events are being tracked
- [ ] Verify crash reporting is working
- [ ] Check app performance
- [ ] Verify offline functionality
- [ ] Test deep links
- [ ] Verify push notifications

## Post-Launch

- [ ] Monitor crash reports
- [ ] Monitor user feedback
- [ ] Monitor analytics
- [ ] Prepare for updates
- [ ] Set up monitoring for backend services
- [ ] Create a rollback plan
