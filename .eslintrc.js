module.exports = {
  parser: 'babel-eslint',
  extends: ['standard', 'standard-react'],
  rules: {
    'comma-dangle': 0,
    'space-before-function-paren': 0,
    camelcase: 0,
    curly: 0,
    'import/no-unresolved': [2, { commonjs: true }],
    'import/named': 2,
    'jsx-quotes': ['error', 'prefer-double'],
  }
}
