import {getChatGPTUser} from '@/app/chatgpt-auth';
import {saveProfile} from '@/lib/profile';
import {handleProfilePost} from '@/lib/profile-request';
export const dynamic='force-dynamic';
export async function POST(request:Request){return handleProfilePost(request,await getChatGPTUser(),saveProfile)}
