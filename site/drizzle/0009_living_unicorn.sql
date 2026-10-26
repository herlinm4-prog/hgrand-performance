CREATE TABLE `enrollment_offers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`plan` text NOT NULL,
	`details` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`start_date` text,
	`terms` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`responded_at` text,
	`responded_by` text,
	`signed_name` text
);
--> statement-breakpoint
CREATE INDEX `idx_enrollment_offers_email_created` ON `enrollment_offers` (`email`,`created_at`);