import { start } from './server/index.js';

start().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
