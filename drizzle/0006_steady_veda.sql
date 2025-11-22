ALTER TABLE `tracking_workout_logs` RENAME TO `user_workout_logs`;--> statement-breakpoint
ALTER TABLE `tracking_workout_log_sections` RENAME TO `user_workout_log_sections`;--> statement-breakpoint
ALTER TABLE `tracking_workout_log_section_items` RENAME TO `user_workout_log_section_items`;--> statement-breakpoint
ALTER TABLE `tracking_workout_log_sets` RENAME TO `user_workout_log_sets`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_workout_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`original_workout_id` text,
	`name` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`duration` integer,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`original_workout_id`) REFERENCES `compendium_workouts`(`template_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_user_workout_logs`("id", "original_workout_id", "name", "started_at", "completed_at", "duration", "created_by", "created_at", "updated_at") SELECT "id", "original_workout_id", "name", "started_at", "completed_at", "duration", "created_by", "created_at", "updated_at" FROM `user_workout_logs`;--> statement-breakpoint
DROP TABLE `user_workout_logs`;--> statement-breakpoint
ALTER TABLE `__new_user_workout_logs` RENAME TO `user_workout_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_user_workout_log_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_log_id` text NOT NULL,
	`name` text NOT NULL,
	`order_index` integer NOT NULL,
	`type` text NOT NULL,
	`completed_at` integer,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`workout_log_id`) REFERENCES `user_workout_logs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_workout_log_sections`("id", "workout_log_id", "name", "order_index", "type", "completed_at", "created_by", "created_at") SELECT "id", "workout_log_id", "name", "order_index", "type", "completed_at", "created_by", "created_at" FROM `user_workout_log_sections`;--> statement-breakpoint
DROP TABLE `user_workout_log_sections`;--> statement-breakpoint
ALTER TABLE `__new_user_workout_log_sections` RENAME TO `user_workout_log_sections`;--> statement-breakpoint
CREATE TABLE `__new_user_workout_log_section_items` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`name` text NOT NULL,
	`order_index` integer NOT NULL,
	`rest_between_sets` integer NOT NULL,
	`break_after` integer NOT NULL,
	`completed_at` integer,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `user_workout_log_sections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `compendium_exercises`(`template_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_workout_log_section_items`("id", "section_id", "exercise_id", "name", "order_index", "rest_between_sets", "break_after", "completed_at", "created_by", "created_at") SELECT "id", "section_id", "exercise_id", "name", "order_index", "rest_between_sets", "break_after", "completed_at", "created_by", "created_at" FROM `user_workout_log_section_items`;--> statement-breakpoint
DROP TABLE `user_workout_log_section_items`;--> statement-breakpoint
ALTER TABLE `__new_user_workout_log_section_items` RENAME TO `user_workout_log_section_items`;--> statement-breakpoint
CREATE TABLE `__new_user_workout_log_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`order_index` integer NOT NULL,
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
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `user_workout_log_section_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_workout_log_sets`("id", "item_id", "order_index", "target_reps", "achieved_reps", "target_weight", "achieved_weight", "target_time", "achieved_time", "target_distance", "achieved_distance", "completed_at", "skipped", "created_by", "created_at") SELECT "id", "item_id", "order_index", "target_reps", "achieved_reps", "target_weight", "achieved_weight", "target_time", "achieved_time", "target_distance", "achieved_distance", "completed_at", "skipped", "created_by", "created_at" FROM `user_workout_log_sets`;--> statement-breakpoint
DROP TABLE `user_workout_log_sets`;--> statement-breakpoint
ALTER TABLE `__new_user_workout_log_sets` RENAME TO `user_workout_log_sets`;