module.exports = function (api) {
  api.cache(true);

  // Define plugins array
  const plugins = [
    'react-native-reanimated/plugin',
    // Add support for environment variables
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      blacklist: null,
      whitelist: null,
      safe: true,
      allowUndefined: true,
    }],
  ];

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel'
    ],
    plugins,
  };
};
