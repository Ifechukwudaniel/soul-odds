CREATE TABLE "sin_catalog" (
	"location" varchar(255) PRIMARY KEY NOT NULL,
	"variants" jsonb NOT NULL,
	"use_count" integer DEFAULT 0 NOT NULL
);
