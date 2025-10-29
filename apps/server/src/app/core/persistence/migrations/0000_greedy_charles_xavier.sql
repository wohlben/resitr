CREATE TABLE `compendium_equipment_fulfillments` (
	`equipment_id` text NOT NULL,
	`fulfills_equipment_id` text NOT NULL,
	`strength` real DEFAULT 1,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`equipment_id`, `fulfills_equipment_id`),
	FOREIGN KEY (`equipment_id`) REFERENCES `compendium_equipment`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fulfills_equipment_id`) REFERENCES `compendium_equipment`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `compendium_equipment` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`description` text,
	`category` text,
	`image_url` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `compendium_equipment_name_unique` ON `compendium_equipment` (`name`);--> statement-breakpoint
CREATE TABLE `compendium_exercise_group_member` (
	`exercise_id` text NOT NULL,
	`group_id` text NOT NULL,
	`added_by` text NOT NULL,
	`added_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`exercise_id`, `group_id`),
	FOREIGN KEY (`exercise_id`) REFERENCES `compendium_exercises`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `compendium_exercise_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
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
CREATE TABLE `compendium_relationships` (
	`id` text PRIMARY KEY NOT NULL,
	`from_exercise_id` text NOT NULL,
	`to_exercise_id` text NOT NULL,
	`relationship_type` text NOT NULL,
	`strength` real,
	`description` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`from_exercise_id`) REFERENCES `compendium_exercises`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_exercise_id`) REFERENCES `compendium_exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_relationship_idx` ON `compendium_relationships` (`from_exercise_id`,`to_exercise_id`,`relationship_type`);--> statement-breakpoint
CREATE TABLE `compendium_exercise_video` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`compendium_exercise_id` text NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`description` text,
	`video_source` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`compendium_exercise_id`) REFERENCES `compendium_exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_video_per_exercise_idx` ON `compendium_exercise_video` (`compendium_exercise_id`,`url`);--> statement-breakpoint
CREATE TABLE `compendium_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`type` text NOT NULL,
	`force` text NOT NULL,
	`primary_muscles` text NOT NULL,
	`secondary_muscles` text NOT NULL,
	`technical_difficulty` text NOT NULL,
	`equipments` text NOT NULL,
	`body_weight_scaling` real DEFAULT 0 NOT NULL,
	`suggested_measurement_paradigms` text,
	`description` text,
	`instructions` text NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`alternative_names` text,
	`author_name` text,
	`author_url` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	`version` integer DEFAULT 1 NOT NULL,
	`parent_exercise_id` text,
	FOREIGN KEY (`parent_exercise_id`) REFERENCES `compendium_exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `compendium_exercises_slug_unique` ON `compendium_exercises` (`slug`);--> statement-breakpoint
CREATE TABLE `compendium_exercises_history` (
	`history_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`operation` text NOT NULL,
	`changed_at` integer DEFAULT (unixepoch()) NOT NULL,
	`id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`type` text NOT NULL,
	`force` text NOT NULL,
	`primary_muscles` text NOT NULL,
	`secondary_muscles` text NOT NULL,
	`technical_difficulty` text NOT NULL,
	`equipments` text NOT NULL,
	`body_weight_scaling` real DEFAULT 0 NOT NULL,
	`suggested_measurement_paradigms` text,
	`description` text,
	`instructions` text NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`alternative_names` text,
	`author_name` text,
	`author_url` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	`version` integer DEFAULT 1 NOT NULL
);
