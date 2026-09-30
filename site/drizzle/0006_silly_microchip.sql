ALTER TABLE `checkout_orders` ADD `custom_request_id` text;--> statement-breakpoint
CREATE INDEX `idx_orders_custom_request` ON `checkout_orders` (`custom_request_id`);