PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_monthly_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`average_cost` real DEFAULT 0 NOT NULL,
	`month` text NOT NULL,
	`number_of_days` integer NOT NULL,
	`predicted_total_cost` real DEFAULT 0 NOT NULL,
	`total_cost` real DEFAULT 0 NOT NULL,
	`total_kwh` real DEFAULT 0 NOT NULL,
	`user_id` text NOT NULL,
	`updated_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`uuid`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_monthly_reports`("id", "average_cost", "month", "number_of_days", "predicted_total_cost", "total_cost", "total_kwh", "user_id", "updated_at", "created_at") SELECT "id", "average_cost", "month", "number_of_days", "predicted_total_cost", "total_cost", "total_kwh", "user_id", "updated_at", "created_at" FROM `monthly_reports`;--> statement-breakpoint
DROP TABLE `monthly_reports`;--> statement-breakpoint
ALTER TABLE `__new_monthly_reports` RENAME TO `monthly_reports`;--> statement-breakpoint
PRAGMA foreign_keys=ON;