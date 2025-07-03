CREATE TABLE "sus_man_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"responsible" text NOT NULL,
	"status" text NOT NULL,
	"progress" integer,
	"site" uuid NOT NULL,
	"relevant" boolean NOT NULL,
	"name" text NOT NULL,
	"description_before" text NOT NULL,
	"description_after" text NOT NULL,
	"target_value_absolut_planned" double precision,
	"target_value_absolut_is" double precision,
	"description_target_value" text,
	"finished_until_planned" timestamp,
	"finished_until_is" timestamp,
	"category" text,
	"costs_planned" integer,
	"costs_is" integer,
	"roi" integer,
	"description_costs" text,
	"avoidance_costs" integer,
	"start_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sus_man_csrdtopics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" text NOT NULL,
	"topic_header" text NOT NULL,
	"summary" text NOT NULL,
	"collected_information" jsonb NOT NULL,
	"is_done" boolean,
	"report" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sus_man_equivalents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"scope" integer NOT NULL,
	"specification1" text DEFAULT '' NOT NULL,
	"specification2" text DEFAULT '' NOT NULL,
	"specification3" text DEFAULT '' NOT NULL,
	"add_name1" text DEFAULT '' NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"source" text DEFAULT '' NOT NULL,
	"jan" double precision,
	"feb" double precision,
	"mar" double precision,
	"apr" double precision,
	"may" double precision,
	"jun" double precision,
	"jul" double precision,
	"aug" double precision,
	"sep" double precision,
	"oct" double precision,
	"nov" double precision,
	"dec" double precision,
	"avg_value" double precision,
	"monthly_values" boolean,
	"parent" uuid,
	"project" uuid,
	"in" text DEFAULT '' NOT NULL,
	"out" text DEFAULT 'kg' NOT NULL,
	"import_ref" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sus_man_facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site" uuid NOT NULL,
	"name" text NOT NULL,
	"manufacturer" text DEFAULT '' NOT NULL,
	"model" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"shutdown_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sus_man_inputs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"scope" integer NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"equivalent" uuid,
	"report" uuid NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"facility" uuid,
	"sum_value" double precision NOT NULL,
	"raw_value" double precision NOT NULL,
	"raw_value_jan" double precision,
	"raw_value_feb" double precision,
	"raw_value_mar" double precision,
	"raw_value_apr" double precision,
	"raw_value_may" double precision,
	"raw_value_jun" double precision,
	"raw_value_jul" double precision,
	"raw_value_aug" double precision,
	"raw_value_sep" double precision,
	"raw_value_oct" double precision,
	"raw_value_nov" double precision,
	"raw_value_dec" double precision,
	"parent" uuid,
	"monthly_values" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sus_man_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"logo_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sus_man_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site" uuid NOT NULL,
	"year" integer NOT NULL,
	"company_name" text DEFAULT '' NOT NULL,
	"company_street" text DEFAULT '' NOT NULL,
	"company_postal" text DEFAULT '' NOT NULL,
	"company_country" text DEFAULT '' NOT NULL,
	"company_city" text DEFAULT '' NOT NULL,
	"company_domain" text DEFAULT '' NOT NULL,
	"contact_name" text DEFAULT '' NOT NULL,
	"contact_telephone" text DEFAULT '' NOT NULL,
	"contact_email" text DEFAULT '' NOT NULL,
	"contact_domain" text DEFAULT '' NOT NULL,
	"count_employees" integer DEFAULT 0 NOT NULL,
	"business_turnover" integer DEFAULT 0 NOT NULL,
	"base_year" integer DEFAULT 1901 NOT NULL,
	"sum_emissions" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sus_man_sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"project" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sus_man_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report" uuid NOT NULL,
	"year" integer NOT NULL,
	"percentage" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sus_man_user_projects" (
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sus_man_actions" ADD CONSTRAINT "sus_man_actions_site_sus_man_sites_id_fk" FOREIGN KEY ("site") REFERENCES "public"."sus_man_sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sus_man_csrdtopics" ADD CONSTRAINT "sus_man_csrdtopics_report_sus_man_reports_id_fk" FOREIGN KEY ("report") REFERENCES "public"."sus_man_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sus_man_equivalents" ADD CONSTRAINT "sus_man_equivalents_parent_sus_man_equivalents_id_fk" FOREIGN KEY ("parent") REFERENCES "public"."sus_man_equivalents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sus_man_equivalents" ADD CONSTRAINT "sus_man_equivalents_project_sus_man_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."sus_man_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sus_man_facilities" ADD CONSTRAINT "sus_man_facilities_site_sus_man_sites_id_fk" FOREIGN KEY ("site") REFERENCES "public"."sus_man_sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sus_man_inputs" ADD CONSTRAINT "sus_man_inputs_equivalent_sus_man_equivalents_id_fk" FOREIGN KEY ("equivalent") REFERENCES "public"."sus_man_equivalents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sus_man_inputs" ADD CONSTRAINT "sus_man_inputs_report_sus_man_reports_id_fk" FOREIGN KEY ("report") REFERENCES "public"."sus_man_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sus_man_inputs" ADD CONSTRAINT "sus_man_inputs_facility_sus_man_facilities_id_fk" FOREIGN KEY ("facility") REFERENCES "public"."sus_man_facilities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sus_man_inputs" ADD CONSTRAINT "sus_man_inputs_parent_sus_man_inputs_id_fk" FOREIGN KEY ("parent") REFERENCES "public"."sus_man_inputs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sus_man_projects" ADD CONSTRAINT "sus_man_projects_logo_id_base_files_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."base_files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sus_man_reports" ADD CONSTRAINT "sus_man_reports_site_sus_man_sites_id_fk" FOREIGN KEY ("site") REFERENCES "public"."sus_man_sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sus_man_sites" ADD CONSTRAINT "sus_man_sites_project_sus_man_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."sus_man_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sus_man_targets" ADD CONSTRAINT "sus_man_targets_report_sus_man_reports_id_fk" FOREIGN KEY ("report") REFERENCES "public"."sus_man_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sus_man_user_projects" ADD CONSTRAINT "sus_man_user_projects_user_id_base_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."base_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sus_man_user_projects" ADD CONSTRAINT "sus_man_user_projects_project_id_sus_man_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."sus_man_projects"("id") ON DELETE cascade ON UPDATE no action;