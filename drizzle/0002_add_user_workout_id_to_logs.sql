ALTER TABLE `user_workout_logs` ADD COLUMN `user_workout_id` text NOT NULL DEFAULT '' REFERENCES `user_workouts`(`id`) ON DELETE cascade;
