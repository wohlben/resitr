CREATE TABLE `compendium_workout_schedules` (
	`workout_template_id` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`workout_template_id`, `day_of_week`),
	FOREIGN KEY (`workout_template_id`) REFERENCES `compendium_workouts`(`template_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `compendium_workout_section_items` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`exercise_scheme_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`break_between_sets` integer NOT NULL,
	`break_after` integer NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `compendium_workout_sections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_scheme_id`) REFERENCES `compendium_exercise_schemes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `compendium_workout_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_template_id` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`order_index` integer NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`workout_template_id`) REFERENCES `compendium_workouts`(`template_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `compendium_workouts` (
	`template_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	`version` integer NOT NULL
);
