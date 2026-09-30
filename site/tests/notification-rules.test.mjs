import {test} from 'node:test';
import assert from 'node:assert/strict';
import {miamiDate,validDate,daysUntil,dueLabel,safeAdminLink,visibleAlert} from '../lib/notification-rules.ts';
test('Miami day differs from UTC near midnight, including DST',()=>{assert.equal(miamiDate(new Date('2026-09-30T02:00:00Z')),'2026-09-29');assert.equal(miamiDate(new Date('2026-01-01T04:59:00Z')),'2025-12-31')});
test('countdown crosses daylight-saving boundaries by calendar days',()=>{assert.equal(daysUntil('2026-03-09','2026-03-07'),2);assert.equal(daysUntil('2026-11-02','2026-10-31'),2);assert.equal(daysUntil('2026-09-28','2026-09-29'),-1)});
test('invalid calendar dates cannot be stored',()=>{assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('2024-02-29'),true);assert.equal(validDate('bad'),false)});
test('due urgency copy',()=>{assert.match(dueLabel('Pago',0),/VENCE HOY/);assert.match(dueLabel('Pago',-2),/vencido/);assert.equal(dueLabel('Pago',7),'Pago en 7 días')});
test('snoozed actions return at exact expiration; resolved stay hidden',()=>{assert.equal(visibleAlert({resolved_at:null,snoozed_until:'2026-10-01T00:00:00Z'},'2026-09-30T23:59:59Z'),false);assert.equal(visibleAlert({resolved_at:null,snoozed_until:'2026-10-01T00:00:00Z'},'2026-10-01T00:00:00Z'),true);assert.equal(visibleAlert({resolved_at:'2026-01-01',snoozed_until:null}),false)});
test('deep links encode identity without breaking section navigation',()=>{const value=safeAdminLink('mensajes','a&b','a+b@example.com');const u=new URL(value,'https://example.com');assert.equal(u.searchParams.get('student'),'a&b');assert.equal(u.searchParams.get('email'),'a+b@example.com');assert.equal(u.hash,'#mensajes')});
