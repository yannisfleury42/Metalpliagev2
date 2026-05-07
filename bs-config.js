module.exports = {
  proxy: 'localhost:3000',
  port: 3001,
  open: true,
  files: [
    '*.html',
    'css/*.css',
    'js/*.js'
  ],
  ignore: [
    'node_modules',
    'server.js',
    'package.json',
    'package-lock.json',
    '.env'
  ],
  reloadDelay: 300,
  reloadDebounce: 500
};
