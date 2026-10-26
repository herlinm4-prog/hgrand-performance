import {getChatGPTUser} from '@/app/chatgpt-auth';
import {isCoach} from './student-space';
export async function adminUser(){const u=await getChatGPTUser();return u&&isCoach(u)?u:null}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin}
export const privateHeaders={'Cache-Control':'private, no-store'};
