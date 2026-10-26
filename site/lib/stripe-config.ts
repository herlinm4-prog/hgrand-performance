import {env} from 'cloudflare:workers';
export function stripeKey(){const value=(env as unknown as {STRIPE_SECRET_KEY?:string}).STRIPE_SECRET_KEY;return value&&/^(sk|rk)_(test|live)_[A-Za-z0-9]+$/.test(value)?value:null}
export function stripeTestKey(){const value=stripeKey();return value&&/^(sk|rk)_test_/.test(value)?value:null}
export function stripeMode(){return /^(sk|rk)_live_/.test(stripeKey()||'')?'live':'test'}
export function stripeWebhookSecret(){const value=(env as unknown as {STRIPE_WEBHOOK_SECRET?:string}).STRIPE_WEBHOOK_SECRET;return value?.startsWith('whsec_')?value:null}
export function stripeStatus(){return {keyConfigured:!!stripeKey(),webhookConfigured:!!stripeWebhookSecret(),ready:!!stripeKey()&&!!stripeWebhookSecret(),mode:stripeMode()}}
