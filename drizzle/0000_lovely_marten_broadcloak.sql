CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`baseUrl` text NOT NULL,
	`updatedDate` text NOT NULL,
	`creationDate` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_uuid_unique` ON `users` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `monthly_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`average_cost` real NOT NULL,
	`month` text NOT NULL,
	`number_of_days` integer NOT NULL,
	`predicted_total_cost` real NOT NULL,
	`total_kwh` real NOT NULL,
	`user_id` text NOT NULL,
	`updated_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`uuid`) ON UPDATE no action ON DELETE no action
);
