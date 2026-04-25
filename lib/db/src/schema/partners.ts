import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const partnersTable = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  description: text("description"),
  industry: text("industry"),
  featured: boolean("featured").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertPartnerSchema = createInsertSchema(partnersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partnersTable.$inferSelect;
