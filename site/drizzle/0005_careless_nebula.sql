CREATE TABLE `custom_plan_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`days` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`preferred_time` text NOT NULL,
	`gym` text NOT NULL,
	`notes` text NOT NULL,
	`status` text NOT NULL,
	`coach_note` text NOT NULL,
	`quoted_cents` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_custom_requests_student_created` ON `custom_plan_requests` (`student_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_custom_requests_status_created` ON `custom_plan_requests` (`status`,`created_at`);