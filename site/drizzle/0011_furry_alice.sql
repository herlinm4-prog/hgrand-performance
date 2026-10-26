ALTER TABLE `enrollment_offers` ADD `duration_weeks` integer DEFAULT 4 NOT NULL;--> statement-breakpoint
ALTER TABLE `enrollment_offers` ADD `sessions_per_week` integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `enrollment_offers` ADD `pricing_mode` text DEFAULT 'custom' NOT NULL;--> statement-breakpoint
ALTER TABLE `student_enrollments` ADD `duration_weeks` integer DEFAULT 4 NOT NULL;--> statement-breakpoint
ALTER TABLE `student_enrollments` ADD `sessions_per_week` integer DEFAULT 3 NOT NULL;