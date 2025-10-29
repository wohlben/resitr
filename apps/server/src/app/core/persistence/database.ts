import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

export const DATABASE = Symbol('DATABASE');

export type Database = LibSQLDatabase<Record<string, never>>;

export const provideDatabase = () => {
  return {
    provide: DATABASE,
    useFactory: (): Database => {
      return drizzle({ connection: { url: 'data/server.db' } });
    },
  };
};

/**
 * Creates a test database provider with an in-memory SQLite database.
 * This is useful for unit tests where you need a fresh database for each test.
 *
 * The in-memory database uses libsql with the ':memory:' URL, which creates
 * a temporary database that exists only for the duration of the connection.
 * Migrations are automatically applied when the database is initialized.
 *
 * @returns A provider object for NestJS dependency injection
 *
 * @example
 * ```typescript
 * const module: TestingModule = await Test.createTestingModule({
 *   providers: [
 *     provideTestDatabase(),
 *     CompendiumEquipmentRepository,
 *   ],
 * }).compile();
 * ```
 */
export const provideTestDatabase = () => {
  return {
    provide: DATABASE,
    useFactory: async (): Promise<Database> => {
      const db = drizzle({
        connection: { url: ':memory:' },
      });

      // Apply migrations to create tables
      await migrate(db, { migrationsFolder: __dirname + '/migrations' });

      return db;
    },
  };
};
