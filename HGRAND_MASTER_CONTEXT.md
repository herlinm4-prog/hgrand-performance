# HGrand Fitness & Performance — Master Context

Updated: 2026-09-24

This file is the source of truth for ChatGPT/Work/backend implementation. Read it before making changes to HGrand.

## Non-negotiable project constraints

- Public brand/domain: HGrand Fitness & Performance / hgrandperformance.com.
- Preserve the approved public-site design. Do not redesign the website as part of the Stripe/backend work.
- Stripe is the payment processor. Payment UI should use Stripe-hosted Checkout and support the wallet/payment methods Stripe makes available to the customer/device (Apple Pay / Google Pay / card, etc.).
- The website owns plan configuration and selection logic. Stripe must NOT be trusted to calculate business rules from arbitrary client input.
- The browser must never submit a raw amount that the server blindly charges. The backend receives a validated plan/variant identifier and resolves the authoritative amount/Stripe Price server-side.
- Billing cycles are exactly 4 weeks / 28 days, not calendar months.
- The launch/promotional price applies only to the FIRST 4-week cycle. Starting with cycle 2, charge the regular recurring price.
- Never activate student access merely because the user reaches a success page. Access becomes active only after server-side payment confirmation/webhook verification.

## Required customer flow

1. Visitor chooses a plan on HGrand.
2. Before Stripe Checkout, HGrand performs all plan configuration.
3. Customer creates an account or logs in and supplies the identity/contact data required by HGrand (at minimum name/email; phone/profile data as required by onboarding).
4. HGrand displays a final review showing the selected plan, first-cycle promotional charge, regular recurring charge beginning with cycle 2, billing frequency (every 4 weeks), and relevant terms.
5. Backend validates the selected plan/variant and creates the Stripe Checkout Session using server-side authoritative pricing.
6. Stripe handles payment credentials/wallet/card data.
7. Webhook/payment verification updates the HGrand account/subscription state.
8. Only after confirmed payment does the student receive active access to the private student area.

## Online plan

Regular economic rate: $85/week.
Billing implementation: $340 every 4 weeks (28 days).
Launch offer applies only to the first 4-week cycle. Previously approved launch price: $289 for the first 4 weeks / first 5 enrollments. Do not silently change this amount; if current commercial copy differs, surface the conflict before production billing.
Cycle 2 onward: $340 every 4 weeks.

## In-person plan — selection happens BEFORE Stripe Checkout

The public site should present ONE in-person plan. When selected, the customer chooses the number of in-person sessions per week:

- 1 session/week
- 2 sessions/week
- 3 sessions/week
- 4 sessions/week
- 5 sessions/week

Base in-person session rate: $50 per session.

### Coaching fee rule

For fewer than 3 in-person sessions/week (1x or 2x), add the Online Coaching component of $85/week. This covers the nutrition plan, training plan, supplementation plan and coaching/follow-up work that would otherwise make a low-frequency in-person package commercially unsustainable.

For 3, 4 or 5 in-person sessions/week, there is NO separate $85/week coaching fee; the coaching component is included in the in-person package price.

### Regular recurring prices, billed every 4 weeks

| In-person frequency | Session calculation | Coaching component | Regular charge every 4 weeks |
|---|---:|---:|---:|
| 1x/week | 4 sessions x $50 = $200 | $85 x 4 = $340 | $540 |
| 2x/week | 8 sessions x $50 = $400 | $85 x 4 = $340 | $740 |
| 3x/week | 12 sessions x $50 = $600 | Included | $600 |
| 4x/week | 16 sessions x $50 = $800 | Included | $800 |
| 5x/week | 20 sessions x $50 = $1,000 | Included | $1,000 |

These are 28-day/four-week cycles, not calendar-month calculations.

## Promotional first cycle for in-person

The first 4-week cycle is promotional; cycle 2 onward uses the regular table above.

Historical approved launch offer for the original 3x/week package: $480 for the first 4 weeks / 12 sessions (regular $600), originally limited to the first 5 enrollments.

Promotional first-cycle prices for 1x, 2x, 4x and 5x/week have NOT yet been finalized. Do not invent them. Backend/data model must support a distinct first-cycle price per variant so these can be entered later without restructuring checkout.

## Stripe/backend architecture

Model each purchasable variant with an internal immutable key, e.g. ONLINE, INPERSON_1X, INPERSON_2X, INPERSON_3X, INPERSON_4X, INPERSON_5X.

For each variant store server-side:
- display label
- sessions/week (nullable for Online)
- first-cycle promotional amount/Stripe Price
- regular recurring amount/Stripe Price
- recurrence = every 4 weeks
- whether coaching fee is included or separately represented for display
- active/available flag

The frontend sends only the selected variant key. The backend maps that key to approved Stripe objects/amounts. Do not accept client-supplied dollar amounts.

Checkout should associate the Stripe Customer/Session with the HGrand user identity and internal student/user ID using the appropriate customer reference/metadata. Do not store card numbers or wallet credentials in HGrand.

Implement signed Stripe webhook handling and idempotent processing for the events needed to maintain subscription/payment state. At minimum, HGrand needs reliable states for pending, active, past-due/payment-failed, cancelled/ended, and any state required by the final Stripe subscription implementation.

The first-cycle promotion must transition automatically to the regular recurring price beginning with cycle 2. Implement this with Stripe-supported subscription/price scheduling logic rather than trusting the frontend to return and change the price later.

## Student account integration

Private student area is separate from `/admin` CMS. Student access should be identity-checked server-side. The intended student area includes private PDFs (nutrition/training plans), progress photos/uploads, check-in information and private communication/chat with Herlin.

Checkout/payment state must be linked to the student account so successful payment can activate the correct entitlement without manual matching.

## QR / in-person payment requirement

HGrand should be able to expose a QR entry point for a selected checkout/payment flow. The QR should open the appropriate HGrand/Stripe payment flow on the customer's phone. The business preference is Apple Pay first when available, Google Pay when available, with card as fallback. Do not create a separate insecure payment path just for QR.

## CMS/admin

`/admin` remains reserved for Herlin/CMS administration. Pricing/content management should not permit arbitrary browser-side price manipulation. Any CMS price changes that affect billing must map to controlled server-side Stripe configuration.

## Work implementation directive

Work should treat this document as the shared master context. Before modifying checkout, Stripe, authentication, student entitlements, pricing, or backend data models, read this file and reconcile the current implementation against it. If code or older documentation conflicts with this file, do not silently choose one: preserve production safety and flag the conflict before charging real customers.

Current immediate backend objective: implement the pre-Checkout in-person frequency selector (1–5 sessions/week), server-side variant resolution, first-cycle-vs-regular recurring pricing model, Stripe Checkout customer association, webhook-confirmed activation, and the 28-day recurring billing architecture without changing the approved public-site design.