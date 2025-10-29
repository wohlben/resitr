import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import * as path from 'path';

export default defineConfig({
  out: './drizzle/migrations',
  schema: './apps/server/src/app/core/persistence/schemas/*',
  dialect: 'sqlite',
  dbCredentials: {
    url: `file:${path.resolve(process.cwd(), 'data', 'server.db')}`,
  },
});
