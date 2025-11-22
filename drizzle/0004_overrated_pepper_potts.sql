CREATE TABLE `tracking_workout_logs` (
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
CREATE TABLE `tracking_workout_log_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_log_id` text NOT NULL,
	`name` text NOT NULL,
	`order_index` integer NOT NULL,
	`type` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`workout_log_id`) REFERENCES `tracking_workout_logs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tracking_workout_log_section_items` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`name` text NOT NULL,
	`order_index` integer NOT NULL,
	`rest_between_sets` integer NOT NULL,
	`completed_at` integer,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `tracking_workout_log_sections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `compendium_exercises`(`template_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tracking_workout_log_sets` (
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
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `tracking_workout_log_section_items`(`id`) ON UPDATE no action ON DELETE cascade
);
