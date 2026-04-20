import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const shipmentsTable = pgTable('shipments', {
  id: uuid('id').primaryKey(),
  targetWarehouse: text('target_warehouse').notNull(),
  ingredientId: text('ingredient_id').notNull(),
  units: integer('units').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
