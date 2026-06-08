module.exports = {
  presets: [
    ['module:@react-native/babel-preset'],
    'nativewind/babel',
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          '@theme': './src/theme',
          '@ui': './src/ui',
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@api': './src/api',
          '@context': './src/context',
        },
      },
    ],
    // Reanimated 4.x: the Worklets babel plugin MUST be listed last.
    'react-native-worklets/plugin',
  ],
};
