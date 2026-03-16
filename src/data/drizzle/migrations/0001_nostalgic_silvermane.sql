-- Migrate users table: add missing fields, make organization_id optional
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_organization_id_organizations_id_fk";
ALTER TABLE "users" ALTER COLUMN "organization_id" DROP NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk"
  FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "users" RENAME COLUMN "nombre" TO "name";
ALTER TABLE "users" ADD COLUMN "email_validated" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN "role" varchar(50) DEFAULT 'USER_ROLE' NOT NULL;
ALTER TABLE "users" ADD COLUMN "img" varchar(500);