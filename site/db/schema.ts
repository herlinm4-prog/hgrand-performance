import {sqliteTable,text,index,integer,uniqueIndex} from 'drizzle-orm/sqlite-core';
export const studentProfiles=sqliteTable('student_profiles',{
 userId:text('user_id').primaryKey(),
 name:text('name').notNull(),
 phone:text('phone').notNull(),
 selectedPlan:text('selected_plan',{enum:['online','presencial']}).notNull(),
 createdAt:text('created_at').notNull(),
 updatedAt:text('updated_at').notNull(),
});
export const studentEnrollments=sqliteTable('student_enrollments',{
 email:text('email').primaryKey(),userId:text('user_id').unique(),name:text('name').notNull(),phone:text('phone').notNull(),plan:text('plan').notNull(),status:text('status').notNull(),billing:text('billing').notNull(),durationWeeks:integer('duration_weeks').notNull().default(4),sessionsPerWeek:integer('sessions_per_week').notNull().default(3),startDate:text('start_date'),nextPaymentDate:text('next_payment_date'),nextCheckinDate:text('next_checkin_date'),firstPlanDueDate:text('first_plan_due_date'),notes:text('notes').notNull(),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
});
export const enrollmentOffers=sqliteTable('enrollment_offers',{
 id:text('id').primaryKey(),email:text('email').notNull(),name:text('name').notNull(),plan:text('plan').notNull(),details:text('details').notNull(),amountCents:integer('amount_cents').notNull(),durationWeeks:integer('duration_weeks').notNull().default(4),sessionsPerWeek:integer('sessions_per_week').notNull().default(3),pricingMode:text('pricing_mode').notNull().default('custom'),startDate:text('start_date'),terms:text('terms').notNull(),status:text('status').notNull(),createdAt:text('created_at').notNull(),respondedAt:text('responded_at'),respondedBy:text('responded_by'),signedName:text('signed_name'),paymentStatus:text('payment_status').notNull().default('unpaid'),paidAt:text('paid_at'),sentAt:text('sent_at'),
},table=>[index('idx_enrollment_offers_email_created').on(table.email,table.createdAt)]);
export const consultationSlots=sqliteTable('consultation_slots',{
 id:text('id').primaryKey(),startLocal:text('start_local').notNull().unique(),status:text('status').notNull(),name:text('name'),email:text('email'),phone:text('phone'),goal:text('goal'),createdAt:text('created_at').notNull(),requestedAt:text('requested_at'),confirmedAt:text('confirmed_at'),
},table=>[index('idx_consultation_slots_status_start').on(table.status,table.startLocal)]);
export const studentFiles=sqliteTable('student_files',{
 id:text('id').primaryKey(),studentId:text('student_id').notNull(),uploaderId:text('uploader_id').notNull(),kind:text('kind').notNull(),label:text('label').notNull(),filename:text('filename').notNull(),mime:text('mime').notNull(),objectKey:text('object_key').notNull(),createdAt:text('created_at').notNull(),
},table=>[index('idx_student_files_student_created').on(table.studentId,table.createdAt)]);
export const studentMessages=sqliteTable('student_messages',{
 id:text('id').primaryKey(),studentId:text('student_id').notNull(),senderId:text('sender_id').notNull(),body:text('body').notNull(),createdAt:text('created_at').notNull(),
},table=>[index('idx_student_messages_student_created').on(table.studentId,table.createdAt)]);

// Retain the existing payment table when generating additive migrations.
export const studentPayments=sqliteTable('student_payments',{
 sessionId:text('session_id').primaryKey().notNull(),studentId:text('student_id').notNull(),plan:text('plan').notNull(),amountCents:text('amount_cents').notNull(),currency:text('currency').notNull(),paidAt:text('paid_at').notNull(),
},table=>[index('idx_student_payments_student_paid').on(table.studentId,table.paidAt)]);
export const siteSettings=sqliteTable('site_settings',{id:text('id').primaryKey(),value:text('value').notNull(),updatedAt:text('updated_at').notNull()});
export const discountCodes=sqliteTable('discount_codes',{
 code:text('code').primaryKey(),kind:text('kind').notNull(),value:integer('value').notNull(),plan:text('plan').notNull(),startsAt:text('starts_at').notNull(),expiresAt:text('expires_at').notNull(),maxUses:integer('max_uses').notNull(),active:integer('active').notNull(),
});
export const checkoutOrders=sqliteTable('checkout_orders',{
 id:text('id').primaryKey(),studentId:text('student_id').notNull(),plan:text('plan').notNull(),mode:text('mode').notNull(),status:text('status').notNull(),amountCents:integer('amount_cents').notNull(),baseCents:integer('base_cents').notNull(),discountCode:text('discount_code').notNull(),launch:integer('launch').notNull(),sessionId:text('session_id'),terms:text('terms').notNull(),createdAt:text('created_at').notNull(),paidAt:text('paid_at'),customRequestId:text('custom_request_id'),offerId:text('offer_id'),
},table=>[index('idx_orders_status_plan').on(table.status,table.plan),index('idx_orders_discount').on(table.discountCode),index('idx_orders_custom_request').on(table.customRequestId),index('idx_orders_offer').on(table.offerId)]);
export const publicShowcase=sqliteTable('public_showcase',{
 id:text('id').primaryKey(),name:text('name').notNull(),quote:text('quote').notNull(),caption:text('caption').notNull(),hasImage:integer('has_image').notNull(),objectKey:text('object_key').notNull(),published:integer('published').notNull(),consent:integer('consent').notNull(),createdAt:text('created_at').notNull(),
});
export const customPlanRequests=sqliteTable('custom_plan_requests',{
 id:text('id').primaryKey(),studentId:text('student_id').notNull(),name:text('name').notNull(),email:text('email').notNull(),phone:text('phone').notNull(),days:text('days').notNull(),durationMinutes:integer('duration_minutes').notNull(),preferredTime:text('preferred_time').notNull(),gym:text('gym').notNull(),notes:text('notes').notNull(),status:text('status').notNull(),coachNote:text('coach_note').notNull(),quotedCents:integer('quoted_cents'),couponStatus:text('coupon_status').notNull().default('none'),couponCode:text('coupon_code'),couponDiscountCents:integer('coupon_discount_cents').notNull().default(0),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
},table=>[index('idx_custom_requests_student_created').on(table.studentId,table.createdAt),index('idx_custom_requests_status_created').on(table.status,table.createdAt)]);

// Operational inbox: one row per source/cycle, never a second payment or chat ledger.
export const adminNotifications=sqliteTable('admin_notifications',{
 id:text('id').primaryKey(),sourceVersion:text('source_version').notNull(),category:text('category').notNull(),studentId:text('student_id'),email:text('email'),studentName:text('student_name').notNull(),title:text('title').notNull(),description:text('description').notNull(),priority:integer('priority').notNull(),actionLabel:text('action_label').notNull(),actionUrl:text('action_url').notNull(),occurredAt:text('occurred_at').notNull(),dueDate:text('due_date'),requiresAction:integer('requires_action').notNull(),readAt:text('read_at'),resolvedAt:text('resolved_at'),snoozedUntil:text('snoozed_until'),lastSeenAt:text('last_seen_at').notNull(),
},t=>[index('idx_admin_notifications_status').on(t.resolvedAt,t.priority,t.occurredAt)]);
export const adminNotificationHistory=sqliteTable('admin_notification_history',{
 id:text('id').primaryKey(),notificationId:text('notification_id').notNull(),actorId:text('actor_id').notNull(),action:text('action').notNull(),createdAt:text('created_at').notNull(),
},t=>[index('idx_notification_history_event').on(t.notificationId,t.createdAt)]);
export const studentCheckins=sqliteTable('student_checkins',{
 id:text('id').primaryKey(),studentId:text('student_id').notNull(),scheduledDate:text('scheduled_date').notNull(),weightKg:text('weight_kg').notNull(),bodyFatPercent:text('body_fat_percent'),muscleKg:text('muscle_kg'),waistCm:text('waist_cm'),comments:text('comments').notNull(),createdAt:text('created_at').notNull(),reviewedAt:text('reviewed_at'),reviewedBy:text('reviewed_by'),coachNote:text('coach_note').notNull().default(''),
},t=>[uniqueIndex('idx_checkins_student_date').on(t.studentId,t.scheduledDate)]);
export const adminPushSubscriptions=sqliteTable('admin_push_subscriptions',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),endpoint:text('endpoint').notNull().unique(),p256dh:text('p256dh').notNull(),auth:text('auth').notNull(),createdAt:text('created_at').notNull(),
});
export const adminPushDeliveries=sqliteTable('admin_push_deliveries',{
 id:text('id').primaryKey(),subscriptionId:text('subscription_id').notNull(),createdAt:text('created_at').notNull(),
});
