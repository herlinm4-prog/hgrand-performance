CREATE TABLE `student_files` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`uploader_id` text NOT NULL,
	`kind` text NOT NULL,
	`label` text NOT NULL,
	`filename` text NOT NULL,
	`mime` text NOT NULL,
	`object_key` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `student_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL
);
