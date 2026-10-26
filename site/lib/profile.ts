import {env} from 'cloudflare:workers';
import type {PlanKey} from './plans';
export type Profile={user_id:string;name:string;phone:string;selected_plan:PlanKey;created_at:string;updated_at:string};
function db(){if(!env.DB)throw new Error('Profile storage unavailable');return env.DB}
export async function getProfile(userId:string):Promise<Profile|null>{return db().prepare('SELECT user_id, name, phone, selected_plan, created_at, updated_at FROM student_profiles WHERE user_id = ?').bind(userId).first<Profile>()}
export async function claimEnrollment(userId:string,email:string){
 const normalized=email.trim().toLowerCase();
 const record=await db().prepare('SELECT name, phone, plan, user_id FROM student_enrollments WHERE email = ?').bind(normalized).first<{name:string;phone:string;plan:PlanKey;user_id:string|null}>();
 if(!record||record.user_id&&record.user_id!==userId)return;
 const now=new Date().toISOString();
 await db().prepare('INSERT INTO student_profiles (user_id,name,phone,selected_plan,created_at,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(user_id) DO NOTHING').bind(userId,record.name,record.phone,record.plan,now,now).run();
 await db().prepare('UPDATE student_enrollments SET user_id = ?, updated_at = ? WHERE email = ? AND (user_id IS NULL OR user_id = ?)').bind(userId,now,normalized,userId).run();
}
export async function saveProfile(userId:string,name:string,phone:string,selectedPlan:PlanKey){
 const now=new Date().toISOString();
 await db().prepare('INSERT INTO student_profiles (user_id, name, phone, selected_plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET name = excluded.name, phone = excluded.phone, selected_plan = excluded.selected_plan, updated_at = excluded.updated_at').bind(userId,name,phone,selectedPlan,now,now).run();
}
