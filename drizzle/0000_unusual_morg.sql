CREATE TABLE `compendium_equipment_fulfillment` (
	`equipment_template_id` text NOT NULL,
	`fulfills_equipment_template_id` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`equipment_template_id`, `fulfills_equipment_template_id`),
	FOREIGN KEY (`equipment_template_id`) REFERENCES `compendium_equipments`(`template_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fulfills_equipment_template_id`) REFERENCES `compendium_equipments`(`template_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `fulfills_equipment_idx` ON `compendium_equipment_fulfillment` (`fulfills_equipment_template_id`);--> statement-breakpoint
CREATE TABLE `compendium_equipments` (
	`template_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`description` text,
	`category` text,
	`image_url` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `compendium_equipments_name_unique` ON `compendium_equipments` (`name`);--> statement-breakpoint
CREATE TABLE `compendium_exercise_group_members` (
	`exercise_template_id` text NOT NULL,
	`group_id` text NOT NULL,
	`added_by` text NOT NULL,
	`added_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`exercise_template_id`, `group_id`),
	FOREIGN KEY (`exercise_template_id`) REFERENCES `compendium_exercises`(`template_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `compendium_exercise_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `group_id_idx` ON `compendium_exercise_group_members` (`group_id`);--> statement-breakpoint
CREATE TABLE `compendium_exercise_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `compendium_exercise_groups_name_unique` ON `compendium_exercise_groups` (`name`);--> statement-breakpoint
CREATE TABLE `compendium_exercise_relationships` (
	`from_exercise_template_id` text NOT NULL,
	`to_exercise_template_id` text NOT NULL,
	`relationship_type` text NOT NULL,
	`strength` real,
	`description` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`from_exercise_template_id`, `to_exercise_template_id`, `relationship_type`),
	FOREIGN KEY (`from_exercise_template_id`) REFERENCES `compendium_exercises`(`template_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_exercise_template_id`) REFERENCES `compendium_exercises`(`template_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `to_exercise_idx` ON `compendium_exercise_relationships` (`to_exercise_template_id`);--> statement-breakpoint
CREATE TABLE `compendium_exercise_schemes` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_id` text NOT NULL,
	`name` text NOT NULL,
	`measurement_type` text NOT NULL,
	`sets` integer NOT NULL,
	`reps` integer NOT NULL,
	`rest_between_sets` integer NOT NULL,
	`weight` real,
	`time_per_rep` integer,
	`duration` integer,
	`distance` real,
	`target_time` integer,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`exercise_id`) REFERENCES `compendium_exercises`(`template_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `compendium_exercise_videos` (
	`exercise_template_id` text NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`description` text,
	`video_source` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`exercise_template_id`, `url`),
	FOREIGN KEY (`exercise_template_id`) REFERENCES `compendium_exercises`(`template_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `compendium_exercises` (
	`template_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`force` text NOT NULL,
	`primary_muscles` text NOT NULL,
	`secondary_muscles` text NOT NULL,
	`technical_difficulty` text NOT NULL,
	`equipment_ids` text NOT NULL,
	`body_weight_scaling` real NOT NULL,
	`suggested_measurement_paradigms` text,
	`description` text,
	`instructions` text NOT NULL,
	`images` text NOT NULL,
	`alternative_names` text,
	`author_name` text,
	`author_url` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()),
	`version` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `compendium_exercises_history` (
	`history_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`template_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`force` text NOT NULL,
	`primary_muscles` text NOT NULL,
	`secondary_muscles` text NOT NULL,
	`technical_difficulty` text NOT NULL,
	`equipment_ids` text NOT NULL,
	`body_weight_scaling` real NOT NULL,
	`suggested_measurement_paradigms` text,
	`description` text,
	`instructions` text NOT NULL,
	`images` text NOT NULL,
	`alternative_names` text,
	`author_name` text,
	`author_url` text,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`version` integer NOT NULL,
	`operation` text NOT NULL,
	`changed_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `compendium_workout_section_items` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_id` text NOT NULL,
	`break_between_sets` integer NOT NULL,
	`break_after` integer NOT NULL,
	`forked_from` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`exercise_id`) REFERENCES `compendium_exercises`(`template_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `compendium_workout_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`workout_section_item_ids` text DEFAULT '[]' NOT NULL,
	`forked_from` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `compendium_workouts` (
	`template_id` text PRIMARY KEY NOT NULL,
	`workout_lineage_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`section_ids` text DEFAULT '[]' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	`version` integer NOT NULL
);
--> statement-breakpoint
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
);
--> statement-breakpoint
CREATE TABLE `user_workout_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workout_template_id` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`workout_template_id`) REFERENCES `compendium_workouts`(`template_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_workout_schedules_user_id_idx` ON `user_workout_schedules` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_workout_schedules_user_day_idx` ON `user_workout_schedules` (`user_id`,`day_of_week`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_workout_schedules_user_workout_day_unique` ON `user_workout_schedules` (`user_id`,`workout_template_id`,`day_of_week`);--> statement-breakpoint
CREATE TABLE `user_workout_log_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`item_ids` text DEFAULT '[]' NOT NULL,
	`completed_at` integer,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
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
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `user_exercise_schemes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`name` text NOT NULL,
	`measurement_type` text NOT NULL,
	`sets` integer NOT NULL,
	`reps` integer NOT NULL,
	`rest_between_sets` integer NOT NULL,
	`weight` real,
	`time_per_rep` integer,
	`duration` integer,
	`distance` real,
	`target_time` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`exercise_id`) REFERENCES `compendium_exercises`(`template_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_exercise_schemes_user_id_idx` ON `user_exercise_schemes` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_exercise_schemes_exercise_id_idx` ON `user_exercise_schemes` (`exercise_id`);--> statement-breakpoint
CREATE INDEX `user_exercise_schemes_user_exercise_idx` ON `user_exercise_schemes` (`user_id`,`exercise_id`);--> statement-breakpoint
CREATE TABLE `user_exercise_scheme_compendium_workout_section_items` (
	`section_item_id` text NOT NULL,
	`user_workout_id` text NOT NULL,
	`user_exercise_scheme_id` text NOT NULL,
	PRIMARY KEY(`section_item_id`, `user_workout_id`, `user_exercise_scheme_id`),
	FOREIGN KEY (`section_item_id`) REFERENCES `compendium_workout_section_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_workout_id`) REFERENCES `user_workouts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_exercise_scheme_id`) REFERENCES `user_exercise_schemes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_exercise_scheme_compendium_workout_section_items_user_workout_idx` ON `user_exercise_scheme_compendium_workout_section_items` (`user_workout_id`);--> statement-breakpoint
CREATE TABLE `user_workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workout_template_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`workout_template_id`) REFERENCES `compendium_workouts`(`template_id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `user_workouts_user_id_idx` ON `user_workouts` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_workouts_workout_template_id_idx` ON `user_workouts` (`workout_template_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_workouts_user_workout_unique` ON `user_workouts` (`user_id`,`workout_template_id`);