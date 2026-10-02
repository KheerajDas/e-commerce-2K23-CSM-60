const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`E-Commerce Sprint 2 API running on http://localhost:${env.port}`);
});
