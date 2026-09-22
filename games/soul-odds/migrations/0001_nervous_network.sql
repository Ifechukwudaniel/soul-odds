CREATE TABLE "cliopatria_place" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"from_year" integer NOT NULL,
	"to_year" integer NOT NULL,
	"lat" numeric(9, 6) NOT NULL,
	"lon" numeric(9, 6) NOT NULL
);
