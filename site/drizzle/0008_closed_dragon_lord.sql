CREATE TABLE `student_enrollments` (
	`email` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`plan` text NOT NULL,
	`status` text NOT NULL,
	`billing` text NOT NULL,
	`start_date` text,
	`next_payment_date` text,
	`notes` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `student_enrollments_user_id_unique` ON `student_enrollments` (`user_id`);