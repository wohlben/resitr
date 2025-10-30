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
	`slug` text NOT NULL,
	`type` text NOT NULL,
	`force` text NOT NULL,
	`primary_muscles` text NOT NULL,
	`secondary_muscles` text NOT NULL,
	`technical_difficulty` text NOT NULL,
	`equipment_ids` text NOT NULL,
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
	FOREIGN KEY (`parent_exercise_id`) REFERENCES `compendium_exercises`(`template_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `compendium_exercises_slug_unique` ON `compendium_exercises` (`slug`);--> statement-breakpoint
CREATE TABLE `compendium_exercises_history` (
	`history_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`operation` text NOT NULL,
	`changed_at` integer DEFAULT (unixepoch()) NOT NULL,
	`template_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`type` text NOT NULL,
	`force` text NOT NULL,
	`primary_muscles` text NOT NULL,
	`secondary_muscles` text NOT NULL,
	`technical_difficulty` text NOT NULL,
	`equipment_ids` text NOT NULL,
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
