import {env} from 'cloudflare:workers';
import type {ChatGPTUser} from '@/app/chatgpt-auth';

export const isCoach=(user:ChatGPTUser)=>user.email.toLowerCase()==='herlingym@gmail.com';
export function database(){if(!env.DB)throw new Error('DB unavailable');return env.DB}
export function filesBucket(){if(!env.BUCKET)throw new Error('Files unavailable');return env.BUCKET}
export async function allowedStudent(user:ChatGPTUser,requested:string|null){
 const target=isCoach(user)&&requested?requested:user.userId;
 if(!target||target.length>160)return null;
 const profile=await database().prepare('SELECT user_id FROM student_profiles WHERE user_id = ?').bind(target).first();
 return profile?target:null;
}
export type StoredFile={id:string;student_id:string;kind:string;label:string;filename:string;mime:string;created_at:string};
export async function spaceData(studentId:string,before:string|null=null){
 const parts=before?.split('|');
 const cursor=parts?.length===2&&/^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(parts[0])&&/^[a-f0-9-]{36}$/.test(parts[1])?parts:null;
 const [f,m]=await Promise.all([
  database().prepare('SELECT id, student_id, kind, label, filename, mime, created_at FROM student_files WHERE student_id = ? ORDER BY created_at DESC LIMIT 100').bind(studentId).all<StoredFile>(),
  cursor?database().prepare('SELECT id, sender_id, body, created_at FROM student_messages WHERE student_id = ? AND (created_at < ? OR (created_at = ? AND id < ?)) ORDER BY created_at DESC, id DESC LIMIT 51').bind(studentId,cursor[0],cursor[0],cursor[1]).all<{id:string;sender_id:string;body:string;created_at:string}>():
   database().prepare('SELECT id, sender_id, body, created_at FROM student_messages WHERE student_id = ? ORDER BY created_at DESC, id DESC LIMIT 51').bind(studentId).all<{id:string;sender_id:string;body:string;created_at:string}>(),
 ]);
 const page=m.results.slice(0,50);
 return {files:f.results,messages:page.reverse(),nextBefore:m.results.length>50&&page.length?`${page[0].created_at}|${page[0].id}`:null};
}
