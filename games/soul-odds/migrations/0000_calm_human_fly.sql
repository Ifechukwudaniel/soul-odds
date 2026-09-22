CREATE TYPE "public"."boost_type" AS ENUM('paid', 'paid-no-levels');--> statement-breakpoint
CREATE TABLE "boost" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "boost_type" NOT NULL,
	"boost_id" integer NOT NULL,
	"user_address" varchar(42) NOT NULL,
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
	"address" varchar(42) PRIMARY KEY NOT NULL,
	"username" varchar(255),
	"referred_by" varchar(42),
	"rank" integer DEFAULT 0 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"balance" numeric(20, 2) DEFAULT 0 NOT NULL,
	"total_profit" numeric(20, 2) DEFAULT 0 NOT NULL,
	"tasks_completed" integer[] DEFAULT '{}' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "boost" ADD CONSTRAINT "boost_user_address_user_address_fk" FOREIGN KEY ("user_address") REFERENCES "public"."user"("address") ON DELETE no action ON UPDATE no action;