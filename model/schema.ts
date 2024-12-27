import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'payments',
      columns: [
        { name: 'description', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'notes', type: 'string' },
        { name: 'source', type: 'string' },
        { name: 'date', type: 'number' },
      ],
    }),
  ],
});
