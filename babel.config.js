module.exports = function (api) {
  api.cache(true);
  const plugins = [
    'react-native-reanimated/plugin',
    'module:react-native-dotenv',
    'expo-router/babel',
    'nativewind/babel',
    {
      moduleName: '@env',
      path: '.env',
      blacklist: null,
      whitelist: null,
      safe: false,
      allowUndefined: true,
    },
  ];

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
