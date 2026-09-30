CREATE TABLE `consultation_slots` (
	`id` text PRIMARY KEY NOT NULL,
	`start_local` text NOT NULL,
	`status` text NOT NULL,
	`name` text,
	`email` text,
	`phone` text,
	`goal` text,
	`created_at` text NOT NULL,
	`requested_at` text,
	`confirmed_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `consultation_slots_start_local_unique` ON `consultation_slots` (`start_local`);--> statement-breakpoint
CREATE INDEX `idx_consultation_slots_status_start` ON `consultation_slots` (`status`,`start_local`);--> statement-breakpoint
ALTER TABLE `student_enrollments` ADD `next_checkin_date` text;--> statement-breakpoint
ALTER TABLE `student_enrollments` ADD `first_plan_due_date` text;