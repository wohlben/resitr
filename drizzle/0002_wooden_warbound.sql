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
