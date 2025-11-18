CREATE TABLE `daily_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`day_cost` real NOT NULL,
	`peak_cost` real NOT NULL,
	`night_cost` real NOT NULL,
	`day_kwh` real NOT NULL,
	`peak_kwh` real NOT NULL,
	`night_kwh` real NOT NULL,
	`total_cost` real NOT NULL,
	`total_kwh` real NOT NULL,
	`is_peak` integer NOT NULL,
	`user_id` text NOT NULL,
	`updated_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`uuid`) ON UPDATE no action ON DELETE no action
);
