import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { sql } from 'drizzle-orm';
import { workspaceRoot } from '@nx/devkit';
import * as path from 'path';
import * as fs from 'fs';
import * as schema from './schemas';

export const DATABASE = Symbol('DATABASE');

export type Database = LibSQLDatabase<typeof schema>;

export const provideDatabase = () => {
  return {
    provide: DATABASE,
    useFactory: async () => {
      const dbPath = path.join(workspaceRoot, 'data', 'server.db');

      return drizzle({
        connection: { url: `file:${dbPath}` },
        schema,
      });
    },
  };
};

async function applyTriggers(db: Database) {
  const triggersDir = path.join(
    workspaceRoot,
    'apps/server/src/app/core/persistence/triggers'
  );

  if (!fs.existsSync(triggersDir)) {
    return;
  }

  const triggerFiles = fs
    .readdirSync(triggersDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of triggerFiles) {
    const filePath = path.join(triggersDir, file);
    const triggerSql = fs.readFileSync(filePath, 'utf-8');
    await db.run(sql.raw(triggerSql));
  }
}

export const provideTestDatabase = () => {
  return {
    provide: DATABASE,
    useFactory: async (): Promise<Database> => {
      const db = drizzle({
        connection: { url: ':memory:' },
        schema,
      });

      const migrationsPath = path.join(workspaceRoot, 'drizzle');
      await migrate(db, { migrationsFolder: migrationsPath });
      await applyTriggers(db);
      return db;
    },
  };
};
