import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
export let currentUser=null;
export const env={};
export async function getChatGPTUser(){return currentUser}
export function asUser(user){currentUser=user}
export const coach={userId:'coach',email:'herlingym@gmail.com'};
export const student={userId:'student-a',email:'a@example.test'};
export let sqlite;
export function reset(){if(sqlite)sqlite.close();sqlite=new DatabaseSync(':memory:');for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
 class Statement{constructor(sql,args=[]){this.sql=sql;this.args=args}bind(...args){return new Statement(this.sql,args)}async all(){return {results:sqlite.prepare(this.sql).all(...this.args)}}async first(){return sqlite.prepare(this.sql).get(...this.args)||null}async run(){const r=sqlite.prepare(this.sql).run(...this.args);return {meta:{changes:Number(r.changes)}}}}
 env.DB={prepare:sql=>new Statement(sql),batch:async statements=>{sqlite.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};currentUser=coach;
 const now=new Date().toISOString();for(const id of ['student-a','student-b'])sqlite.prepare('INSERT INTO student_profiles VALUES(?,?,?,?,?,?)').run(id,'Alumno de prueba '+id,'','online',now,now);
}
export function enroll(due,checkin=null){const now=new Date().toISOString();sqlite.prepare("INSERT INTO student_enrollments(email,user_id,name,phone,plan,status,billing,notes,created_at,updated_at,next_payment_date,next_checkin_date) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)").run('a@example.test','student-a','Alumno A','','online','active','manual','',now,now,due,checkin)}
