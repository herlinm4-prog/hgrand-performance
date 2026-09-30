import {getChatGPTUser} from '@/app/chatgpt-auth';
import {isCoach} from './student-space';
export async function adminUser(request?:Request){const user=await getChatGPTUser();if(!user||!isCoach(user))return null;if(request){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return null;}return user}
