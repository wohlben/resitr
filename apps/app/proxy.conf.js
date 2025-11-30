module.exports = {
  '/api': {
    target: 'http://localhost:3000',
    secure: false,
    changeOrigin: true,
    headers: {
      'x-user-id': 'dev-user-123',
    },
  },
};
