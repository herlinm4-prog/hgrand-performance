"use client";
import {useEffect} from "react";

declare global { interface Window {dataLayer?:unknown[];gtag?:(...args:unknown[])=>void;fbq?:(...args:unknown[])=>void;_fbq?:unknown} }
const ga=process.env.NEXT_PUBLIC_GA4_ID;
const pixel=process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ads=process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
function inject(src:string){const script=document.createElement("script");script.async=true;script.src=src;document.head.appendChild(script)}
export function track(name:string){if(ga)window.gtag?.("event",name);if(pixel)window.fbq?.("trackCustom",name);if(ads)window.gtag?.("event",name,{send_to:ads});}
export default function Tracking(){useEffect(()=>{
 // Set public IDs in deployment settings to activate. No identifier, no third-party request.
 if(ga||ads){window.dataLayer=window.dataLayer||[];window.gtag=(...args:unknown[])=>{window.dataLayer?.push(args)};window.gtag("js",new Date());if(ga)window.gtag("config",ga);if(ads)window.gtag("config",ads);inject(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga||ads||"")}`)}
 if(pixel){window.fbq=(...args:unknown[])=>{(window.fbq as unknown as {queue?:unknown[][]}).queue?.push(args)};(window.fbq as unknown as {queue?:unknown[][]}).queue=[];inject("https://connect.facebook.net/en_US/fbevents.js");window.fbq("init",pixel);window.fbq("track","PageView")}
 const onClick=(event:MouseEvent)=>{const target=(event.target as HTMLElement).closest<HTMLElement>("[data-track]");const name=target?.dataset.track;if(name)track(name)};document.addEventListener("click",onClick);return()=>document.removeEventListener("click",onClick)
 },[]);return null}
