# Checkhira

A mobile application for managing work entries and payments.

## Features

- User authentication (email, phone, Google)
- Work entry management
- Payment tracking
- Offline support
- Multi-language support
- Push notifications

## Tech Stack

- React Native
- Expo SDK 52
- TypeScript
- NativeWind (TailwindCSS)
- Expo Router
- OneSignal for push notifications

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v10 or higher)
- Expo CLI

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/checkhira.git
   cd checkhira
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Environment Setup

The app uses different environment configurations based on the build profile:

- Development: `npm start` or `npm run ios`/`npm run android`
- Preview: `npm run build:preview`
- Production: `npm run build:prod`

## Building for Production

### Android

```bash
npm run build:prod
```

### iOS

```bash
npm run build:prod
```

## Deployment

The app uses EAS (Expo Application Services) for building and deploying:

- Development: `npm run build:dev`
- Preview: `npm run build:preview`
- Production: `npm run build:prod`

## Code Signing for Updates

The app uses code signing for Expo Updates to ensure security. The following scripts are available to manage code signing:

- `npm run codesign:setup` - Interactive menu for code signing setup
- `npm run codesign:generate` - Generate new code signing certificates
- `npm run codesign:local` - Configure app.json for local development with code signing
- `npm run codesign:eas` - Configure app.json for EAS builds (disables code signing)

### Important Notes

- Code signing certificates are stored in `certs/production/`
- Private keys are stored in `keys/production/`
- These files should not be committed to version control
- Before building with EAS, run `npm run codesign:eas` to avoid certificate path errors
- For local development with updates, run `npm run codesign:local`

## Project Structure

```
checkhira/
├── app/                  # Expo Router app directory
│   ├── (tabs)/           # Tab navigation
│   ├── auth/             # Authentication screens
│   ├── _layout.tsx       # Root layout
│   └── ...
├── assets/               # Static assets
├── components/           # Reusable components
├── config/               # Configuration files
├── constants/            # Constants and theme
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── services/             # API and other services
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── app.json              # Expo configuration
├── eas.json              # EAS configuration
└── package.json          # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [NativeWind](https://www.nativewind.dev/)
