-- Drop existing tables (SQLite doesn't support DROP COLUMN, so we recreate)
DROP TABLE IF EXISTS `user_workout_log_sets`;--> statement-breakpoint
DROP TABLE IF EXISTS `user_workout_log_section_items`;--> statement-breakpoint
DROP TABLE IF EXISTS `user_workout_log_sections`;--> statement-breakpoint
DROP TABLE IF EXISTS `user_workout_logs`;--> statement-breakpoint

-- Recreate user_workout_logs with sectionIds
CREATE TABLE `user_workout_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`original_workout_id` text,
	`name` text NOT NULL,
	`section_ids` text DEFAULT '[]' NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`original_workout_id`) REFERENCES `compendium_workouts`(`template_id`) ON UPDATE no action ON DELETE set null
);--> statement-breakpoint

-- Recreate user_workout_log_sections with itemIds (no FK, no orderIndex)
CREATE TABLE `user_workout_log_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`item_ids` text DEFAULT '[]' NOT NULL,
	`completed_at` integer,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);--> statement-breakpoint

-- Recreate user_workout_log_section_items with setIds (no FK, no orderIndex)
CREATE TABLE `user_workout_log_section_items` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_id` text NOT NULL,
	`name` text NOT NULL,
	`rest_between_sets` integer NOT NULL,
	`break_after` integer NOT NULL,
	`set_ids` text DEFAULT '[]' NOT NULL,
	`completed_at` integer,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`exercise_id`) REFERENCES `compendium_exercises`(`template_id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint

-- Recreate user_workout_log_sets (no FK, no orderIndex)
CREATE TABLE `user_workout_log_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`target_reps` integer,
	`achieved_reps` integer,
	`target_weight` real,
	`achieved_weight` real,
	`target_time` integer,
	`achieved_time` integer,
	`target_distance` real,
	`achieved_distance` real,
	`completed_at` integer,
	`skipped` integer DEFAULT false,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
