// Deliberately no fetch handler/cache: private student data must stay online.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>event.waitUntil(self.registration.showNotification('H GRAND ALERTAS',{body:'Tienes acciones pendientes. Abre el administrador para revisarlas.',icon:'/admin/icon-192.png',badge:'/admin/icon-192.png',tag:'hgrand-actions',data:{url:'/admin/alertas'}})));
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of windows){if(new URL(client.url).origin===self.location.origin&&new URL(client.url).pathname.startsWith('/admin')){await client.navigate('/admin/alertas');return client.focus()}}return self.clients.openWindow('/admin/alertas')})())});
