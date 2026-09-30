import {requireChatGPTUser} from '@/app/chatgpt-auth';
import {isCoach} from '@/lib/student-space';
import {notFound} from 'next/navigation';
import AdminDesktop from './admin-desktop';
export const dynamic='force-dynamic';
export const metadata={title:'Escritorio HGrand',robots:{index:false,follow:false}};
export default async function Page(){
 const user=await requireChatGPTUser('/admin');
 if(!isCoach(user))notFound();
 return <AdminDesktop userId={user.userId}/>;
}
