module.exports = {
  extends: ['next/core-web-vitals'],
  plugins: ['custom-rules'],
  rules: {
    'custom-rules/no-edge-runtime': 'error'
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')]
    }
  }
} 