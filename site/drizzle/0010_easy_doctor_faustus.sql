ALTER TABLE `checkout_orders` ADD `offer_id` text;--> statement-breakpoint
CREATE INDEX `idx_orders_offer` ON `checkout_orders` (`offer_id`);--> statement-breakpoint
ALTER TABLE `enrollment_offers` ADD `payment_status` text DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE `enrollment_offers` ADD `paid_at` text;--> statement-breakpoint
ALTER TABLE `enrollment_offers` ADD `sent_at` text;