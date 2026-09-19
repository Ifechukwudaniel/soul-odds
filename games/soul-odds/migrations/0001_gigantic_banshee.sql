CREATE TYPE "public"."boost_type" AS ENUM('free', 'paid', 'paid-no-levels');--> statement-breakpoint
CREATE TABLE "boost" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "boost_type" NOT NULL,
	"boost_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"total_per_day" integer,
	"left" integer,
	"last_used" timestamp,
	"level" integer,
	"maximum_level" integer,
	"cost" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"link" varchar(2048) NOT NULL,
	"reward" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" integer PRIMARY KEY NOT NULL,
	"creation_timestamp" timestamp DEFAULT now() NOT NULL,
	"username" varchar(255) NOT NULL,
	"rank" integer DEFAULT 0 NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"touches" integer DEFAULT 0 NOT NULL,
	"wallet" varchar(255),
	"social" jsonb,
	"online" boolean DEFAULT false NOT NULL,
	"last_online" timestamp DEFAULT now() NOT NULL,
	"lang" varchar(16) NOT NULL,
	"first" varchar(255) NOT NULL,
	"last" varchar(255) NOT NULL,
	"refered_by" integer,
	"energy" jsonb NOT NULL,
	"connection_id" varchar(255),
	"total_coins_mined" integer DEFAULT 0 NOT NULL,
	"total_refered" integer DEFAULT 0 NOT NULL,
	"total_refered_claimed" integer DEFAULT 0 NOT NULL,
	"taskes_completed" integer[] DEFAULT '{}' NOT NULL,
	"last_extra_tap" timestamp,
	"last_refill_tap" timestamp
);
--> statement-breakpoint
ALTER TABLE "boost" ADD CONSTRAINT "boost_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;