import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'position', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'products',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'code', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'price', type: 'number' },
        { name: 'photo', type: 'string', isOptional: true },
        { name: 'unit', type: 'string', isOptional: true },
        { name: 'category_id', type: 'string', isIndexed: true },
      ],
    }),
    // and so on
  ],
});
