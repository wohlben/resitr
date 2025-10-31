PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_compendium_exercises` (
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
INSERT INTO `__new_compendium_exercises`("template_id", "name", "type", "force", "primary_muscles", "secondary_muscles", "technical_difficulty", "equipment_ids", "body_weight_scaling", "suggested_measurement_paradigms", "description", "instructions", "images", "alternative_names", "author_name", "author_url", "created_by", "created_at", "updated_at", "version") SELECT "template_id", "name", "type", "force", "primary_muscles", "secondary_muscles", "technical_difficulty", "equipment_ids", "body_weight_scaling", "suggested_measurement_paradigms", "description", "instructions", "images", "alternative_names", "author_name", "author_url", "created_by", "created_at", "updated_at", "version" FROM `compendium_exercises`;--> statement-breakpoint
DROP TABLE `compendium_exercises`;--> statement-breakpoint
ALTER TABLE `__new_compendium_exercises` RENAME TO `compendium_exercises`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_compendium_exercises_history` (
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
INSERT INTO `__new_compendium_exercises_history`("history_id", "template_id", "name", "type", "force", "primary_muscles", "secondary_muscles", "technical_difficulty", "equipment_ids", "body_weight_scaling", "suggested_measurement_paradigms", "description", "instructions", "images", "alternative_names", "author_name", "author_url", "created_by", "created_at", "updated_at", "version", "operation", "changed_at") SELECT "history_id", "template_id", "name", "type", "force", "primary_muscles", "secondary_muscles", "technical_difficulty", "equipment_ids", "body_weight_scaling", "suggested_measurement_paradigms", "description", "instructions", "images", "alternative_names", "author_name", "author_url", "created_by", "created_at", "updated_at", "version", "operation", "changed_at" FROM `compendium_exercises_history`;--> statement-breakpoint
DROP TABLE `compendium_exercises_history`;--> statement-breakpoint
ALTER TABLE `__new_compendium_exercises_history` RENAME TO `compendium_exercises_history`;