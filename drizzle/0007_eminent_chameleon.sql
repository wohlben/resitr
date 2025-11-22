ALTER TABLE `compendium_workout_schedules` RENAME TO `user_workout_schedules`;--> statement-breakpoint
ALTER TABLE `user_workout_schedules` RENAME COLUMN "created_by" TO "user_id";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_workout_schedules` (
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
INSERT INTO `__new_user_workout_schedules`("id", "user_id", "workout_template_id", "day_of_week", "order", "created_at", "updated_at") SELECT "id", "user_id", "workout_template_id", "day_of_week", "order", "created_at", "updated_at" FROM `user_workout_schedules`;--> statement-breakpoint
DROP TABLE `user_workout_schedules`;--> statement-breakpoint
ALTER TABLE `__new_user_workout_schedules` RENAME TO `user_workout_schedules`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `user_workout_schedules_user_id_idx` ON `user_workout_schedules` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_workout_schedules_user_day_idx` ON `user_workout_schedules` (`user_id`,`day_of_week`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_workout_schedules_user_workout_unique` ON `user_workout_schedules` (`user_id`,`workout_template_id`);