CREATE TABLE IF NOT EXISTS "shipments" (
  "id" uuid PRIMARY KEY NOT NULL,
  "target_warehouse" text NOT NULL,
  "ingredient_id" text NOT NULL,
  "units" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
