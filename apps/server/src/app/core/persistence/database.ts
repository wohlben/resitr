import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';

export const database = drizzle({ connection: { url: 'data/server.db' } });
