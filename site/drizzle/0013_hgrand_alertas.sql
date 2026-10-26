CREATE TABLE `admin_notification_history` (
	`id` text PRIMARY KEY NOT NULL,
	`notification_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`created_at` text NOT NULL
);

--> statement-breakpoint
CREATE INDEX `idx_notification_history_event` ON `admin_notification_history` (`notification_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `admin_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`source_version` text NOT NULL,
	`category` text NOT NULL,
	`student_id` text,
	`email` text,
	`student_name` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`priority` integer NOT NULL,
	`action_label` text NOT NULL,
	`action_url` text NOT NULL,
	`occurred_at` text NOT NULL,
	`due_date` text,
	`requires_action` integer NOT NULL,
	`read_at` text,
	`resolved_at` text,
	`snoozed_until` text,
	`last_seen_at` text NOT NULL
);

--> statement-breakpoint
CREATE INDEX `idx_admin_notifications_status` ON `admin_notifications` (`resolved_at`,`priority`,`occurred_at`);
--> statement-breakpoint
CREATE TABLE `admin_push_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`subscription_id` text NOT NULL,
	`created_at` text NOT NULL
);

--> statement-breakpoint
CREATE TABLE `admin_push_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`created_at` text NOT NULL
);

--> statement-breakpoint
CREATE UNIQUE INDEX `admin_push_subscriptions_endpoint_unique` ON `admin_push_subscriptions` (`endpoint`);
--> statement-breakpoint
CREATE TABLE `student_checkins` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`scheduled_date` text NOT NULL,
	`weight_kg` text NOT NULL,
	`body_fat_percent` text,
	`muscle_kg` text,
	`waist_cm` text,
	`comments` text NOT NULL,
	`created_at` text NOT NULL,
	`reviewed_at` text,
	`reviewed_by` text,
	`coach_note` text DEFAULT '' NOT NULL
);

--> statement-breakpoint
CREATE UNIQUE INDEX `idx_checkins_student_date` ON `student_checkins` (`student_id`,`scheduled_date`);
