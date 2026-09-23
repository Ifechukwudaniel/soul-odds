ALTER TABLE "user" ADD COLUMN "social_claimed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "free_redraws" integer DEFAULT 0 NOT NULL;