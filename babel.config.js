module.exports = function (api) {
  api.cache(true);

  // Define plugins array
  const plugins = [
    'react-native-reanimated/plugin',
    // 'transform-remove-console'
  ];

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel'
    ],
    plugins,
  };
};
