module.exports = function (api) {
  api.cache.never();
  const isTest = process.env.NODE_ENV === 'test';
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      ...(isTest ? [] : ["nativewind/babel"]),
    ],
    plugins: [
      "react-native-reanimated/plugin",
    ],
  };
};
