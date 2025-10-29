import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './apps/server/src/app/core/persistence/migrations',
  schema: './apps/server/src/app/core/persistence/schemas/*',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'data/server.db',
  },
});
