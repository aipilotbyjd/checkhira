import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import migrations from './migrations';

const adapter = new SQLiteAdapter({
  dbName: 'hirabook',
  schema,
  migrations,
  jsi: true /* Platform.OS === 'ios' */,
  onSetUpError: (error) => {
    console.log(error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [],
});
