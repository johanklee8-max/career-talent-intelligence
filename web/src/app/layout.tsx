import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Career Atlas | Talent Intelligence',description:'No-login CV review, career discovery and sourced job listings'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
