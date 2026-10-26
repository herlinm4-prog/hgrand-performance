CREATE TABLE `checkout_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`plan` text NOT NULL,
	`mode` text NOT NULL,
	`status` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`base_cents` integer NOT NULL,
	`discount_code` text NOT NULL,
	`launch` integer NOT NULL,
	`session_id` text,
	`terms` text NOT NULL,
	`created_at` text NOT NULL,
	`paid_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_orders_status_plan` ON `checkout_orders` (`status`,`plan`);--> statement-breakpoint
CREATE INDEX `idx_orders_discount` ON `checkout_orders` (`discount_code`);--> statement-breakpoint
CREATE TABLE `discount_codes` (
	`code` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`value` integer NOT NULL,
	`plan` text NOT NULL,
	`starts_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`max_uses` integer NOT NULL,
	`active` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `public_showcase` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`quote` text NOT NULL,
	`caption` text NOT NULL,
	`has_image` integer NOT NULL,
	`object_key` text NOT NULL,
	`published` integer NOT NULL,
	`consent` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL
);
