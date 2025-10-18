ALTER TABLE `monthly_reports` ADD `total_day_cost` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `monthly_reports` ADD `total_night_cost` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `monthly_reports` ADD `total_night_kwh` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `monthly_reports` ADD `total_day_kwh` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `monthly_reports` ADD `total_peak_kwh` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `monthly_reports` ADD `total_peak_cost` real DEFAULT 0 NOT NULL;