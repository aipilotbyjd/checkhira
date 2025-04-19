module.exports = function (api) {
  api.cache(true);

  // Define plugins array
  const plugins = [
    'react-native-reanimated/plugin',
    // Environment variables are now handled by Expo's built-in support
    // using EXPO_PUBLIC_ prefix in .env files
  ];

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel'
    ],
    plugins,
  };
};
