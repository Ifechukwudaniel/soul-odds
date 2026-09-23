CREATE TABLE "sin_variant" (
	"id" serial PRIMARY KEY NOT NULL,
	"location" varchar(255) NOT NULL,
	"from_year" integer NOT NULL,
	"to_year" integer NOT NULL,
	"narratives" jsonb NOT NULL,
	"use_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "sin_variant_location_period_idx" ON "sin_variant" USING btree ("location","from_year","to_year");