import type { Metadata } from "next";
import "./globals.css";
import Tracking from "./tracking";
export const metadata: Metadata = {
  metadataBase: new URL("https://www.hgrandperformance.com"),
  title: { default: "HGrand Fitness & Performance | Entrenamiento y nutrición a tu medida", template: "%s | HGrand Fitness & Performance" },
  description: "Entrenador personal online y preparación física en Miami con Herlin Miranda. Fitness, nutrición y seguimiento semanal adaptados a tu objetivo.",
  alternates:{canonical:"/"},
  openGraph:{type:"website",locale:"es_US",url:"/",siteName:"HGrand Fitness & Performance",title:"HGrand Fitness & Performance | Entrenamiento y nutrición a tu medida",description:"Entrenador personal online y preparación física en Miami con Herlin Miranda.",images:[{url:"/og-home.jpg",width:1200,height:630,alt:"HGrand Fitness & Performance · tu progreso tiene un plan"}]},
  twitter:{card:"summary_large_image",title:"HGrand Fitness & Performance | Entrenamiento y nutrición",description:"Tu progreso tiene un plan con Herlin Miranda en Miami y online.",images:["/og-home.jpg"]},
  icons:{icon:[{url:"/favicon.svg?v=red-h-1",type:"image/svg+xml"},{url:"/favicon-32x32.png?v=red-h-1",sizes:"32x32"},{url:"/favicon-16x16.png?v=red-h-1",sizes:"16x16"}],apple:"/apple-touch-icon.png?v=red-h-1",shortcut:"/favicon.ico?v=red-h-1"},
  manifest:"/manifest.webmanifest",
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
 return <html lang="es"><body>{children}<Tracking/></body></html>;
}
