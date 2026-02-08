CREATE TABLE `workout_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`user_workout_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_workout_id`) REFERENCES `user_workouts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `workout_schedules_user_id_idx` ON `workout_schedules` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `workout_schedules_user_workout_unique` ON `workout_schedules` (`user_id`,`user_workout_id`);--> statement-breakpoint
CREATE TABLE `workout_schedule_criteria` (
	`id` text PRIMARY KEY NOT NULL,
	`schedule_id` text NOT NULL,
	`type` text NOT NULL,
	`order` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`schedule_id`) REFERENCES `workout_schedules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `workout_schedule_criteria_schedule_id_idx` ON `workout_schedule_criteria` (`schedule_id`);--> statement-breakpoint
CREATE INDEX `workout_schedule_criteria_type_idx` ON `workout_schedule_criteria` (`type`);--> statement-breakpoint
CREATE TABLE `workout_schedule_criteria_day_of_week` (
	`criteria_id` text NOT NULL,
	`day_of_week` integer NOT NULL,
	PRIMARY KEY(`criteria_id`, `day_of_week`),
	FOREIGN KEY (`criteria_id`) REFERENCES `workout_schedule_criteria`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `workout_schedule_criteria_dow_criteria_idx` ON `workout_schedule_criteria_day_of_week` (`criteria_id`);
