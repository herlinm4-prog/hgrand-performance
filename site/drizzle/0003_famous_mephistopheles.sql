CREATE TABLE `student_payments` (
	`session_id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`plan` text NOT NULL,
	`amount_cents` text NOT NULL,
	`currency` text NOT NULL,
	`paid_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_student_payments_student_paid` ON `student_payments` (`student_id`,`paid_at`);