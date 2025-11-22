ALTER TABLE `tracking_workout_log_sections` ADD `completed_at` integer;--> statement-breakpoint
ALTER TABLE `tracking_workout_log_section_items` ADD `break_after` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `tracking_workout_log_sets` ADD `skipped` integer DEFAULT false;