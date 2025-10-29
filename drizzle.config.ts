import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './apps/server/src/app/core/persistence/schemas/*',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'data/server.db',
  },
});
