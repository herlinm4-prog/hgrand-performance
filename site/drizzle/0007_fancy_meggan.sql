ALTER TABLE `custom_plan_requests` ADD `coupon_status` text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `custom_plan_requests` ADD `coupon_code` text;--> statement-breakpoint
ALTER TABLE `custom_plan_requests` ADD `coupon_discount_cents` integer DEFAULT 0 NOT NULL;