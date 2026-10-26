import {registerHooks} from 'node:module';
import {existsSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=new URL('../',import.meta.url),fixture=new URL('./runtime-fixture.mjs',import.meta.url).href;
registerHooks({resolve(specifier,context,next){if(specifier==='cloudflare:workers'||specifier==='@/app/chatgpt-auth')return {url:fixture,shortCircuit:true};if(specifier.startsWith('@/'))return {url:new URL(specifier.slice(2)+'.ts',root).href,shortCircuit:true};if(specifier.startsWith('.')&&context.parentURL?.startsWith(root.href)){const url=new URL(specifier,context.parentURL);if(existsSync(fileURLToPath(url)+'.ts'))return {url:pathToFileURL(fileURLToPath(url)+'.ts').href,shortCircuit:true}}return next(specifier,context)}});
