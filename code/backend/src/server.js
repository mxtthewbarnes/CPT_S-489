import app from './app.js';
import { config } from './config.js';
import { syncDatabase } from './models/index.js';

async function start() {
  await syncDatabase();

  app.listen(config.port, () => {
    console.log(`Campus Closet backend listening on http://localhost:${config.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start the backend:', error);
  process.exit(1);
});
