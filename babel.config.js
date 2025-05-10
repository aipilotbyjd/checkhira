module.exports = function (api) {
  api.cache(true);

  // Define plugins array
  const plugins = [
    'react-native-reanimated/plugin',
  ];

  // Add 'transform-remove-console' only in production
  if (api.env('production')) {
    plugins.push('transform-remove-console');
  }

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel'
    ],
    plugins,
  };
};
